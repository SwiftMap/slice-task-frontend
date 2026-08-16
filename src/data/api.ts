// 任务数据 API 客户端
// 列表 JSON 路径：OSS bucket flash-map-web/data/tasks/tasks.json
// 详情 JSON 路径：OSS bucket flash-map-web/data/tasks/<task_id>.json
// 数据由 scripts/build_tasks.py 从 src/data/tasks.ts 编译生成。

export interface Village {
  id: string;
  name: string;
  pmtilesUrl: string;
  minZoom?: number;
  maxZoom?: number;
  /** 可选 polygon 几何（用于村外 mask 显示） */
  polygon?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
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
  zoomRange?: string;
}

/** 列表项（薄） */
export interface TaskListItem {
  id: string;
  name: string;
  region: {
    province: string;
    city: string;
    county: string;
    town?: string | null;
  };
  taskTime: string;
  villageCount: number;
  totalArea: number;
  status: 'completed' | 'processing' | 'pending';
  zoomRange?: string;
  center: [number, number];
  detailUrl: string;
}

/** 列表 JSON 顶层结构 */
export interface TasksListResponse {
  updatedAt: string;
  sourceVersion: number;
  count: number;
  tasks: TaskListItem[];
}

/** 任务列表在 OSS 上的 URL */
export const TASKS_LIST_URL =
  'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/tasks/tasks.json';

/**
 * 拉取任务列表（薄，列表用）
 */
export async function fetchTasksList(): Promise<TaskListItem[]> {
  const resp = await fetch(TASKS_LIST_URL, {
    cache: 'no-cache', // 允许开发调试时重新拉取，生产可改成带版本
  });
  if (!resp.ok) {
    throw new Error(`fetch tasks.json 失败: HTTP ${resp.status}`);
  }
  const data: TasksListResponse = await resp.json();
  if (!data || !Array.isArray(data.tasks)) {
    throw new Error('tasks.json 格式异常：缺少 tasks 数组');
  }
  return data.tasks;
}

/**
 * 拉取任务详情（厚，含 villages）
 * @param detailUrl 列表项中的 detailUrl
 */
export async function fetchTaskDetail(detailUrl: string): Promise<Task> {
  const resp = await fetch(detailUrl, { cache: 'no-cache' });
  if (!resp.ok) {
    throw new Error(`fetch ${detailUrl} 失败: HTTP ${resp.status}`);
  }
  const data: Task = await resp.json();
  if (!data || !data.id || !Array.isArray(data.villages)) {
    throw new Error('详情 JSON 格式异常');
  }
  return data;
}

/**
 * 状态码 → 中文 + 样式
 */
export const TASK_STATUS_MAP: Record<
  Task['status'],
  { text: string; className: string }
> = {
  completed: { text: '已完成', className: 'status-completed' },
  processing: { text: '处理中', className: 'status-processing' },
  pending: { text: '待处理', className: 'status-pending' },
};

export function getStatusInfo(status: Task['status']) {
  return TASK_STATUS_MAP[status] || TASK_STATUS_MAP.pending;
}

/**
 * 聚合 zoom 范围
 */
export function getZoomRange(task: Task): string | undefined {
  if (task.zoomRange) return task.zoomRange;
  const zooms = task.villages
    .map((v) => [v.minZoom, v.maxZoom])
    .filter(
      (z): z is [number, number] =>
        typeof z[0] === 'number' && typeof z[1] === 'number'
    );
  if (zooms.length === 0) return undefined;
  const min = Math.min(...zooms.map((z) => z[0]));
  const max = Math.max(...zooms.map((z) => z[1]));
  return `${min}-${max}`;
}
