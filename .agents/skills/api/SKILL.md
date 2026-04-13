---
name: api
description: "修改 api/ 代码或 api/ 接口文档时加载。USE FOR: 新增/修改 GraphQL resolver、REST 路由、Service、Model、认证中间件、工具函数、接口文档。DO NOT USE FOR: contract/ 契约修改（需先走契约变更流程）、前端代码、CLI 代码。"
---

# API Skill

本 Skill 定义修改 `api/` 目录时必须遵循的所有规范，涵盖代码约定、开发流程、测试要求和文档规范。

## 相关规范文档

修改前必须阅读：

| 文档 | 内容 |
|------|------|
| `docs/api/01-BACKEND-TECHNICAL-DESIGN.md` | 技术架构、数据库设计、API 设计、安全规范 |
| `docs/api/AGENTS.md` | 接口文档规范、契约驱动开发原则 |
| `docs/engineering/01-DEVELOPMENT-GUIDELINES.md` | 契约式开发流程、测试要求、Review 流程 |
| `api/AGENTS.md` | API 目录开发规范、测试覆盖率要求 |
| `contract/AGENTS.md` | 契约目录规范（只读参考） |

---

## 核心原则

### 契约优先（Contract-First）

- **禁止直接修改 `contract/` 目录下的任何文件**（`.schema`、`.yaml`、`.json`）
- 修改 `api/` 与修改 `contract/` 必须分开提交，不得同时进行
- 代码实现必须严格遵循 `contract/aimp.schema`（GraphQL）和 `contract/aimp.auth.yaml`（REST Auth）的定义
- 不得随意变更已有接口的请求/响应格式

### 契约文件位置

```
contract/
├── aimp.schema       # GraphQL Schema（所有 GraphQL 接口的唯一来源）
└── aimp.auth.yaml    # REST OpenAPI（仅限主账号注册/登录/Session）
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| API Framework | Express + Apollo Server (GraphQL) + REST |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | nanoid (API Key) + jsonwebtoken (JWT) |
| 代码生成 | GraphQL Code Generator (`codegen.yml`) |
| 测试框架 | Jest + mongodb-memory-server |

---

## 开发流程

### 标准工作流

```
阅读契约 → npm run codegen → 实现代码 → 编写单元测试 → 请求 Review → Review 通过 → npm run test → npm run build → npm run lint
```

### 必须执行的命令（按顺序）

```bash
# 1. 生成 TypeScript 类型（每次修改前都要先运行）
cd api
npm run codegen

# 2. 运行单元测试
npm run test

# 3. 构建
npm run build

# 4. Lint 检查
npm run lint
```

所有步骤必须通过才能提交代码。

### 代码生成

- `codegen.yml` 配置 GraphQL Code Generator
- 生成输出到 `api/src/__generated__/types.ts`
- 修改任何 GraphQL 相关代码前必须先运行 `npm run codegen`，确保类型同步

## 接口文档规范（docs/api/）

修改 API 接口时，若需同步更新文档，遵循以下规范：

### 文件命名

`<domain>-<operation>.md`，示例：`user-getProfile.md`、`message-sendText.md`

### YAML front matter

```yaml
---
description: 接口简短描述
method: GET | POST | PUT | DELETE
endpoint: /api/v1/xxx
contract: ../contract/xxx.schema
---
```

### 原子化

- 每个文件描述一个独立接口
- 包含请求参数、响应格式、错误码完整信息
- 未整理的文档放入 `docs/api/inbox/`，命名格式 `00-<filename>.md`

---