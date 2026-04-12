---
description: AIMP 项目测试文档编写规范，定义测试用例文件的组织和管理方式
type: Permanent
---

# 测试文档规范

> 本目录用于存放 AIMP 项目的测试用例文档。

## inbox 子目录

所有未整理的测试文档放入 `docs/test/inbox/`：

- 文件命名格式：`00-<filename>.md`
- 定期整理 inbox 中的文档，将其归类到相应位置

## 文件命名规范

使用唯一标识符（ID）作为文件名开头，标题紧跟 ID 之后，使用连字符分隔：

| 产品文档 | 测试文档 |
|---------|---------|
| `00-AIMP-PRD.md` | `00-TEST-AIMP-PRD-E2E.md` |
| `00-AIMP-PRD.md` | `00-TEST-AIMP-PRD-API.md` |
| `01-FEATURE-XXX.md` | `01-TEST-FEATURE-XXX-E2E.md` |

## 原子化原则

每个测试文档是独立的知识原子，包含一个完整的测试用例。避免在一个文件中混合多个测试场景。

## 文档元数据

所有测试文档顶部必须包含 YAML front matter：

```yaml
---
description: 测试文档描述，说明测试范围和目标
type: Fleeting
---
```

## 测试用例结构

### 测试用例模板

```markdown
## 测试用例：[名称]

**依据**：`../product/inbox/00-AIMP-PRD` 章节编号

**前置条件**：
- 条件1
- 条件2

**测试步骤**：
1. 步骤1
2. 步骤2

**预期结果**：
- 结果1
- 结果2
```

### E2E 测试示例

参见 [[00-TEST-AIMP-PRD-E2E.md]]

### API 测试示例

参见 [[00-TEST-AIMP-PRD-API.md]]

## 相关文档

- [[../AGENTS.md]] - 文档管理总规范
- [[../product/inbox/00-AIMP-PRD]] - AIMP 产品需求文档
- [[../../contract/aimp.schema]] - GraphQL Schema 定义
- [[../../contract/aimp.auth.yaml]] - REST API 定义
- [[../../test/AGENTS.md]] - 测试目录完整规范