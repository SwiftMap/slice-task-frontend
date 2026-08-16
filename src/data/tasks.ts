// 模拟任务数据 - 实际项目应从后端API获取
export interface Village {
  id: string;
  name: string;
  pmtilesUrl: string;
  minZoom?: number;
  maxZoom?: number;
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

// 村界 PMTiles (参考 dronemap: helper.ts line 66)
const BOUNDARY_PMTILES_URL =
  'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/bianjie.pmtiles';

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

const statusMap: Record<
  Task['status'],
  { text: string; className: string }
> = {
  completed: { text: '已完成', className: 'status-completed' },
  processing: { text: '处理中', className: 'status-processing' },
  pending: { text: '待处理', className: 'status-pending' },
};

export function getTaskById(id: string | null): Task | null {
  if (!id) return null;
  return mockTasks.find((t) => t.id === id) ?? null;
}

export function getStatusInfo(status: Task['status']) {
  return statusMap[status] || statusMap.pending;
}

/**
 * 从 villages 聚合 zoom 范围。若 task.zoomRange 已显式设置则优先返回。
 * @returns "minZoom-maxZoom" 或 undefined
 */
export function getZoomRange(task: Task): string | undefined {
  if (task.zoomRange) return task.zoomRange;
  const zooms = task.villages
    .map((v) => [v.minZoom, v.maxZoom])
    .filter((z): z is [number, number] => typeof z[0] === 'number' && typeof z[1] === 'number');
  if (zooms.length === 0) return undefined;
  const min = Math.min(...zooms.map((z) => z[0]));
  const max = Math.max(...zooms.map((z) => z[1]));
  return `${min}-${max}`;
}
