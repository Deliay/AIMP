# Test 目录规范

> 本目录存放 AIMP 项目的集成验收测试。

## 目录结构

```
test/
├── e2e/                      # 端到端测试
│   ├── skills/              # Playwright Skill 相关资源
│   ├── tools/               # 临时调试工具（截图、日志检查等）
│   └── *.test.ts            # E2E 测试用例
│
├── api/                     # API 契约测试
│   └── *.test.ts            # GraphQL/REST API 测试
│
├── .agents/
│   └── skills/
│       └── playwright-cli/  # Playwright Skill（用于 E2E 测试）
│
└── AGENTS.md               # 本文件
```

## 测试执行原则

### 服务拉起

执行 `test/e2e/` 或 `test/api/` 测试前，必须使用 **Aspire** 拉起真实服务。

#### Aspire 本地开发环境

详细说明见 [[../infra/AGENTS.md]]。

**启动 Aspire**：

```bash
cd ../infra/aspire-local-dev
aspire start
```

**查看资源状态**：

```bash
aspire describe
```

**查看日志**：

```bash
aspire logs [resource]
```

**获取 endpoint**：

```bash
# API endpoint
aspire describe api

# 停止所有资源
aspire stop
```

#### 服务依赖

根据 `apphost.ts` 定义，服务包含：
- `mongo` - MongoDB 数据库
- `api` - 后端 API 服务（Node.js）
- `fe` - 前端 Web 服务

测试执行前需确保 `api` 服务已健康启动。测试应从环境变量或 `aspire describe` 输出获取真实 endpoint。

### 测试隔离

- 每个测试套件使用独立的测试数据库或数据清理机制
- 测试数据应在测试前创建、测试后清理
- 禁止测试之间存在顺序依赖

---

## 1. E2E 测试 (`test/e2e/`)

### 1.1 测试依据

E2E 测试内容必须严格依照 `docs/product/` 下的产品文档编写。

测试用例应覆盖产品文档中定义的所有用户交互流程：

| 产品文档章节 | E2E 测试覆盖 |
|-------------|-------------|
| [[../docs/product/inbox/00-AIMP-PRD]] 3.1 人类侧控制台 | Web Console 功能测试 |
| [[../docs/product/inbox/00-AIMP-PRD]] 3.2 Agent CLI | CLI 命令完整流程测试 |
| [[../docs/product/inbox/00-AIMP-PRD]] 5. 子帐号创建授权流程 | 授权申请-审批完整流程测试 |

### 1.2 测试范围

E2E 测试覆盖产品文档中定义的所有用户交互流程。

### 1.3 Playwright Skill 使用

使用 [[../test/.agents/skills/playwright-cli/SKILL]] 进行 E2E 测试：

```bash
# 启动 Playwright 测试
npx playwright test

# UI 模式调试
npx playwright test --ui

# 生成测试代码
npx playwright test --generate
```

**测试配置**：
- `playwright.config.ts` 中配置 baseURL 指向真实服务
- 使用 `storageState` 管理登录状态
- 视频录制配置见 [[../test/.agents/skills/playwright-cli/references/video-recording]]
- Trace 追踪配置见 [[../test/.agents/skills/playwright-cli/references/tracing]]

### 1.4 临时调试工具 (`test/e2e/tools/`)

临时 E2E 调试工具（如截图、日志检查、网络请求分析等）放置在此目录：

| 工具 | 用途 |
|------|------|
| `take-screenshot.ts` | 页面截图 |
| `check-console.ts` | 检查浏览器控制台错误 |
| `check-network.ts` | 检查网络请求失败 |

这些工具仅用于开发调试，不作为正式测试用例。正式 E2E 测试应编写为 `*.test.ts` 文件。

---

## 2. API 契约测试 (`test/api/`)

### 2.1 测试依据

API 测试必须严格按照 `contract/` 下的 Schema 定义编写：

| Schema 文件 | 测试范围 |
|------------|---------|
| [[../contract/aimp.schema]] | GraphQL API 完整覆盖 |
| [[../contract/aimp.auth.yaml]] | REST Auth API 完整覆盖 |

### 2.2 GraphQL API 测试 (`contract/aimp.schema`)

测试必须覆盖所有 Query 和 Mutation，具体测试用例参见 `contract/` 下的 Schema 定义。

### 2.3 REST Auth API 测试 (`contract/aimp.auth.yaml`)

REST Auth API 测试覆盖 `contract/aimp.auth.yaml` 中定义的所有端点。

### 2.4 测试执行

```bash
# 运行 API 测试
npm run test:api

# 运行 GraphQL schema 验证
npm run test:api:graphql

# 运行 REST API 契约验证
npm run test:api:rest
```

---

## 3. 测试数据管理

### 3.1 测试帐号

测试前创建专用测试帐号：

```
测试人类用户: test-human@aimp.test / Password123!
测试 Agent: test-agent@aimp.test (通过 subaccount 流程创建)
```

### 3.2 测试数据清理

- 测试后清理所有创建的消息、Topic
- 子帐号申请状态需重置
- 使用事务或独立的测试数据库

---

## 相关文档

- [[../infra/AGENTS.md]] - Aspire 本地开发环境使用指南
- [[../docs/product/inbox/00-AIMP-PRD]] - AIMP 产品需求文档
- [[../contract/aimp.schema]] - GraphQL Schema 定义
- [[../contract/aimp.auth.yaml]] - REST API 定义
- [[../test/.agents/skills/playwright-cli/SKILL]] - Playwright 测试 Skill
