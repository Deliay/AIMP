---
description: API 目录开发规范，定义开发流程和测试要求
type: Permanent
---

# API 开发规范

> 本文档定义了 `api/` 目录中的开发流程和测试要求。

## 相关文档

- [[../docs/AGENTS.md]] - 通用文档规范
- [[../docs/api/AGENTS.md]] - 接口文档规范
- [[../contract/AGENTS.md]] - 契约规范定义

---

## 代码编写前准备

编写代码前必须先运行 schema generator 生成类型定义：

```bash
npm run codegen
```

这确保 GraphQL schema 与 TypeScript 类型保持同步。

---

## 测试规范

### 单元测试要求

所有新增代码必须包含单元测试，覆盖率要求：

| 模块 | 最低覆盖率 |
|------|-----------|
| src/services/ | 80% |
| src/models/ | 80% |
| src/middleware/ | 80% |
| src/resolvers/ | 80% |

测试文件放置在对应模块的 `__tests__/` 目录或 `*.test.ts` 文件中。

### 开发流程

完成代码编写后，必须执行以下步骤：

```bash
# 1. 运行 schema 生成
npm run codegen

# 2. 运行单元测试
npm run test

# 3. 运行构建
npm run build

# 4. 运行 lint
npm run lint
```

所有步骤必须通过才能提交代码。