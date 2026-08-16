// 任务数据种子（编译时使用）
// 实际生产：前端通过 fetch 从 OSS 加载，前端入口在 src/data/api.ts
// 编译脚本：scripts/build_tasks.py
//
// ⚠️ 当本文件改动后，需要运行：
//   python3 scripts/build_tasks.py
// 然后：
//   ossutil cp /data/oss_build/tasks/*.json oss://flash-map-web/data/tasks/

// 村界 PMTiles (参考 dronemap: helper.ts line 66)
const BOUNDARY_PMTILES_URL =
  'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/bianjie.pmtiles';

export interface Village {
  id: string;
  name: string;
  pmtilesUrl: string;
  minZoom?: number;
  maxZoom?: number;
  /** 村界 polygon (GeoJSON)，build_tasks.py 按影像中心村自动注入 */
  polygon?: { type: string; coordinates: any };
  /** 真实村名（如 tif_5 → 哈力拜村） */
  villageName?: string;
}

export interface Task {
  id: string;
  name: string;
  province: string;
  city: string;
  county: string;
  town?: string;
  taskTime: string;
  villageCount: number;
  totalArea: number;
  status: 'completed' | 'processing' | 'pending';
  center: [number, number];
  boundaryPmtilesUrl: string;
  villages: Village[];
  /** 聚合 zoom 范围（min-max），从 villages.minZoom/maxZoom 聚合 */
  zoomRange?: string;
}

export const mockTasks: Task[] = [
  {
    id: 'tumote_left_banner_9',
    name: '土默特左旗数字编号TIF切片任务',
    province: '内蒙古自治区',
    city: '呼和浩特市',
    county: '土默特左旗',
    taskTime: '2026-08-03/04',
    villageCount: 9,
    totalArea: 1850,
    status: 'completed',
    center: [111.51, 40.65],
    boundaryPmtilesUrl: BOUNDARY_PMTILES_URL,
    villages: [
      { id: 'tif_5', name: '整块切片 #5 (5.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_5.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: 'tif_7', name: '整块切片 #7 (7.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_7.pmtiles', minZoom: 9, maxZoom: 20 },
      { id: 'tif_8', name: '整块切片 #8 (8.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_8.pmtiles', minZoom: 9, maxZoom: 20 },
      { id: 'tif_9', name: '整块切片 #9 (9.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_9.pmtiles', minZoom: 11, maxZoom: 20 },
      { id: 'tif_10', name: '整块切片 #10 (10.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_10.pmtiles', minZoom: 9, maxZoom: 20 },
      { id: 'tif_11', name: '整块切片 #11 (11.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_11.pmtiles', minZoom: 11, maxZoom: 20 },
      { id: 'tif_12', name: '整块切片 #12 (12.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_12.pmtiles', minZoom: 10, maxZoom: 20 },
      { id: 'tif_13', name: '整块切片 #13 (13.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_13.pmtiles', minZoom: 10, maxZoom: 20 },
      { id: 'tif_14', name: '整块切片 #14 (14.tif)', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tumote_left_14.pmtiles', minZoom: 10, maxZoom: 20 },
    ],
    zoomRange: '9-20',
  },
];
