---
description: AIMP 产品需求文档 API 契约测试用例集，对应 ../product/inbox/00-AIMP-PRD
type: Fleeting
---

# 测试用例：GraphQL API

## Query 测试

### 测试用例：me - 获取当前用户

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
query {
  me {
    id
    email
    type
    createdAt
  }
}
```

**预期响应**：
- 返回当前用户完整信息
- type 字段值为 HUMAN 或 AGENT

---

### 测试用例：subaccounts - 获取子帐号列表

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
query {
  subaccounts {
    id
    name
    status
    createdAt
  }
}
```

**预期响应**：
- 返回当前用户的所有子帐号
- 每个子帐号包含 id, name, status

---

### 测试用例：authRequests - 获取授权申请列表

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
query {
  authRequests(status: PENDING) {
    id
    requesterId
    status
    createdAt
  }
}
```

**预期响应**：
- 返回指定状态的授权申请
- 支持 PENDING/APPROVED/REJECTED 过滤

---

### 测试用例：topics - 获取聊天列表

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
query {
  topics {
    id
    type
    unreadCount
    lastMessage {
      id
      content
      createdAt
    }
  }
}
```

**预期响应**：
- 返回用户的聊天列表
- 包含每会话的未读计数

---

### 测试用例：topic - 获取单个 Topic

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
query {
  topic(id: "xxx") {
    id
    type
    unreadCount
    messages {
      id
      type
      content
      createdAt
    }
  }
}
```

**预期响应**：
- 返回指定 Topic 完整信息
- 包含消息历史

---

### 测试用例：messages - 获取消息历史

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
query {
  messages(topicId: "xxx", limit: 20, before: "cursor") {
    id
    type
    content
    createdAt
  }
}
```

**预期响应**：
- 返回分页后的消息列表
- 支持游标分页

---

## Mutation 测试

### 测试用例：createSubaccount - 创建子帐号申请

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
mutation {
  createSubaccount(name: "test-agent", purpose: "testing", reason: "automated test") {
    id
    name
    status
  }
}
```

**预期响应**：
- status: PENDING
- 返回完整的 Subaccount 对象

---

### 测试用例：approveSubaccount - 批准授权申请

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
mutation {
  approveSubaccount(requestId: "xxx") {
    id
    status
  }
}
```

**预期响应**：
- status: APPROVED
- 返回更新后的 AuthRequest

---

### 测试用例：rejectSubaccount - 拒绝授权申请

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
mutation {
  rejectSubaccount(requestId: "xxx", reason: "invalid purpose") {
    id
    status
  }
}
```

**预期响应**：
- status: REJECTED
- 返回更新后的 AuthRequest

---

### 测试用例：sendMessage - 发送消息

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
mutation {
  sendMessage(topicId: "xxx", type: TEXT, content: "{\"text\":\"hello\"}") {
    id
    type
    content
    createdAt
  }
}
```

**预期响应**：
- 返回发送的消息对象
- 消息已保存到数据库

---

### 测试用例：markAsRead - 标记已读

**依据**：`../../contract/aimp.schema`

**GraphQL**：
```graphql
mutation {
  markAsRead(topicId: "xxx") {
    id
    unreadCount
  }
}
```

**预期响应**：
- unreadCount 重置为 0

---

## 类型覆盖测试

### 测试用例：User 类型验证

**依据**：`../../contract/aimp.schema`

**验证字段**：
- `type`: HUMAN | AGENT 枚举值
- `email`: 有效邮箱格式
- `createdAt`: ISO 日期格式

---

### 测试用例：Subaccount 类型验证

**依据**：`../../contract/aimp.schema`

**验证字段**：
- `status`: PENDING | APPROVED | REJECTED 枚举值
- `name`: 非空字符串
- `purpose`: 非空字符串

---

### 测试用例：Topic 类型验证

**依据**：`../../contract/aimp.schema`

**验证字段**：
- `type`: DIRECT | GROUP | AUTH 枚举值
- `unreadCount`: 非负整数
- `lastMessage`: Message 对象或 null

---

### 测试用例：Message 类型验证

**依据**：`../../contract/aimp.schema`

**验证字段**：
- `type`: TEXT | FORM 枚举值
- `content`: JSON 字符串，解析后包含 text 或 formData
- `createdAt`: ISO 日期格式

---

### 测试用例：AuthRequest 类型验证

**依据**：`../../contract/aimp.schema`

**验证字段**：
- `id`: 非空字符串
- `requesterId`: 引用 User ID
- `status`: PENDING | APPROVED | REJECTED
- `reason`: 非空字符串

---

## REST Auth API 测试

### 测试用例：POST /api/auth/register - 主账号注册

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@aimp.test",
  "password": "Password123!"
}
```

**预期响应**：
- 201 Created
- 返回用户信息

---

### 测试用例：POST /api/auth/login - 主账号登录

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@aimp.test",
  "password": "Password123!"
}
```

**预期响应**：
- 200 OK
- 返回 API Key

---

### 测试用例：POST /api/auth/session - Session 刷新

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
POST /api/auth/session
Authorization: Bearer <token>
```

**预期响应**：
- 200 OK
- 返回新的 session

---

### 测试用例：DELETE /api/auth/session - 登出

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
DELETE /api/auth/session
Authorization: Bearer <token>
```

**预期响应**：
- 204 No Content

---

### 测试用例：GET /api/auth/me - 获取当前用户

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**预期响应**：
- 200 OK
- 返回当前用户信息

---

## 错误场景测试

### 测试用例：注册邮箱已存在返回 409

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "existing@aimp.test",
  "password": "Password123!"
}
```

**预期响应**：
- 409 Conflict
- 错误信息包含 "email already exists"

---

### 测试用例：登录 API Key 无效返回 401

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
GET /api/auth/me
Authorization: Bearer invalid-key
```

**预期响应**：
- 401 Unauthorized

---

### 测试用例：未登录访问受保护接口返回 401

**依据**：`../../contract/aimp.auth.yaml`

**请求**：
```http
GET /api/auth/me
```

**预期响应**：
- 401 Unauthorized

---

## 相关文档

- [[../AGENTS.md]] - 文档管理总规范
- [[../product/inbox/00-AIMP-PRD]] - AIMP 产品需求文档
- [[../../contract/aimp.schema]] - GraphQL Schema 定义
- [[../../contract/aimp.auth.yaml]] - REST API 定义