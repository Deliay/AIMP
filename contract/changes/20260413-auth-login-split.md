# 20260413-auth-login-split - 分离人类登录和CLI登录

## 变更原因

原 `/login` 接口同时支持人类用户（邮箱密码）和 API Key 登录，这导致：
- 契约定义模糊，Web 前端无法明确应该使用哪个接口
- CLI 和 Web 使用同一个登录接口，不符合直觉

## 变更内容

将登录接口拆分为两个独立接口：

### `/login` - 人类用户登录
- **方法**: `POST /api/auth/login`
- **认证方式**: 邮箱 + 密码
- **用途**: Web Console 人类用户登录

### `/cli-login` - API Key 登录
- **方法**: `POST /api/auth/cli-login`
- **认证方式**: API Key
- **用途**: CLI 工具登录

## 影响的接口

| 接口 | 变更类型 | 说明 |
|------|----------|------|
| `POST /api/auth/login` | 修改 | 移除 apiKey 支持，仅支持 email + password |
| `POST /api/auth/cli-login` | 新增 | CLI 专用 API Key 登录接口 |

## 影响的调用方

- `fe/` (Web 前端) - 使用 `/login` (email + password)
- `cli/` (CLI 工具) - 改用 `/cli-login` (apiKey)

## 契约版本

- **旧版本**: 1.0.0
- **新版本**: 1.1.0
