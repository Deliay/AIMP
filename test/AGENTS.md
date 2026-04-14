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
├── cli/                      # CLI 集成测试
│   ├── helpers/             # 测试辅助函数（Aspire、API）
│   └── *.test.js            # CLI 命令测试
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

### 2.1 测试结构

```
test/api/
├── graphql.test.ts   # GraphQL + REST Auth API 契约测试
└── jest.config.js    # Jest 配置
```

### 2.2 测试执行

**前置条件**：必须先启动 Aspire 服务。

```bash
# 1. 启动 Aspire
aspire start

# 2. 获取 API endpoint
aspire describe api

# 3. 设置环境变量并运行测试
export API_URL=<api_endpoint>
cd ../test/api && npm test

# 4. 停止 Aspire
aspire stop
```

测试使用 `supertest` 对运行中的 API 服务发起真实 HTTP 请求，验证 GraphQL 和 REST Auth API 的契约合规性。

---

## 3. CLI 集成测试 (`test/cli/`)

### 3.1 测试结构

```
test/cli/
├── helpers/
│   └── setup.js        # Jest setup（获取 API endpoint、注册测试用户）
├── cli.test.js         # CLI 命令集成测试
├── jest.config.js      # Jest 配置
└── package.json        # 测试依赖
```

### 3.2 测试执行

**前置条件**：必须先启动 Aspire 服务。

```bash
# 1. 启动 Aspire
cd ../infra/aspire-local-dev
aspire start

# 2. 获取 API endpoint
aspire describe api

# 3. 安装依赖
cd ../test/cli && npm install

# 4. 运行测试
npm test

# 5. 停止 Aspire
cd ../infra/aspire-local-dev && aspire stop
```

### 3.3 测试范围

CLI 集成测试覆盖以下场景：

| 测试场景 | 说明 | API 方式 |
|---------|------|----------|
| 用户注册 | 通过 `/api/auth/register` 注册新用户 | REST |
| API Key 登录 | 通过 `/api/auth/cli-login` 登录 | REST |
| CLI 登录 | 测试 `aimp login` 命令 | REST |
| CLI 登出 | 测试 `aimp logout` 命令 | Local |
| CLI whoami | 测试 `aimp whoami` 命令 | GraphQL |
| 子帐号列表 | 测试 `aimp subaccount list` 命令 | GraphQL |
| GraphQL 查询 | 测试 me, subaccounts, topics 查询 | GraphQL |
| GraphQL 变更 | 测试 createSubaccount 变更 | GraphQL |

### 3.4 CLI 与 API 契约

CLI 严格遵循 [[../contract/aimp.schema]] 和 [[../contract/aimp.auth.yaml]] 定义的契约：

**REST API（仅限认证）**：
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/cli-login` - CLI 登录
- `POST /api/auth/session` - Session 刷新
- `DELETE /api/auth/session` - 登出
- `GET /api/auth/me` - 获取当前用户

**GraphQL（数据操作）**：
- `Query.me` - 获取当前用户
- `Query.subaccounts` - 获取子帐号列表
- `Query.topics` - 获取话题列表
- `Query.messages` - 获取消息列表
- `Mutation.createSubaccount` - 创建子帐号
- `Mutation.sendMessage` - 发送消息
- `Mutation.markAsRead` - 标记已读
- `Mutation.regenerateApiKey` - 重新生成 API Key

---

## 4. 测试数据管理

### 4.1 测试帐号

测试前创建专用测试帐号：

```
测试人类用户: test-human@aimp.test / Password123!
测试 Agent: test-agent@aimp.test (通过 subaccount 流程创建)
```

### 4.2 测试数据清理

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
