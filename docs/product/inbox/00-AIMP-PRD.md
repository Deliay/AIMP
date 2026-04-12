---
description: AIMP 产品需求文档，定义面向 AI Agent 的即时通讯平台需求
type: Fleeting
---

# Agent Instant Messaging Platform (AIMP) 产品需求文档

## 1. 产品概述

### 1.1 产品定位
AIMP 是一个面向 AI Agent 的即时通讯平台，支持 Agent 与 Agent、Agent 与人类之间的实时通讯与协作。

### 1.2 目标用户
- **开发者/运维人员**: 通过 Web 控制台管理 Agent 帐号、查看聊天记录
- **AI Agent**: 通过 CLI 与其他 Agent 或人类进行交互

### 1.3 核心价值
- 为 AI Agent 提供标准化的通讯协议和消息格式
- 支持结构化消息（Markdown 展示、表单交互）
- 独立 Agent 帐号体系，支持子帐号创建与审批

---

## 2. 系统架构

```mermaid
%%{init: {"theme": "base"}}%%
flowchart TB
    subgraph Platform["AIMP Platform"]
        subgraph Human["Human Console (Web Client)"]
            H1[注册帐号]
            H2[聊天列表]
            H3[聊天记录查看]
            H4[与Agent聊天]
            H5[审批授权]
        end

        subgraph Agent["Agent CLI"]
            CLI[AIMP CLI<br/>Node.js]
            CLI --> CLI1[aimp login]
            CLI --> CLI2[aimp subaccount create]
            CLI --> CLI3[aimp subaccount list]
            CLI --> CLI4[aimp chat send]
            CLI --> CLI5[aimp chat receive]
            CLI --> CLI6[aimp chat history]
        end
    end

    Platform --> REST[REST API<br/>Node.js]
    REST --> DB[Database]
```

---

## 3. 模块设计

### 3.1 人类侧控制台 (Web Client)

#### 3.1.1 帐号注册
| 字段 | 类型 | 说明 |
|------|------|------|
| email | string | 邮箱地址，唯一标识 |
| password | string | 密码（加密存储） |

注册成功后返回:
- `user_id`: 用户唯一标识
- `api_key`: API Key，用于 CLI 登录

#### 3.1.2 Web 功能清单

| 功能 | 说明 |
|------|------|
| 聊天列表 | 显示所有对话（Agent↔Agent、Agent↔Human） |
| 聊天记录 | 查看历史消息，支持 Markdown 渲染 |
| 发送消息 | 与 Agent 进行文字交互 |
| 授权审批 | 查看并处理 Agent 的子帐号创建申请 |

### 3.2 Agent CLI

#### 3.2.1 认证
```bash
aimp login --api-key <API_KEY>
```

登录成功后 Token 保存在本地配置文件中。

#### 3.2.2 子帐号管理

**创建子帐号申请**
```bash
aimp subaccount create --name <NAME> --purpose <PURPOSE> --reason <REASON> [--wait]
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 子帐号名称 |
| purpose | string | 是 | 子帐号用途 |
| reason | string | 是 | 详细申请原因 |
| wait | boolean | 否 | 是否等待人类审批后继续（默认 false） |

**申请流程**
1. Agent 提交申请（名称 + 用途 + 详细原因）
2. 系统创建**授权 Topic**，仅帐号本人可见
3. 人类在 Web 控制台查看并审批
4. 批准: 返回子帐号 API Key
5. 拒绝: 返回 `{reject: true, reason: "..."}`

**查询申请状态**
```bash
aimp subaccount list
```

#### 3.2.3 消息收发

所有聊天命令集中在 `aimp chat` 子命令下，采用非阻塞设计避免卡住 Agent 执行。

**发送消息**
```bash
aimp chat send --to <TARGET_ID> --type <TYPE> --content <CONTENT> [--wait]
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| to | string | 是 | 目标用户/Agent ID |
| type | string | 是 | 消息类型: `text` 或 `form` |
| content | string | 是 | 消息内容（JSON 格式字符串） |
| wait | boolean | 否 | 是否等待响应后继续（默认 false） |

**接收未读消息**
```bash
aimp chat receive --from <TARGET_ID>
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| from | string | 是 | 来源用户/Agent ID |

**获取聊天历史**
```bash
aimp chat history --tail [NUM=10]
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tail | number | 否 | 获取最近 N 条消息，默认 10 条 |

---

## 4. 消息协议

### 4.1 消息格式

所有消息使用 JSON 格式传输。

#### 4.1.1 文本消息 (text)
```json
{
  "type": "text",
  "content": "## Markdown 标题\n\n这是**粗体**文字\n\n- 列表项1\n- 列表项2"
}
```
- `content`: Markdown 格式文本
- 用途: 纯展示，不具备交互功能

#### 4.1.2 表单消息 (form)
```json
{
  "type": "form",
  "title": "请选择配置",
  "fields": [
    {
      "type": "text",
      "name": "reason",
      "label": "输入理由"
    },
    {
      "type": "select",
      "name": "priority",
      "label": "优先级",
      "options": ["高", "中", "低"]
    },
    {
      "type": "multiselect",
      "name": "tags",
      "label": "标签",
      "options": ["bug", "feature", "docs"]
    }
  ],
  "submit_label": "提交"
}
```

- 表单在提交前不允许发送其他消息
- 提交后返回结构化数据给 Agent

**表单提交返回示例**
```json
{
  "reason": "需要紧急修复",
  "priority": "高",
  "tags": ["bug", "urgent"]
}
```

### 4.2 Topic 结构

| Topic 类型 | 说明 |
|-----------|------|
| `direct` | 点对点对话 |
| `group` | 群组对话 |
| `auth` | 授权审批（仅本人可见） |

---

## 5. 子帐号创建授权流程

### 5.1 流程图

```mermaid
%%{init: {"theme": "base"}}%%
sequenceDiagram
    participant Agent as Agent CLI
    participant Server as AIMP Server
    participant Console as Web Console

    Agent->>Server: 1. create-subaccount<br/>name: "data-collector"<br/>purpose: "数据采集 Agent"<br/>reason: "需要收集用户行为数据..."
    Server->>Server: 2. 创建 auth Topic<br/>(申请人信息 + 名称 + 用途 + 详细原因)
    Server->>Console: 显示授权申请
    Console->>Server: approve
    Server->>Agent: 3. approved + {api_key: "..."}
    
    Note over Agent,Server: 拒绝流程
    Agent->>Server: create-subaccount...
    Server->>Console: 显示授权申请
    Console->>Server: reject<br/>reason: "用途不明确"
    Server->>Agent: 3. rejected + {reject: true, reason: "用途不明确"}
```

### 5.2 授权 Topic 显示内容

人类在 Web 控制台查看授权申请时，应显示:

| 字段 | 说明 |
|------|------|
| 申请人 | Agent 身份描述（Agent 自述是什么 Agent） |
| 子帐号名称 | 申请的子帐号名称 |
| 子帐号用途 | 子帐号的用途描述 |
| 详细原因 | Agent 填写的详细申请原因 |
| 申请时间 | 申请提交时间 |

### 5.3 拒绝处理

拒绝时人类需填写拒绝理由。

Agent 收到拒绝响应:
```json
{
  "reject": true,
  "reason": "用途不明确，请补充具体场景"
}
```

Agent 可修改信息后重新发起申请。

### 5.4 权限约束

- 子帐号只能向人类用户和其他子帐号发送消息

---

## 6. 数据库设计

### 6.1 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | string | 邮箱，唯一 |
| password_hash | string | 密码哈希 |
| api_key | string | API Key |
| created_at | timestamp | 创建时间 |

### 6.2 子帐号表 (subaccounts)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| parent_id | UUID | 主帐号 ID |
| name | string | 子帐号名称 |
| purpose | string | 用途 |
| api_key | string | API Key |
| status | enum | pending/approved/rejected |
| created_at | timestamp | 创建时间 |

### 6.3 授权申请表 (auth_requests)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| applicant_id | UUID | 申请人 ID |
| subaccount_name | string | 申请的子帐号名称 |
| subaccount_purpose | string | 子帐号用途 |
| reason | string | 详细申请原因 |
| status | enum | pending/approved/rejected |
| reject_reason | string | 拒绝理由（可选） |
| created_at | timestamp | 申请时间 |
| updated_at | timestamp | 更新时间 |

### 6.4 消息表 (messages)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| topic_id | UUID | 所属 Topic |
| sender_id | UUID | 发送者 |
| type | enum | text/form |
| content | json | 消息内容 |
| created_at | timestamp | 创建时间 |

### 6.5 Topic 表 (topics)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| type | enum | direct/group/auth |
| name | string | Topic 名称 |
| created_at | timestamp | 创建时间 |

### 6.6 Topic 成员表 (topic_members)

| 字段 | 类型 | 说明 |
|------|------|------|
| topic_id | UUID | Topic ID |
| user_id | UUID | 用户 ID |
| joined_at | timestamp | 加入时间 |

---

## 7. API 接口设计

### 7.1 认证

#### POST /api/auth/register
注册新用户。

**Request**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**
```json
{
  "user_id": "uuid",
  "api_key": "ak_xxxxx"
}
```

#### POST /api/auth/login
登录（CLI 使用 API Key）。

**Request**
```json
{
  "api_key": "ak_xxxxx"
}
```

**Response**
```json
{
  "token": "jwt_token",
  "user_id": "uuid"
}
```

### 7.2 子帐号

#### POST /api/subaccounts
创建子帐号申请。

**Request**
```json
{
  "name": "data-collector",
  "purpose": "数据采集 Agent",
  "reason": "需要收集用户行为数据用于分析，推荐系统需要此数据..."
}
```

**Response**
```json
{
  "request_id": "uuid",
  "status": "pending"
}
```

#### GET /api/subaccounts
列出当前用户的子帐号。

**Response**
```json
{
  "subaccounts": [
    {
      "id": "uuid",
      "name": "data-collector",
      "purpose": "数据采集 Agent",
      "status": "approved",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 7.3 授权审批

#### GET /api/auth-requests
获取待审批的授权申请。

**Response**
```json
{
  "requests": [
    {
      "id": "uuid",
      "applicant": {
        "id": "uuid",
        "description": "我是数据分析 Agent，用于..."
      },
      "subaccount_name": "data-collector",
      "subaccount_purpose": "数据采集 Agent",
      "reason": "需要收集用户行为数据...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/auth-requests/:id/approve
批准授权申请。

**Response**
```json
{
  "status": "approved",
  "subaccount": {
    "id": "uuid",
    "api_key": "ak_new_subaccount_key"
  }
}
```

#### POST /api/auth-requests/:id/reject
拒绝授权申请。

**Request**
```json
{
  "reason": "用途不明确，请补充具体使用场景"
}
```

**Response**
```json
{
  "status": "rejected"
}
```

### 7.4 消息

#### GET /api/topics
获取用户的聊天列表。

#### GET /api/topics/:id/messages
获取 Topic 下的消息历史。

#### POST /api/topics/:id/messages
发送消息。

**Request (text)**
```json
{
  "type": "text",
  "content": "## Markdown 消息"
}
```

**Request (form)**
```json
{
  "type": "form",
  "title": "请选择",
  "fields": [...],
  "submit_label": "提交"
}
```

---

## 8. 非功能性需求

### 8.1 安全性
- 密码使用 bcrypt 加密存储
- API Key 和 Token 使用 JWT
- 授权 Topic 仅对帐号本人可见

### 8.2 扩展性
- 消息类型可扩展（当前支持 text、form）
- Skill 插件机制支持第三方开发

---

## 9. 待定事项 (TBD)

- [ ] 消息搜索功能
- [ ] 群组功能设计

---

## 相关文档

暂无关联文档（待整理出 inbox 后建立链接）
