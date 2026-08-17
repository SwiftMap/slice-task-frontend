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
    id: 'tumote_left_banner_91',
    name: '土默特左旗数字编号TIF按村提取切片',
    province: '内蒙古自治区',
    city: '呼和浩特市',
    county: '土默特左旗',
    taskTime: '2026-08-03/04',
    villageCount: 64,
    totalArea: 1850,
    status: 'completed',
    center: [111.51, 40.65],
    boundaryPmtilesUrl: BOUNDARY_PMTILES_URL,
    villages: [
      { id: '三两村', villageName: '三两村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/三两村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '三间房村', villageName: '三间房村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/三间房村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '东厂克村', villageName: '东厂克村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/东厂克村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '东花营村', villageName: '东花营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/东花营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '丰厚庄村', villageName: '丰厚庄村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/丰厚庄村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '侯家营村', villageName: '侯家营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/侯家营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '刘家营村', villageName: '刘家营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/刘家营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '刘王庄村', villageName: '刘王庄村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/刘王庄村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '前一间房村', villageName: '前一间房村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/前一间房村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '前朱堡村', villageName: '前朱堡村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/前朱堡村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '北得力图村', villageName: '北得力图村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/北得力图村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '南双树村', villageName: '南双树村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/南双树村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '南小营村', villageName: '南小营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/南小营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '古尔丹巴村', villageName: '古尔丹巴村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/古尔丹巴村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '台阁牧村', villageName: '台阁牧村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/台阁牧村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '吉牙图村', villageName: '吉牙图村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/吉牙图村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '后一间房村', villageName: '后一间房村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/后一间房村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '后朱堡村', villageName: '后朱堡村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/后朱堡村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '呼和浩特金山经济开发区', villageName: '呼和浩特金山经济开发区', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/呼和浩特金山经济开发区.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '哈力拜村', villageName: '哈力拜村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/哈力拜村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '哈沙图村', villageName: '哈沙图村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/哈沙图村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '四得堡村', villageName: '四得堡村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/四得堡村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '大丹巴村', villageName: '大丹巴村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/大丹巴村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '大阿哥村', villageName: '大阿哥村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/大阿哥村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '小丹巴村', villageName: '小丹巴村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/小丹巴村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '小阿哥村', villageName: '小阿哥村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/小阿哥村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '小浑津村', villageName: '小浑津村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/小浑津村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '小洪津村', villageName: '小洪津村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/小洪津村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '店上村', villageName: '店上村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/店上村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '张庄村', villageName: '张庄村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/张庄村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '新德利村', villageName: '新德利村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/新德利村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '本滩村', villageName: '本滩村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/本滩村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '毛扣营村', villageName: '毛扣营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/毛扣营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '沙尔营村', villageName: '沙尔营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/沙尔营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '浑津桥村', villageName: '浑津桥村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/浑津桥村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '潘庄村', villageName: '潘庄村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/潘庄村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '潮忽闹村', villageName: '潮忽闹村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/潮忽闹村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '王气村', villageName: '王气村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/王气村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '甲尔旦村', villageName: '甲尔旦村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/甲尔旦村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '白皮营村', villageName: '白皮营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/白皮营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '章盖营村', villageName: '章盖营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/章盖营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '耿家营村', villageName: '耿家营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/耿家营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '苏庄村', villageName: '苏庄村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/苏庄村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '讨尔号大东营村', villageName: '讨尔号大东营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/讨尔号大东营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '讨尔号庙营村', villageName: '讨尔号庙营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/讨尔号庙营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '赵庄村', villageName: '赵庄村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/赵庄村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '赵家营村', villageName: '赵家营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/赵家营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '达尔架大西营村', villageName: '达尔架大西营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/达尔架大西营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '西花营村', villageName: '西花营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/西花营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '西甲兰营村', villageName: '西甲兰营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/西甲兰营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '西王庄村', villageName: '西王庄村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/西王庄村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '阿林召村', villageName: '阿林召村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/阿林召村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '栽生村', villageName: '栽生村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/栽生村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '羊路什村', villageName: '羊路什村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/羊路什村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '老龙不浪村', villageName: '老龙不浪村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/老龙不浪村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '牌楼板村', villageName: '牌楼板村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/牌楼板村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '袄太村', villageName: '袄太村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/袄太村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '西水泉村', villageName: '西水泉村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/西水泉村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '西厂克村', villageName: '西厂克村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/西厂克村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '阳高村', villageName: '阳高村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/阳高村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '练家营村', villageName: '练家营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/练家营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '沙家营村', villageName: '沙家营村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/沙家营村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '忽尔格气村', villageName: '忽尔格气村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/忽尔格气村.pmtiles', minZoom: 12, maxZoom: 20 },
      { id: '海流村', villageName: '海流村', pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/data/villages/海流村.pmtiles', minZoom: 12, maxZoom: 20 },
    ],
    zoomRange: '12-20',
  },
];