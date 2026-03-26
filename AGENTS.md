# Mosa Project Conventions

## UI Components

- Radix UI 是本项目的基础组件库。如果需要的组件在 Radix UI 中存在（如 Button、Tabs、Dialog、Select、Checkbox 等），**必须优先使用 Radix UI 的组件**，而非手写原生 HTML 元素。
- 使用 Radix UI 无样式原语 + 项目自定义样式（LESS modules / CSS variables）的方式组合。
- lucide-react 仅用于图标，不是 UI 组件库。
