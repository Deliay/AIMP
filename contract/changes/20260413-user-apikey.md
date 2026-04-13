# 20260413-user-apikey - 添加 User.apiKey 字段

## 变更原因

用户注册后无法在 Web Console 中查看自己的 API Key。目前 API Key 仅在注册响应中返回，但前端未展示，且无设置页面供用户后续查看。

## 变更内容

在 GraphQL Schema 的 `User` 类型中添加 `apiKey` 字段：

```graphql
type User {
  id: ID!
  email: String
  type: UserType!
  description: String
  apiKey: String      # 新增：用户 API Key（仅主账号有）
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

## 影响的接口

| 接口 | 变更类型 | 说明 |
|------|----------|------|
| `Query.me` | 修改 | 返回的 User 对象新增 apiKey 字段 |

## 契约版本

- **旧版本**: 1.0.0
- **新版本**: 1.1.1