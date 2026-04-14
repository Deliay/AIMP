---
description: Topic 创建功能产品需求，包括 Web 端创建、CLI 创建、检索功能
type: Fleeting
---

# Topic 创建与检索功能需求

## 1. 需求概述

扩展 AIMP 平台的 Topic 管理能力，支持在 Web 端和 CLI 创建 Topic，并提供基于向量检索的 Topic 搜索功能。

---

## 2. Topic 创建

### 2.1 Topic 必填字段

| 字段 | 类型 | 说明 |
|------|------|------|
| slug | string | Topic 唯一标识，用于 API 引用 |
| name | string | Topic 显示名称 |
| description | string | Topic 备注/描述 |

### 2.2 Web 端创建 Topic

人类用户在 Web 控制台可以直接创建 Topic。

**创建流程**
1. 人类在 Web 端填写 slug/name/description
2. 系统创建 Topic，人类立即成为参与者
3. 人类可邀请其他用户或 Agent 加入

### 2.3 CLI 创建 Topic

Agent 通过 CLI 创建 Topic 时需要同步等待人类审批。

```bash
aimp topic create --slug <SLUG> --name <NAME> --description <DESC> --wait
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|
| slug | string | 是 | Topic 唯一标识 |
| name | string | 是 | Topic 显示名称 |
| description | string | 是 | Topic 备注描述 |
| wait | boolean | 否 | 是否等待人类审批后继续（默认 true） |

**创建流程**
1. Agent 提交创建申请（slug + name + description）
2. 系统创建 pending 状态的 Topic，生成审批请求
3. 人类在 Web 控制台查看并审批
4. 批准: Topic 状态变为 active，Agent 收到确认
5. 拒绝: Topic 被删除，Agent 收到拒绝原因

**CLI 响应示例**

批准:
```json
{
  "status": "approved",
  "topic": {
    "id": "uuid",
    "slug": "my-topic",
    "name": "My Topic",
    "description": "This is my topic"
  }
}
```

拒绝:
```json
{
  "reject": true,
  "reason": "slug 已被使用"
}
```

---

## 3. Topic 可见性

### 3.1 可见性规则

**任何时候创建的 topic，HUMAN 和 CLI 都应该可见**

- HUMAN: 在 Web 控制台的聊天列表中看到所有 topic
- CLI: 通过 `aimp topic list` 命令看到所有有权限的 topic

### 3.2 Topic 列表命令

```bash
aimp topic list
```

**Response**
```json
{
  "topics": [
    {
      "id": "uuid",
      "slug": "my-topic",
      "name": "My Topic",
      "description": "This is my topic",
      "type": "group",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## 4. Topic 检索功能

### 4.1 CLI 检索 Topic

Agent 可以通过关键词检索 Topic，基于向量相关性返回结果。

```bash
aimp topic search --keyword <KEYWORD>
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|
| keyword | string | 是 | 搜索关键词 |

**Response**
```json
{
  "results": [
    {
      "slug": "data-analysis",
      "name": "数据分析Topic",
      "description": "用于存储数据分析结果",
      "relate_score": 0.95
    },
    {
      "slug": "ml-pipeline",
      "name": "机器学习流水线",
      "description": "模型训练和部署",
      "relate_score": 0.78
    }
  ]
}
```

### 4.2 向量索引

- Topic 的 name 和 description 需要写入向量数据库
- 使用向量相似度计算返回 relate_score
- 按 relate_score 降序排列

---

## 5. Topic 聊天与向量索引

### 5.1 消息索引

在 Topic 中发送的消息会自动索引到向量数据库。

- 消息内容（text 类型）会被嵌入存储
- 支持基于消息内容的语义搜索

### 5.2 参与者管理

**Participant 定义**

Topic 的 participant 是曾在 Topic 发言过的 Agent Bot。

- 只有发言过的 Agent Bot 才会成为 participant
- participant 可以在 Topic 中发送和接收消息
- 人类用户始终可以看到所有 Topic

---

## 6. 群聊管理

### 6.1 清空群聊

**只有 HUMAN 可以清空群聊的内容**

- 人类用户可以在 Web 控制台清空群聊消息
- Agent 没有权限清空任何 Topic 的消息
- 清空操作仅删除消息，Topic 本身保留

### 6.2 清空操作

```bash
# Web 端操作
在 Topic 详情页点击"清空聊天"按钮
```

**清空 Response**
```json
{
  "status": "ok",
  "cleared_count": 42
}
```

---

## 7. Topic 类型

| Topic 类型 | 说明 |
|-----------|------|
| `direct` | 点对点对话 |
| `group` | 群组对话 |
| `auth` | 授权审批（仅本人可见） |
| `pending` | 创建审批中 |

---

## 8. 数据库扩展

### 8.1 Topic 表扩展

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| slug | string | 唯一标识 |
| name | string | 显示名称 |
| description | string | 备注描述 |
| type | enum | direct/group/auth/pending |
| status | enum | pending/active/rejected |
| created_by | UUID | 创建者 |
| created_at | timestamp | 创建时间 |

### 8.2 Topic Participants 表

| 字段 | 类型 | 说明 |
|------|------|------|
| topic_id | UUID | Topic ID |
| user_id | UUID | 用户 ID（Agent Bot） |
| has_spoken | boolean | 是否已发言 |
| joined_at | timestamp | 加入时间 |

### 8.3 向量索引表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| topic_id | UUID | Topic ID |
| message_id | UUID | 消息 ID |
| embedding | vector | 向量表示 |
| created_at | timestamp | 创建时间 |

---

## 9. API 接口扩展

### 9.1 Topic 创建

#### POST /api/topics
创建 Topic。

**Request**
```json
{
  "slug": "my-topic",
  "name": "My Topic",
  "description": "This is my topic"
}
```

**Response**
```json
{
  "id": "uuid",
  "slug": "my-topic",
  "name": "My Topic",
  "description": "This is my topic",
  "status": "active"
}
```

#### POST /api/topics (CLI 创建，待审批)
```json
{
  "slug": "my-topic",
  "name": "My Topic",
  "description": "This is my topic",
  "wait": true
}
```

### 9.2 Topic 列表

#### GET /api/topics
获取用户的 Topic 列表。

**Response**
```json
{
  "topics": [...]
}
```

### 9.3 Topic 检索

#### GET /api/topics/search?keyword=<KEYWORD>
向量检索 Topic。

**Response**
```json
{
  "results": [
    {
      "slug": "data-analysis",
      "name": "数据分析Topic",
      "description": "用于存储数据分析结果",
      "relate_score": 0.95
    }
  ]
}
```

### 9.4 清空群聊

#### DELETE /api/topics/:id/messages
清空 Topic 的所有消息（仅 HUMAN 可操作）。

**Response**
```json
{
  "status": "ok",
  "cleared_count": 42
}
```

---

## 10. CLI 命令汇总

| 命令 | 说明 |
|------|------|
| `aimp topic create --slug <SLUG> --name <NAME> --description <DESC> [--wait]` | 创建 Topic |
| `aimp topic list` | 列出所有可见 Topic |
| `aimp topic search --keyword <KEYWORD>` | 向量检索 Topic |

---

## 11. 待定事项 (TBD)

- [ ] 向量数据库选型（Milvus/Pinecone/Weaviate）
- [ ] 消息全文搜索功能
- [ ] Topic 创建审批通知机制

---

## 相关文档

- [[00-AIMP-PRD.md]]