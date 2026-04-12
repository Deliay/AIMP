---
description: AIMP 前端开发规范和项目指南
type: Permanent
---

# AIMP 前端开发指南

## 项目概述

AIMP Web 前端是基于 React 19 + Vite 6 + TypeScript 5.5 构建的即时通讯平台。

## 契约开发

**禁止修改 `contract/` 文件夹的内容**。前端开发必须严格按照 `contract/aimp.schema` 中定义的契约进行接口开发和数据交互。如需变更契约，应先完成 contract 修改并提交，再单独修改其他模块。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React ^19.0, Vite ^6.0, TypeScript ^5.5 |
| UI | Tailwind CSS v4, Radix UI, Lucide React |
| 状态 | Zustand |
| 路由 | React Router v7 |
| HTTP | ky (基于 fetch) |
| 表单 | React Hook Form + Zod |
| 消息渲染 | react-markdown, remark-gfm, dompurify |

## 目录结构

```
src/
├── api/              # API 调用层 (client.ts, auth.ts, chat.ts, auth-request.ts)
├── components/
│   ├── ui/           # 基础 UI 组件 (button, input, card, badge 等)
│   └── features/      # 业务组件 (chat/, auth-request/)
├── hooks/            # 自定义 Hooks
├── lib/              # 工具函数 (utils.ts, constants.ts)
├── pages/            # 页面组件
├── store/            # Zustand Store
├── types/            # TypeScript 类型定义
├── App.tsx
├── main.tsx
└── routes.tsx
```

## 开发规范

### 组件规范

- 文件命名：PascalCase (如 `ChatWindow.tsx`)
- Props 接口：`ComponentNameProps`
- 强制类型检查，禁止使用 `any`

### 状态管理

- Zustand store 按领域拆分 (auth-store, chat-store, auth-request-store)
- 异步操作在 store action 中处理

### API 规范

- 统一通过 `src/api/` 层的 ky 实例调用
- 请求/响应类型完整定义在 `src/types/`
- 禁止直接使用 fetch/axios

### 安全

- Markdown 内容经 DOMPurify 消毒
- Token 存储使用 httpOnly cookie 或 memory storage

## 相关文档

- [[00-tech-stack]] - 前端技术方案详述
- [[../engineering/01-DEVELOPMENT-GUIDELINES]] - 工程开发规范
