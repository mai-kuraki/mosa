# Mosa

高性能桌面图像处理引擎，模拟经典莱卡相机色彩风格。

Mosa 通过 LUT/色彩矩阵渲染管线，模拟经典莱卡相机（M9 CCD、M3 胶片）的色彩科学特性，提供非破坏性编辑、自动水印导出和批量处理能力。

## 功能特性

- **相机风格模拟** -- 莱卡 M9（柯达 KAF-18500 CCD 暖色调）和莱卡 M3（经典胶片质感），基于 3D LUT + 色彩矩阵管线实现
- **非破坏性编辑** -- 所有操作生成 `EditRecipe`（JSON 格式），存储在 SQLite 中；原始文件永不被修改
- **批量处理** -- 通过 Worker Threads 并发为多张图片应用预设
- **自动水印** -- 导出时自动合成水印叠加层
- **撤销/重做** -- 基于 EditRecipe 快照栈（最多 50 步）
- **跨平台** -- macOS (DMG) + Windows (NSIS 安装包)

## 技术栈

| 层级 | 技术 |
|------|------|
| 运行时 | Electron 34（Main + Renderer + Preload 三进程架构） |
| 构建工具 | electron-vite 4 + Turborepo + pnpm workspace |
| 前端 | React 19 + TypeScript 5 + CSS Modules |
| 状态管理 | Zustand 5 |
| 图像处理 | Sharp 0.33 (libvips) + Worker Threads |
| 元数据 | ExifReader |
| 数据库 | Better-SQLite3 (WAL 模式) |
| 打包 | electron-builder |

## 项目结构

```
mosa/
├── apps/desktop/              # Electron 桌面应用
│   ├── electron/              # Main 进程（IPC 处理器、服务、Worker）
│   └── src/                   # Renderer 进程（React UI）
│
├── packages/
│   ├── render-engine/         # 核心渲染引擎（管线阶段、后端抽象、LUT、预设）
│   ├── ipc-bridge/            # 类型安全的 IPC 通道契约
│   ├── ui-kit/                # 包豪斯风格设计系统组件库
│   └── shared-utils/          # 公共工具库（Result<T,E>、哈希、格式检测）
│
├── tooling/                   # 共享 tsconfig 与 eslint 配置
├── turbo.json                 # Turborepo 管线配置
└── pnpm-workspace.yaml
```

## 架构概览

### 渲染管线

```
解码 -> 色彩矩阵 -> 3D LUT -> 色调曲线 -> 胶片颗粒 -> 暗角 -> 水印 -> 编码输出
```

每个阶段实现统一的 `RenderStage` 接口。预设本质上是一组预配置的阶段参数集合。后端抽象层（`backend.interface.ts`）支持 Phase 2 无缝迁移至 WebGL，无需修改管线逻辑。

### IPC 通信流程

```
Renderer (ipc-client.ts) --invoke--> Main (handlers/*.ts) --fork--> Worker Thread (Sharp)
Renderer (onEvent)       <--event--  Main (webContents.send) <--parentPort-- Worker
```

`@mosa/ipc-bridge` 为 Main 和 Renderer 进程间的所有 IPC 通道提供编译时类型安全保障。

### 数据层

- **SQLite 表：** images、folders、edit_recipes、edit_history、presets
- **缩略图缓存：** `{userData}/cache/thumbnails/`（256px JPEG）
- **数据库位置：** `{userData}/database/mosa.db`

## 环境要求

- **Node.js** >= 20.0.0
- **pnpm** >= 10.x

## 快速开始

```bash
# 安装依赖
pnpm install

# 为 Electron 重新编译原生模块
pnpm --filter mosa-desktop exec electron-rebuild -f -w better-sqlite3

# 构建所有 workspace 包
pnpm turbo build

# 启动开发服务器
pnpm --filter mosa-desktop dev
```

## 常用命令

```bash
pnpm turbo build              # 构建所有包
pnpm turbo lint               # 代码检查
pnpm turbo test               # 运行测试
pnpm turbo typecheck          # 类型检查
pnpm turbo clean              # 清理构建产物

pnpm --filter mosa-desktop dev       # 启动 Electron 开发服务器
pnpm --filter mosa-desktop build     # 生产环境构建
pnpm --filter mosa-desktop package   # 打包分发
```

## 产品路线

- **Phase 1 (MVP)：** Sharp 实现的相机风格模拟（莱卡 M9/M3）+ 水印导出 + 批量处理
- **Phase 2 (Pro)：** WebGL 2.0 Shader 实时渲染 + 本地 AI 语义调色
- **Phase 3 (Open)：** 预设分享社区 + 核心渲染管线开源

## 许可证

[Apache License 2.0](LICENSE)
