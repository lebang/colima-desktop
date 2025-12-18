# Colima Desktop

Colima Desktop 是一个基于 Tauri 2 和 Vue 3 的桌面应用程序，用于管理 Colima 和 Docker 镜像。

## 功能特性

- **Colima 管理**: 启动、停止、重启 Colima 虚拟机
- **容器管理**: 查看、启动、停止、删除 Docker 容器
- **镜像管理**: 查看、拉取、删除 Docker 镜像
- **数据卷管理**: 创建、查看、删除数据卷
- **网络管理**: 创建、查看、删除 Docker 网络
- **资源监控**: 实时监控 CPU、内存、磁盘使用情况
- **系统设置**: 配置 Colima 虚拟机参数和镜像加速器

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **构建工具**: Vite 6
- **样式预处理**: Less
- **后端框架**: Tauri 2 (Rust)
- **语言**: JavaScript (前端) + Rust (后端)
- **包管理**: pnpm
- **Node.js 版本**: 22.12.0 (强制限定)

## UI 设计方案

采用 **方案一：经典侧边栏布局**

```
┌─────────────────────────────────────────────────────────┐
│  Logo    Colima Desktop                    [状态] [操作] │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  ☰ 仪表盘  │   仪表盘主区域                              │
│            │   ┌────────┬────────┬────────┬────────┐   │
│  Docker    │   │ Colima │  容器  │  镜像  │ 数据卷 │   │
│  ├─ 容器   │   │  状态  │  统计  │  统计  │  统计  │   │
│  ├─ 镜像   │   └────────┴────────┴────────┴────────┘   │
│  ├─ 数据卷 │                                            │
│  └─ 网络   │   ┌──────────────┬──────────────────────┐ │
│            │   │ Colima 控制  │    资源监控          │ │
│  ⚙ 设置   │   │              │    CPU/内存/磁盘     │ │
│            │   └──────────────┴──────────────────────┘ │
│            │                                            │
│  [折叠]    │   ┌────────────────────────────────────┐  │
│            │   │          快捷操作按钮              │  │
│            │   └────────────────────────────────────┘  │
└────────────┴────────────────────────────────────────────┘
```

## 开发环境要求

- Node.js 22.12.0 (项目已在 package.json 中限定版本)
- Rust 1.70+
- macOS 系统依赖（Xcode Command Line Tools）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发模式

```bash
pnpm tauri dev
```

首次运行会编译 Rust 依赖，可能需要几分钟时间。

### 3. 构建生产版本

```bash
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

## 项目结构

```
colima-desktop/
├── public/                 # 静态资源
│   ├── colima-logo.svg    # 应用 Logo
│   ├── vite.svg
│   ├── vue.svg
│   └── tauri.svg
├── src/                    # 前端源代码
│   ├── main.js            # Vue 应用入口
│   ├── App.vue            # 根组件
│   ├── styles.less        # 全局样式 (Less)
│   ├── components/        # 公共组件
│   │   └── MainLayout.vue # 主布局组件（侧边栏+内容区）
│   ├── views/             # 页面视图
│   │   ├── index.js       # 视图导出
│   │   ├── Dashboard.vue  # 仪表盘页面
│   │   ├── Containers.vue # 容器管理页面
│   │   ├── Images.vue     # 镜像管理页面
│   │   ├── Volumes.vue    # 数据卷管理页面
│   │   ├── Networks.vue   # 网络管理页面
│   │   └── Settings.vue   # 设置页面
│   └── stores/            # Pinia 状态管理
│       ├── index.js       # Store 入口
│       └── colima.js      # Colima 状态
├── src-tauri/             # Tauri/Rust 后端
│   ├── src/
│   │   ├── lib.rs         # Rust 库入口
│   │   └── main.rs        # 主程序入口
│   ├── Cargo.toml         # Rust 依赖配置
│   └── tauri.conf.json    # Tauri 应用配置
├── index.html             # HTML 入口文件
├── vite.config.js         # Vite 构建配置
├── package.json           # 项目配置
└── pnpm-lock.yaml         # pnpm 依赖锁定文件
```

## 页面说明

| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | Dashboard.vue | 总览 Colima 状态、资源监控、快捷操作 |
| 容器管理 | Containers.vue | 容器列表、启动/停止/删除容器 |
| 镜像管理 | Images.vue | 镜像列表、拉取/删除镜像 |
| 数据卷管理 | Volumes.vue | 数据卷列表、创建/删除数据卷 |
| 网络管理 | Networks.vue | 网络列表、创建/删除网络 |
| 设置 | Settings.vue | Colima 配置、镜像加速器、主题设置 |

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动前端开发服务器 |
| `pnpm build` | 构建前端生产版本 |
| `pnpm preview` | 预览构建结果 |
| `pnpm tauri dev` | 启动 Tauri 开发模式（包含热重载） |
| `pnpm tauri build` | 构建完整的桌面应用 |

## 应用配置

- **应用名称**: Colima Desktop
- **应用标识符**: `com.colima.desktop`
- **默认窗口大小**: 800 x 600
- **开发端口**: 1520

## 推荐 IDE 配置

- [VS Code](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 支持
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) - Tauri 支持
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) - Rust 支持

## License

MIT
