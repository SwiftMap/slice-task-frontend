# 切片任务前端 (slice-task-frontend)

无人机影像切片任务管理与可视化系统前端。

🌐 在线地址：https://task.flashmap.cn/

## 🛠️ 技术栈

- **构建工具**: Vite 5
- **框架**: React 18 + TypeScript 5
- **地图**: MapLibre GL JS 4.7
- **数据协议**: PMTiles 3.2
- **底图**: 天地图 (T=img_w + T=cva_w)

## 📁 项目结构

```
slice-task-frontend/
├── src/
│   ├── main.tsx           # 首页入口 (Vite)
│   ├── main-task.tsx      # 详情页入口 (Vite)
│   ├── App.tsx            # 首页任务列表组件
│   ├── TaskDetail.tsx     # 详情页含地图组件
│   ├── data/tasks.ts      # 模拟任务数据
│   └── styles/global.css  # 全局样式
├── index.html             # 首页 HTML (Vite 入口)
├── task.html              # 详情页 HTML (Vite 入口)
├── vite.config.ts         # Vite 配置 (多页面)
├── tsconfig.json          # TypeScript 配置
├── package.json           # 依赖
├── serve.js               # 本地预览服务器 (express)
├── .github/workflows/
│   └── deploy.yml         # GitHub Actions 自动部署
└── README.md
```

## 🚀 部署流程 (CI)

代码推送到 `main` 或 `master` 分支 → GitHub Actions 自动：

1. 拉取代码
2. 切换到 [npmmirror](https://registry.npmmirror.com) 镜像源
3. `npm install` 安装依赖
4. `npm run build` 用 Vite 构建生产产物（输出到 `dist/`）
5. SCP 上传到 `120.55.47.148:/var/www/html/task/`
6. 远程解压部署

## 🖥️ 本地开发

> ⚠️ **注意**：本地环境因为网络限制 `npm install` 通常会超时（境外npm被墙）。
> 推荐直接通过 CI 部署后的线上版本调试，本地只做代码编辑。

如果一定要本地跑：

```bash
# 1. 切换镜像
npm config set registry https://registry.npmmirror.com

# 2. 安装依赖（如果网络可达）
npm install

# 3. 启动 Vite dev server
npm run dev
# 访问 http://localhost:3000/
```

## 📊 当前已部署任务

| 任务 | 区域 | 状态 |
|---|---|---|
| 土默特左旗无人机切片任务 | 内蒙古 / 呼和浩特 / 土默特左旗 | 已完成 |
| 皂户李镇皂户李联村切片任务 | 山东 / 滨州 / 惠民县 | 已完成 |
| 砚池山村切片任务 | 云南 / 昭通 / 鲁甸县 | 已完成 |
| 通辽扎鲁特旗西萨拉嘎查切片任务 | 内蒙古 / 通辽 / 扎鲁特旗 | 已完成 |

## 🔧 配置说明

### 天地图 Token

`src/TaskDetail.tsx` 中的 `TIANDITU_TOKEN`：
```
b88bfb160c81dab8d9d20aaa74846360
```

如需更换，编辑该常量后重新部署即可。

### PMTiles 协议

通过 `pmtiles` 包的 `Protocol` 类注册到 maplibre-gl：

```typescript
import { Protocol } from 'pmtiles';
import maplibregl from 'maplibre-gl';

const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
```

之后即可用 `pmtiles://https://example.com/xxx.pmtiles` 作为 source URL。

## 📝 License

ISC