---
description: AIMP CLI 开发规范，定义命令行工具的代码组织和开发准则
type: Permanent
---

# AIMP CLI 开发规范

> 本文档定义 `cli/` 目录下的 CLI 工具开发规范。

## 契约开发原则

**严格遵循契约开发**：

- CLI 与 AIMP 平台的交互必须严格遵守 `contract/aimp.schema` 定义的接口规范
- 开发前必须先阅读 `contract/AGENTS.md` 了解契约目录规范
- **禁止修改 `contract/` 文件夹下的任何内容**，包括契约定义和变更存档

契约修改需由契约维护方单独处理，CLI 开发应基于现有契约进行。

## 项目结构

```
cli/
├── src/
│   ├── commands/          # Commander.js 命令定义
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   ├── subaccount/
│   │   │   ├── create.ts
│   │   │   └── list.ts
│   │   └── chat/
│   │       ├── send.ts
│   │       ├── receive.ts
│   │       └── history.ts
│   ├── core/              # 核心模块
│   │   ├── auth.ts        # Token 管理
│   │   ├── config.ts      # ~/.aimp/config.json
│   │   └── api-client.ts  # REST API 封装
│   ├── types/
│   │   └── index.ts       # 共享类型定义
│   └── index.ts           # 入口点
├── package.json
├── tsconfig.json
└── README.md
```

## 开发准则

### 命令实现模式

每个命令对应一个文件，遵循以下模式：

```typescript
import { Command } from 'commander'
import { resolve } from '../core/config'
import { apiClient } from '../core/api-client'

export const makeLoginCommand = (program: Command) => {
  program
    .command('login')
    .description('登录 AIMP 平台')
    .requiredOption('--api-key <KEY>', 'API Key')
    .action(async (options) => {
      // 实现逻辑
    })
}
```

### 错误处理规范

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 401 | Token 过期 | 提示重新登录 |
| 403 | 无权限 | 显示权限不足信息 |
| 404 | 资源不存在 | 显示不存在信息 |
| 422 | 参数校验失败 | 显示详细校验错误 |
| 500 | 服务器错误 | 显示服务器错误信息 |

### 配置管理

- 使用 `conf` 库存储配置，路径 `~/.aimp/config.json`
- Token 有效期 7 天，过期需重新登录
- `server_url` 默认 `https://api.aimp.dev`

### 类型定义

所有类型定义统一放在 `src/types/index.ts`：

```typescript
interface TextMessage {
  type: 'text'
  content: string
}

interface FormMessage {
  type: 'form'
  title: string
  fields: FormField[]
  submit_label: string
}

interface FormField {
  type: 'text' | 'select' | 'multiselect'
  name: string
  label: string
  options?: string[]
}
```

## 参考文档

- [[../docs/cli/02-TECHNICAL-PROPOSAL]] - CLI 技术方案
- [[../docs/cli/01-SKILL-TEMPLATE]] - Agent 交互模板

---

## 测试规范

### 单元测试要求

所有新增代码必须包含单元测试，覆盖率要求：

| 模块 | 最低覆盖率 |
|------|-----------|
| src/core/ | 80% |
| src/commands/ | 70% |
| src/types/ | 80% |

测试文件放置在对应模块的 `__tests__/` 目录或 `*.test.ts` 文件中。

### 开发流程

完成代码编写后，必须执行以下步骤：

```bash
# 1. 运行单元测试
npm run test

# 2. 运行类型检查
npm run typecheck

# 3. 运行构建
npm run build

# 4. 运行 lint
npm run lint
```

所有步骤必须通过才能提交代码。
