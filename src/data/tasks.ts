// 模拟任务数据 - 实际项目应从后端API获取
export interface Village {
  id: string;
  name: string;
  pmtilesUrl: string;
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
}

const BOUNDARY_URL =
  'https://flash-map-web.oss-cn-beijing.aliyuncs.com/bianjie.pmtiles';

export const mockTasks: Task[] = [
  {
    id: 'tumote_left_20250814',
    name: '土默特左旗无人机切片任务',
    province: '内蒙古自治区',
    city: '呼和浩特市',
    county: '土默特左旗',
    taskTime: '2025-08-14',
    villageCount: 34,
    totalArea: 1850,
    status: 'completed',
    center: [111.4, 40.6],
    boundaryPmtilesUrl: BOUNDARY_URL,
    villages: [
      {
        id: 'sanliang',
        name: '三两村',
        pmtilesUrl:
          'https://flash-map-web.oss-cn-beijing.aliyuncs.com/san_liang_cun.pmtiles',
      },
      {
        id: 'tumote_left_5',
        name: '土默特左旗(整体)',
        pmtilesUrl:
          'https://flash-map-web.oss-cn-beijing.aliyuncs.com/tumote_left_5.pmtiles',
      },
    ],
  },
  {
    id: 'zhaohu_lian_20250528',
    name: '皂户李镇皂户李联村切片任务',
    province: '山东省',
    city: '滨州市',
    county: '惠民县',
    town: '皂户李镇',
    taskTime: '2025-05-28',
    villageCount: 1,
    totalArea: 18.34,
    status: 'completed',
    center: [117.5, 37.4],
    boundaryPmtilesUrl: BOUNDARY_URL,
    villages: [
      {
        id: 'zaohu_lian',
        name: '皂户李联村',
        pmtilesUrl:
          'https://flash-map-web.oss-cn-beijing.aliyuncs.com/zaohu_lian.pmtiles',
      },
    ],
  },
  {
    id: 'yanshichi_20250528',
    name: '砚池山村切片任务',
    province: '云南省',
    city: '昭通市',
    county: '鲁甸县',
    town: '文屏镇',
    taskTime: '2025-05-28',
    villageCount: 2,
    totalArea: 12.5,
    status: 'completed',
    center: [103.5, 27.2],
    boundaryPmtilesUrl: BOUNDARY_URL,
    villages: [
      {
        id: 'yanchi_shan_cun',
        name: '砚池山村',
        pmtilesUrl:
          'https://flash-map-web.oss-cn-beijing.aliyuncs.com/yanchi_shan_cun.pmtiles',
      },
      {
        id: 'yang_guang_she_qu',
        name: '阳光社区',
        pmtilesUrl:
          'https://flash-map-web.oss-cn-beijing.aliyuncs.com/yang_guang_she_qu.pmtiles',
      },
    ],
  },
  {
    id: 'tongliao_20250806',
    name: '通辽扎鲁特旗西萨拉嘎查切片任务',
    province: '内蒙古自治区',
    city: '通辽市',
    county: '扎鲁特旗',
    taskTime: '2025-08-06',
    villageCount: 1,
    totalArea: 25.6,
    status: 'completed',
    center: [120.9, 44.5],
    boundaryPmtilesUrl: BOUNDARY_URL,
    villages: [
      {
        id: 'xila_gacha',
        name: '西萨拉嘎查',
        pmtilesUrl:
          'https://flash-map-web.oss-cn-beijing.aliyuncs.com/xila_gacha.pmtiles',
      },
    ],
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