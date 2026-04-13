# 20260413-regenerate-api-key-mutation

## 变更类型
GraphQL Schema 扩展

## 变更内容

### 添加 Mutation

```graphql
type Mutation {
  # ...existing mutations...
  regenerateApiKey: ApiKeyPayload!
}

type ApiKeyPayload {
  apiKey: String!
}
```

## 变更原因

用户需要在 Web Console 中重新生成 API Key。当前的 `apiKey` 字段是 User type 上的只读字段，需要通过 mutation 来触发重新生成。

## 影响范围

- `contract/aimp.schema` - 添加 `regenerateApiKey` mutation
- `api/src/resolvers/` - 需要实现该 mutation
- `fe/src/api/auth.ts` - 需要添加 GraphQL 调用
- `fe/src/pages/settings.tsx` - 添加 Generate 按钮