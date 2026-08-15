# 切片任务管理前端

无人机影像切片任务管理系统前端。

## 功能
- 任务列表首页：展示所有切片任务，支持查看统计信息（任务时间、村庄数量、覆盖面积、行政区划）
- 任务详情页：显示任务信息、村界地图、村庄下拉选择切换不同村庄的无人机影像

## 技术栈
- 纯静态HTML + React 18 UMD (CDN)
- Ant Design (CDN)
- MapLibre GL + PMTiles (CDN)

## 本地开发

```bash
# 启动本地预览服务器 (端口 3000)
npm install
npm start
```

## 部署

通过 GitHub Actions 自动部署到 `task.flashmap.cn`。

- 服务器: `map.flashmap.cn` (120.55.47.148)
- 部署路径: `/var/www/html/task/`
- nginx配置: `/etc/nginx/sites-enabled/task.flashmap.cn.conf`
- SSL: Let's Encrypt (自动续期)

### 触发部署
推送到 `main` 分支自动触发部署。

### 手动触发
在 GitHub Actions 页面点击 "Run workflow"。

## 目录结构

```
.
├── index.html          # 任务列表首页
├── task.html           # 任务详情页
├── README.md           # 本文件
├── package.json        # Node.js 项目配置 (仅本地预览用)
├── serve.js            # 本地预览服务器
└── .github/workflows/  # GitHub Actions 配置
    └── deploy.yml      # 自动部署配置
```

## API 集成

当前使用前端模拟数据。如需对接真实后端API：
1. 修改 `index.html` 中的 `mockTasks` 数组为 `fetch('/api/tasks')`
2. 修改 `task.html` 中的 `getTaskDetail()` 为 `fetch('/api/tasks/' + taskId)`
3. 在 `task.html` 中修改 `villages` 数据的获取方式

## 任务数据结构

```js
{
  id: 'tumote_left_20250814',
  name: '土默特左旗无人机切片任务',
  province: '内蒙古自治区',
  city: '呼和浩特市',
  county: '土默特左旗',
  town: '',  // 可选
  taskTime: '2025-08-14',  // YYYY-MM-DD
  villageCount: 34,
  totalArea: 1850,  // 单位 km²
  center: [111.4, 40.6],  // 经度, 纬度
  boundaryPmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/bianjie.pmtiles',
  villages: [
    {
      id: 'san_liang_cun',
      name: '三两村',
      pmtilesUrl: 'https://flash-map-web.oss-cn-beijing.aliyuncs.com/san_liang_cun.pmtiles'
    }
  ]
}
```