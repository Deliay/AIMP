---
name: fe
description: "修改 fe/ 代码或 fe/ 文档时加载。USE FOR: 新增/修改 React 组件、Hooks、Store、API 层、页面、样式、路由、工具函数。DO NOT USE FOR: contract/ 契约修改（需先走契约变更流程）、api/ 代码、CLI 代码。"
---

# FE Skill

本 Skill 定义修改 `fe/` 目录时必须遵循的所有规范，涵盖代码约定、开发流程、测试要求和文档规范。

## 相关规范文档

修改前必须阅读：

| 文档 | 内容 |
|------|------|
| `docs/fe/00-tech-stack.md` | 技术方案、组件设计、状态管理、API 层设计 |
| `fe/AGENTS.md` | 前端开发规范、测试覆盖率要求 |
| `docs/engineering/01-DEVELOPMENT-GUIDELINES.md` | 契约式开发流程、测试要求、Review 流程 |
| `contract/AGENTS.md` | 契约目录规范（只读参考） |

---

## 核心原则

### 契约优先（Contract-First）

- **禁止直接修改 `contract/` 目录下的任何文件**（`.schema`、`.yaml`、`.json`）
- 修改 `fe/` 与修改 `contract/` 必须分开提交，不得同时进行
- 前端开发必须严格按照 `contract/aimp.schema`（GraphQL）和 `contract/aimp.auth.yaml`（REST Auth）定义的契约进行接口开发和数据交互
- 不得随意变更已有接口的请求/响应格式

### 契约文件位置

```
contract/
├── aimp.schema       # GraphQL Schema（所有 GraphQL 接口的唯一来源）
└── aimp.auth.yaml    # REST OpenAPI（仅限主账号注册/登录/Session）
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React ^19.0, Vite ^6.0, TypeScript ^5.5 |
| UI | Tailwind CSS v4, Radix UI, Lucide React |
| 状态 | Zustand |
| 路由 | React Router v7 |
| HTTP | ky（基于 fetch） |
| 表单 | React Hook Form + Zod |
| 消息渲染 | react-markdown, remark-gfm, dompurify |

---

## 项目结构

```
fe/src/
├── api/              # API 调用层（client.ts, auth.ts, chat.ts, auth-request.ts）
├── components/
│   ├── ui/           # 基础 UI 组件（button, input, card, badge 等）
│   └── features/     # 业务组件（chat/, auth-request/）
├── hooks/            # 自定义 Hooks
├── lib/              # 工具函数（utils.ts, constants.ts）
├── pages/            # 页面组件
├── store/            # Zustand Store
├── types/            # TypeScript 类型定义
├── App.tsx
├── main.tsx
└── routes.tsx
```

### 目录职责约束

- `src/api/` — API 调用层，统一使用 ky 实例，禁止直接使用 fetch/axios
- `src/components/ui/` — 基础 UI 组件，可复用
- `src/components/features/` — 业务组件，按领域组织
- `src/hooks/` — 自定义 Hooks，封装逻辑
- `src/store/` — Zustand Store，按领域拆分
- `src/types/` — TypeScript 类型定义，与契约对应

---

## 开发流程

### 标准工作流

```
阅读契约 → 阅读 fe/AGENTS.md → 阅读 docs/fe/00-tech-stack.md → 实现代码 → 编写单元测试 → 请求 Review → Review 通过 → npm run test → npm run build → npm run lint
```

### 必须执行的命令（按顺序）

```bash
cd fe

# 1. 运行单元测试
npm run test

# 2. 运行类型检查
npm run typecheck

# 3. 构建
npm run build

# 4. Lint 检查
npm run lint
```

所有步骤必须通过才能提交代码。

---

## 测试规范

### 覆盖率要求

| 模块 | 最低覆盖率 |
|------|-----------|
| `src/api/` | 80% |
| `src/store/` | 80% |
| `src/lib/` | 80% |
| `src/hooks/` | 70% |
| `src/components/` | 50% |

### 测试技术

- 测试框架：**Vitest**（Vite 原生支持）
- 测试文件位置：`src/__tests__/*.test.{ts,tsx}` 或对应模块的 `*.test.{ts,tsx}`

### 测试要求

- 每个新增的 API、Store、Hook 必须有对应单元测试
- 测试通过前，需请求 Review，Review 通过后方可继续

---

## 代码约定

### 组件规范

- 文件命名：**PascalCase**（如 `ChatWindow.tsx`）
- Props 接口：`ComponentNameProps`
- 强制类型检查，**禁止使用 any**
- 组件保持单一职责

### 状态管理

- Zustand store 按领域拆分（auth-store, chat-store, auth-request-store）
- 异步操作在 store action 中处理
- 避免在组件中直接修改 store

### API 规范

- 统一通过 `src/api/` 层的 ky 实例调用
- 请求/响应类型完整定义在 `src/types/`
- **禁止直接使用 fetch/axios**

### 安全规范

- Markdown 内容经 DOMPurify 消毒
- Token 存储使用 httpOnly cookie 或 memory storage

### 样式规范

- 使用 Tailwind CSS v4 原子化 CSS
- 组件样式使用 clsx + tailwind-merge 拼接
- 保持样式一致性，参照 `src/components/ui/` 中的基础组件

---

## GraphQL 和 REST API 快速参考

查看`contract/`文件夹中的定义

## 相关文档

- [[../fe/AGENTS.md]] - 前端开发规范
- [[../engineering/01-DEVELOPMENT-GUIDELINES]] - 工程开发规范
- [[../../docs/fe/00-tech-stack]] - 前端技术方案详述
- [[../../contract]] - 接口与数据格式定义
