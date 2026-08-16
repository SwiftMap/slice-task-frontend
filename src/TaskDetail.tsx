import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MaplibreMap, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import { getTaskById, type Task, getStatusInfo } from './data/tasks';

// 注册 PMTiles 协议（让 maplibre-gl 能直接加载 .pmtiles 瓦片）
let protocolRegistered = false;
function ensurePMTilesProtocol() {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  protocolRegistered = true;
}

// 天地图 token
const TIANDITU_TOKEN = 'b88bfb160c81dab8d9d20aaa74846360';

// 天地图底图源（多域名 fallback）
const tiandituSubdomains = [1, 2, 3, 4, 5, 6, 7];
const tiandituImgTiles = tiandituSubdomains.map(
  (i) =>
    `https://t${i}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=${TIANDITU_TOKEN}`
);
const tiandituCvaTiles = tiandituSubdomains.map(
  (i) =>
    `https://t${i}.tianditu.gov.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}&tk=${TIANDITU_TOKEN}`
);

function buildStyle(center: [number, number]): StyleSpecification {
  return {
    version: 8,
    sources: {
      'tianditu-img': {
        type: 'raster',
        tiles: tiandituImgTiles,
        tileSize: 256,
        maxzoom: 18,
      },
      'tianditu-cva': {
        type: 'raster',
        tiles: tiandituCvaTiles,
        tileSize: 256,
        maxzoom: 18,
      },
    },
    layers: [
      {
        id: 'tianditu-img',
        type: 'raster',
        source: 'tianditu-img',
        minzoom: 0,
        maxzoom: 22,
      },
      {
        id: 'tianditu-cva',
        type: 'raster',
        source: 'tianditu-cva',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  };
}

export default function TaskDetail() {
  const taskId = getUrlParameter('id');
  const [task] = useState<Task | null>(() => getTaskById(taskId));
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

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

    map.on('load', () => {
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
      setMapReady(true);
    });

    map.on('error', (e) => {
      console.warn('MapLibre error:', e);
    });

    mapRef.current = map;

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [task?.id]);

  // 切换选中村庄时，加载该村庄的 PMTiles 并自动缩放到该村庄的边界
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !task || !mapReady || !selectedVillage) return;

    const village = task.villages.find((v) => v.id === selectedVillage);
    if (!village) return;

    const sourceId = `village-${village.id}`;
    if (map.getLayer(`${sourceId}-raster`)) {
      map.removeLayer(`${sourceId}-raster`);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
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
        let minLon = 0, minLat = 0, maxLon = 0, maxLat = 0;
        if (specVersion === 3) {
          minLon = dv.getInt32(102, true) / 1e7;
          minLat = dv.getInt32(106, true) / 1e7;
          maxLon = dv.getInt32(110, true) / 1e7;
          maxLat = dv.getInt32(114, true) / 1e7;
        }

        // 添加 raster 源（必须用 pmtiles:// 协议，否则 MapLibre 会把 .pmtiles 当成普通瓦片 URL 一直下载）
        // 图层顺序：raster 影像在最下 → village-boundary-line（村界描边）→ village-boundary-label（村名）
        // 通过 beforeId 指向村界图层，让 raster 影像插到村界之下
        map.addSource(sourceId, {
          type: 'raster',
          url: `pmtiles://${village.pmtilesUrl}`,
          tileSize: 256,
          bounds: [minLon, minLat, maxLon, maxLat],
        });
        const beforeBoundaryId = map.getLayer('village-boundary-line')
          ? 'village-boundary-line'
          : undefined;
        map.addLayer(
          {
            id: `${sourceId}-raster`,
            type: 'raster',
            source: sourceId,
            minzoom: 0,
            maxzoom: 22,
            paint: { 'raster-opacity': 0.9 },
          },
          beforeBoundaryId,
        );

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
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([centerLon, centerLat])
          .addTo(map);
        markerRef.current = marker;

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
      } catch (e) {
        console.warn('村庄 PMTiles metadata 读取失败:', e);
        // 降级：仅加载栅格，不缩放（同样要用 pmtiles:// 协议）
        try {
          map.addSource(sourceId, {
            type: 'raster',
            url: `pmtiles://${village.pmtilesUrl}`,
            tileSize: 256,
          });
          // 插到村界之下，让村界线 + 村名标注在影像上方
          const beforeBoundaryId = map.getLayer('village-boundary-line')
            ? 'village-boundary-line'
            : undefined;
          map.addLayer(
            {
              id: `${sourceId}-raster`,
              type: 'raster',
              source: sourceId,
              minzoom: 0,
              maxzoom: 22,
              paint: { 'raster-opacity': 0.9 },
            },
            beforeBoundaryId,
          );
        } catch (e2) {
          console.warn('村庄 PMTiles 加载失败:', e2);
        }
      }
    })();
  }, [selectedVillage, mapReady, task]);

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