---
description: API 目录文档规范，定义接口文档的组织和管理方式
type: Permanent
---

# API 文档规范

> 本文档定义了 `api/` 目录中接口文档的组织和编写规范。

## 文档结构

```
api/
├── inbox/              # 未整理的接口文档
├── <domain>/           # 按领域分类的接口文档
└── AGENTS.md           # 本规范文件
```

## 接口文档规范

### 文件命名

- 使用领域前缀 + 操作类型：` <domain>-<operation>.md`
- 示例：`user-getProfile.md`、`message-sendText.md`

### YAML front matter

所有接口文档应包含：

```yaml
---
description: 接口简短描述
method: GET | POST | PUT | DELETE
endpoint: /api/v1/xxx
contract: ../contract/xxx.schema  # 引用对应契约文件
---
```

### 原子化原则

- 每个文件描述一个独立的接口
- 包含请求参数、响应格式、错误码等完整信息

## inbox 子目录

未整理或待完善的接口文档放入 `inbox/`，命名格式：`00-<filename>.md`

## 契约驱动开发

API 开发必须遵循 **契约优先（Contract-First）** 原则：

1. **所有接口契约定义在 `contract/` 目录**，包括接口协议、数据格式、字段类型等
2. **禁止直接修改 `contract/` 文件夹下的任何内容**，包括 `.schema`、`.yaml`、`.json` 等契约文件
3. **不得随意变更已有接口的请求/响应格式**，如需变更必须先修改契约
4. API 实现必须严格遵循 `contract/` 中定义的契约规范

## 相关文档

- [[../docs/AGENTS.md]] - 通用文档规范
- [[../contract/AGENTS.md]] - 契约规范定义

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
