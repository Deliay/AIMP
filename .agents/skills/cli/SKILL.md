---
name: cli
description: CLI 工具开发 Skill，当修改 cli/ 或 docs/cli/ 时触发。DO NOT USE FOR: contract/ 契约修改（需先走契约变更流程）、前端代码、API 代码。
---

> 本 Skill 定义 Agent 如何使用和开发 AIMP CLI 工具，包括命令使用、代码编写和文档维护。

# AIMP CLI Skill

## 触发条件

修改以下内容时触发本 Skill：

- `cli/` 目录下的任何代码
- `docs/cli/` 目录下的任何文档

## 核心原则

### 契约优先

CLI 与 AIMP 平台的交互必须严格遵守 `contract/aimp.schema` 定义的接口规范：

- 开发前必须先阅读 `contract/AGENTS.md` 了解契约目录规范
- **禁止修改 `contract/` 文件夹下的任何内容**
- 契约修改需由契约维护方单独处理

### 文档同步

修改 CLI 功能时，必须同步更新相关文档：

- `docs/cli/01-SKILL-TEMPLATE.md` - Agent 交互示例
- `docs/cli/02-TECHNICAL-PROPOSAL.md` - 技术方案
- `cli/README.md` - 用户使用文档

## 开发流程

### 1. 代码开发

遵循 `cli/AGENTS.md` 定义的开发准则：

```
cli/
├── src/
│   ├── commands/      # Commander.js 命令定义
│   ├── core/          # 核心模块 (auth.ts, config.ts, api-client.ts)
│   └── types/
│       └── index.ts   # 共享类型定义
```

命令实现模式：

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

### 2. 错误处理

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 401 | Token 过期 | 提示重新登录 |
| 403 | 无权限 | 显示权限不足信息 |
| 404 | 资源不存在 | 显示不存在信息 |
| 422 | 参数校验失败 | 显示详细校验错误 |
| 500 | 服务器错误 | 显示服务器错误信息 |

### 3. 测试要求

遵循 `docs/engineering/01-DEVELOPMENT-GUIDELINES.md` 的测试规范：

| 模块 | 最低覆盖率 |
|------|-----------|
| src/core/ | 80% |
| src/commands/ | 70% |
| src/types/ | 80% |

### 4. 代码完成检查

完成代码编写后，必须执行：

```bash
# 1. Contract Schema Generator（确保契约一致）
npm run generate:contract

# 2. 单元测试
npm run test

# 3. 类型检查
npm run typecheck

# 4. Lint 检查
npm run lint

# 5. 构建
npm run build
```

## CLI 命令参考

### 认证命令

```bash
# 登录
aimp login --api-key <KEY>

# 登出
aimp logout
```

### 子帐号命令

```bash
# 创建子帐号
aimp subaccount create --name <NAME> --purpose <PURPOSE> --reason <REASON> [--wait]

# 列出子帐号
aimp subaccount list
```

### 消息命令

```bash
# 发送消息
aimp chat send --to <TARGET_ID> --type <text|form> --content <JSON> [--wait]

# 接收消息
aimp chat receive --from <TARGET_ID>

# 聊天历史
aimp chat history [--tail N]
```

## 类型定义

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

## 相关文档

- [[../../docs/cli/01-SKILL-TEMPLATE]] - Agent 交互模板
- [[../../docs/cli/02-TECHNICAL-PROPOSAL]] - CLI 技术方案
- [[../../cli/AGENTS]] - CLI 开发规范
- [[../../docs/engineering/01-DEVELOPMENT-GUIDELINES]] - 工程开发规范
