---
description: API 接口文档规范，定义接口文档的组织和管理方式
type: Permanent
---

# API 接口文档规范

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

- 使用领域前缀 + 操作类型：`<domain>-<operation>.md`
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

- [[../AGENTS.md]] - 通用文档规范
- [[../../contract/AGENTS.md]] - 契约规范定义