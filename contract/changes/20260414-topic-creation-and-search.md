# 20260414-topic-creation-and-search

## 变更类型
GraphQL Schema 扩展

## 变更内容

### 1. 添加 TopicStatus 枚举

```graphql
enum TopicStatus {
  PENDING
  ACTIVE
  REJECTED
}
```

### 2. Topic 类型扩展

```graphql
type Topic {
  id: ID!
  ownerId: ID!
  slug: String!
  type: TopicType!
  name: String!
  description: String!
  status: TopicStatus!
  members: [User!]!
  lastMessage: Message
  unreadCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### 3. 添加创建 Topic Payload

```graphql
type CreateTopicPayload {
  requestId: ID
  status: TopicStatus!
  topic: Topic
}

type TopicSearchResult {
  slug: String!
  name: String!
  description: String!
  relateScore: Float!
}

type ClearTopicMessagesPayload {
  status: String!
  clearedCount: Int!
}
```

### 4. 添加 Query

```graphql
type Query {
  # ...existing queries...
  searchTopics(keyword: String!): [TopicSearchResult!]!
}
```

### 5. 添加 Mutation

```graphql
type Mutation {
  # ...existing mutations...
  createTopic(slug: String!, name: String!, description: String!, wait: Boolean): CreateTopicPayload!
  approveTopic(requestId: ID!): Topic!
  rejectTopic(requestId: ID!, reason: String!): Boolean!
  clearTopicMessages(topicId: ID!): ClearTopicMessagesPayload!
}
```

## 变更原因

根据产品需求文档 `01-Topic-Creation-Feature.md`：

1. **Topic 创建功能**
   - Web 端创建 Topic 需要 slug/name/description
   - CLI 创建 Topic 需要同步等待人类审批（wait 参数）
   - 审批通过后 Topic 状态变为 ACTIVE

2. **Topic 检索功能**
   - CLI 需要通过关键词检索 Topic
   - 基于向量相关性返回 relate_score

3. **清空群聊功能**
   - 仅 HUMAN 可以清空群聊消息
   - 返回清空的消息数量

## 影响范围

- `contract/aimp.schema` - Schema 扩展
- `api/src/resolvers/` - 需要实现 Topic 相关 resolver
- `api/src/models/` - 需要更新 Topic 模型
- `cli/` - 需要实现 topic create/list/search 命令
- `fe/` - 需要在 Web 端实现 Topic 创建和清空功能