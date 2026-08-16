import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MaplibreMap, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import {
  fetchTasksList,
  fetchTaskDetail,
  getStatusInfo,
  type Task,
} from './data/api';

// 注册 PMTiles 协议（让 maplibre-gl 能直接加载 .pmtiles 瓦片）
let protocolRegistered = false;
function ensurePMTilesProtocol() {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  protocolRegistered = true;
}

// 不需要天地图底图：用户要求只看无人机影像（2026-08-16）
// 底图请求 403（token 失效），且用户明确不需要底图。
// 地图只显示：村界线 + 无人机影像（raster layer，被村界 mask 裁剪）
//
// 村外遮罩 mask（2026-08-16）：
// village_mask.geojson = 挖洞多边形（外环大矩形 + 所有村界环内环），
// fill nonzero 规则：村界外盖背景深色，村界内透出影像。
// 任意 raster layer 都插在 mask 之下 → 任意影像都被村界裁剪。
const VILLAGE_MASK_URL =
  'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/village_mask.geojson';
const BG_COLOR = '#0e1420';

function buildStyle(center: [number, number]): StyleSpecification {
  return {
    version: 8,
    // 无底图源；深色背景，村外区域显示深色，无人机影像更突出
    sources: {},
    layers: [
      {
        id: 'bg',
        type: 'background',
        paint: { 'background-color': '#0e1420' },
      },
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  };
}

type DetailState =
  | { kind: 'loading'; detailUrl?: string }
  | { kind: 'ok'; task: Task }
  | { kind: 'error'; detailUrl?: string; message: string };

export default function TaskDetail() {
  const taskId = getUrlParameter('id');
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [state, setState] = useState<DetailState>({ kind: 'loading' });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // 1. 拉取任务详情：fetch list → 找到当前 id 的 detailUrl → fetch detail
  useEffect(() => {
    if (!taskId) {
      setState({ kind: 'error', message: 'URL 缺少 id 参数' });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchTasksList();
        if (cancelled) return;
        const item = list.find((t) => t.id === taskId);
        if (!item) {
          setState({
            kind: 'error',
            message: `任务列表里没找到 id=${taskId} 的任务`,
          });
          return;
        }
        const detail = await fetchTaskDetail(item.detailUrl);
        if (cancelled) return;
        setState({ kind: 'ok', task: detail });
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setState({ kind: 'error', message: msg });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  // 2. 加载地图（拿到 task 之后）
  const task = state.kind === 'ok' ? state.task : null;

  useEffect(() => {
    if (!task || !mapContainerRef.current) return;
    ensurePMTilesProtocol();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: buildStyle(task.center),
      center: task.center,
      zoom: 12,
      maxZoom: 20,
      minZoom: 6,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', async () => {
// 添加村界矢量（PMTiles）- 参考 dronemap helper.ts 第92-110行
          // source-layer 'cunjie' 是 bianjie.pmtiles 的实际图层名
          if (task.boundaryPmtilesUrl) {
            try {
              map.addSource('village-boundary', {
                type: 'vector',
                url: `pmtiles://${task.boundaryPmtilesUrl}`,
              });
              try {
                map.addLayer({
                  id: 'village-boundary-line',
                  type: 'line',
                  source: 'village-boundary',
                  'source-layer': 'cunjie',
                  paint: {
                    'line-color': '#e64009ff',
                    'line-width': 2,
                    'line-opacity': 0.85,
                  },
                });
                // 添加村名标注（用 'name' 字段）
                try {
                  map.addLayer({
                    id: 'village-boundary-label',
                    type: 'symbol',
                    source: 'village-boundary',
                    'source-layer': 'cunjie',
                    layout: {
                      'text-field': ['get', 'name'],
                      'text-size': 11,
                      'text-allow-overlap': false,
                    },
                    paint: {
                      'text-color': '#c41d7f',
                      'text-halo-color': '#fff',
                      'text-halo-width': 1.5,
                    },
                  });
                } catch (e) {
                  console.warn('村名标注图层加载失败:', e);
                }
              } catch (e) {
                console.warn('村界线图层加载失败:', e);
              }
            } catch (e) {
              console.warn('村界加载失败:', e);
            }
          }

          // 村外遮罩 mask：挖洞 fill（村界外盖背景色，村界内透出影像）
          // 图层顺序：bg → raster(影像) → mask → 村界线 → 村名
          // raster 动态添加时用 beforeId='village-mask-fill' 插到 mask 之下
          try {
            const maskResp = await fetch(VILLAGE_MASK_URL, { cache: 'no-cache' });
            if (maskResp.ok) {
              const maskData = await maskResp.json();
              map.addSource('village-mask', { type: 'geojson', data: maskData });
              map.addLayer(
                {
                  id: 'village-mask-fill',
                  type: 'fill',
                  source: 'village-mask',
                  paint: { 'fill-color': BG_COLOR, 'fill-opacity': 1 },
                },
                map.getLayer('village-boundary-line')
                  ? 'village-boundary-line'
                  : undefined
              );
              console.log('村外遮罩 mask 已加载');
            } else {
              console.warn(`村外遮罩加载失败: HTTP ${maskResp.status}`);
            }
          } catch (e) {
            console.warn('村外遮罩加载失败（影像将不裁剪）:', e);
          }
      setMapReady(true);
    });

    map.on('error', (e) => {
      console.warn('MapLibre error:', e);
    });

    mapRef.current = map;
    // 调试用：暴露 map 实例到 window
    (window as any).__map = map;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [task?.id]);

  // 切换选中村庄时，加载该村庄的 PMTiles 并自动缩放到该村庄的边界
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !task || !mapReady || !selectedVillage) return;

    const village = task.villages.find((v) => v.id === selectedVillage);
    if (!village) return;

    const sourceId = `village-${village.id}`;
    // 移除旧的 raster layer + source（如果有）
    if (map.getLayer(`${sourceId}-raster`)) {
      map.removeLayer(`${sourceId}-raster`);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
    // 移除旧的 mask layer（村外灰色覆盖）—— 已被 custom WebGL layer 替代
    if (map.getLayer(`${sourceId}-mask`)) {
      map.removeLayer(`${sourceId}-mask`);
    }
    if (map.getSource(`${sourceId}-mask`)) {
      map.removeSource(`${sourceId}-mask`);
    }
    // 移除旧的 custom imagery layer
    if (map.getLayer('village-imagery')) {
      map.removeLayer('village-imagery');
    }
    // 移除旧的村庄名称标注
    if (map.getLayer('village-label')) {
      map.removeLayer('village-label');
    }
    if (map.getSource('village-label')) {
      map.removeSource('village-label');
    }

    // 先尝试读取 PMTiles metadata 获取真实 bounds
    (async () => {
      let minLon = 0, minLat = 0, maxLon = 0, maxLat = 0;
      try {
        const resp = await fetch(village.pmtilesUrl, {
          headers: { Range: 'bytes=0-127' },
        });
        const buf = await resp.arrayBuffer();
        const dv = new DataView(buf);
        // PMTiles v3 header layout (实测 offset):
        // - bytes 0-6: "PMTiles" magic
        // - byte 7: spec version (3)
        // - offset 102: min_lon_e7 (int32 LE) - verified by Python parsing
        // - offset 106: min_lat_e7 (int32 LE)
        // - offset 110: max_lon_e7 (int32 LE)
        // - offset 114: max_lat_e7 (int32 LE)
        const specVersion = dv.getUint8(7);
        if (specVersion === 3) {
          minLon = dv.getInt32(102, true) / 1e7;
          minLat = dv.getInt32(106, true) / 1e7;
          maxLon = dv.getInt32(110, true) / 1e7;
          maxLat = dv.getInt32(114, true) / 1e7;
        }
      } catch (e) {
        console.warn('PMTiles metadata 读取失败，使用 polygon bounds:', e);
      }

      // 若 header 没读到有效 bounds，用 polygon 的 bbox 兜底
      if ((minLon === 0 && minLat === 0 && maxLon === 0 && maxLat === 0) && village.polygon) {
        const poly: any = village.polygon;
        const collect = (coord: number[][]) => {
          for (const [lon, lat] of coord) {
            if (lon < minLon || minLon === 0) minLon = lon;
            if (lat < minLat || minLat === 0) minLat = lat;
            if (lon > maxLon || maxLon === 0) maxLon = lon;
            if (lat > maxLat || maxLat === 0) maxLat = lat;
          }
        };
        if (poly.type === 'Polygon') {
          for (const ring of poly.coordinates as number[][][]) collect(ring);
        } else if (poly.type === 'MultiPolygon') {
          for (const p of poly.coordinates as number[][][][]) for (const ring of p) collect(ring);
        }
      }

      // 添加 raster 源（用 pmtiles:// 协议，和村界 PMTiles 同款可靠加载方式）
      // 图层顺序：背景(bg) → 影像(raster) → mask(村外遮罩) → 村界line → 村名label
      // raster 必须插在 mask 之下：村界外影像被 mask 盖住，村界内透出
      const beforeMaskId = map.getLayer('village-mask-fill')
        ? 'village-mask-fill'
        : map.getLayer('village-boundary-line')
          ? 'village-boundary-line'
          : undefined;
      try {
        map.addSource(sourceId, {
          type: 'raster',
          url: `pmtiles://${village.pmtilesUrl}`,
          tileSize: 256,
          bounds: [minLon, minLat, maxLon, maxLat],
        });
        map.addLayer(
          {
            id: `${sourceId}-raster`,
            type: 'raster',
            source: sourceId,
            minzoom: 0,
            maxzoom: 22,
            paint: { 'raster-opacity': 1 },
          },
          beforeMaskId
        );
      } catch (e) {
        console.warn('影像图层加载失败:', e);
      }

      // 添加村庄名称标注（用 HTML Marker，不依赖 glyphs）
      const centerLon = (minLon + maxLon) / 2;
      const centerLat = (minLat + maxLat) / 2;
      const el = document.createElement('div');
      el.className = 'village-label-marker';
      el.textContent = village.name;
      el.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.75);
        color: #ffeb3b;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        pointer-events: none;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 235, 59, 0.5);
      `;
      // 移除旧的 marker
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (minLon !== maxLon && minLat !== maxLat) {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([centerLon, centerLat])
          .addTo(map);
        markerRef.current = marker;
      }

      // 自动缩放到村庄 bounds
      if (minLon !== maxLon && minLat !== maxLat) {
        map.fitBounds(
          [
            [minLon, minLat],
            [maxLon, maxLat],
          ],
          { padding: 50, duration: 1500, maxZoom: 17 }
        );
      }
    })();
  }, [selectedVillage, mapReady, task]);

  // ===== 渲染 =====
  if (state.kind === 'loading') {
    return (
      <div className="detail-app">
        <div className="detail-header">
          <h1>切片任务详情</h1>
          <a className="btn" href="./index.html">
            ← 返回任务列表
          </a>
        </div>
        <div className="loading-tip">⏳ 正在从 OSS 加载任务详情（id={taskId}）…</div>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="detail-app">
        <div className="detail-header">
          <h1>切片任务详情</h1>
          <a className="btn" href="./index.html">
            ← 返回任务列表
          </a>
        </div>
        <div className="error-tip">
          ❌ 加载任务详情失败：{state.message}
          <br />
          <small>
            数据源：<code>tasks.json</code> + <code>{state.detailUrl ?? '(未找到 detailUrl)'}</code>
          </small>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="detail-app">
        <div className="detail-header">
          <h1>切片任务详情</h1>
          <a className="btn" href="./index.html">
            ← 返回任务列表
          </a>
        </div>
        <div className="no-task">
          <p>未找到任务 {taskId ? `(id=${taskId})` : ''}</p>
        </div>
      </div>
    );
  }

  const status = getStatusInfo(task.status);
  const region = `${task.province} / ${task.city} / ${task.county}${
    task.town ? ' / ' + task.town : ''
  }`;

  return (
    <div className="detail-app">
      <div className="detail-header">
        <h1>
          {task.name}{' '}
          <span className={`status-tag ${status.className}`}>
            {status.text}
          </span>
        </h1>
        <a className="btn" href="./index.html">
          ← 返回任务列表
        </a>
      </div>

      <div className="main-content">
        <div className="info-card">
          <h3>任务信息</h3>
          <div className="detail-stat-item">
            <span className="detail-stat-label">任务 ID</span>
            <span className="detail-stat-value">{task.id}</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">区域</span>
            <span className="detail-stat-value">{region}</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">任务时间</span>
            <span className="detail-stat-value">{task.taskTime}</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">村庄数</span>
            <span className="detail-stat-value">{task.villageCount} 个</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">总面积</span>
            <span className="detail-stat-value">{task.totalArea} km²</span>
          </div>
          <div className="detail-stat-item">
            <span className="detail-stat-label">中心坐标</span>
            <span className="detail-stat-value">
              [{task.center[0].toFixed(3)}, {task.center[1].toFixed(3)}]
            </span>
          </div>

          <div className="village-selector">
            <label htmlFor="village-select">选择村庄查看详情：</label>
            <select
              id="village-select"
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
            >
              <option value="">-- 请选择村庄 --</option>
              {task.villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="map-container">
          {!mapReady && <div className="map-loading">地图加载中...</div>}
          <div ref={mapContainerRef} />
        </div>
      </div>
    </div>
  );
}

function getUrlParameter(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
