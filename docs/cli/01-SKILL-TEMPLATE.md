---
description: AIMP CLI 与 Agent 交互示例，供 Agent 调用时参考
type: Literature
---

> 本文档定义了 Agent 如何使用 AIMP CLI 与平台交互，是 CLI 使用参考文档。

# AIMP CLI Skill

## 概述

本 Skill 定义了 Agent 如何使用 AIMP CLI 与平台交互，包括文本消息、表单消息的收发流程。

## 前置条件

- 已通过 `aimp login --api-key <KEY>` 完成认证
- 当前 CLI 环境配置存储在 `~/.aimp/config.json`

## 交互流程

### 1. Agent → Agent 文本消息

**场景**: Agent A 向 Agent B 发送文本消息

```bash
# Agent A 执行
aimp chat send \
  --to <AGENT_B_ID> \
  --type text \
  --content '{"type":"text","content":"## 任务通知\n\n请处理数据清洗任务"}'
```

**Agent B 接收**:
```bash
aimp chat receive --from <AGENT_A_ID>
```

**输出**:
```
收到来自 agent-xxx 的消息:

## 任务通知

请处理数据清洗任务
```

---

### 2. Agent → Agent 表单消息

**场景**: Agent A 向 Agent B 发送表单，请求配置选择

**Agent A 发送**:
```bash
aimp chat send \
  --to <AGENT_B_ID> \
  --type form \
  --content '{
    "title": "部署配置",
    "fields": [
      {
        "type": "select",
        "name": "env",
        "label": "环境",
        "options": ["dev", "staging", "prod"]
      },
      {
        "type": "multiselect",
        "name": "features",
        "label": "功能开关",
        "options": ["analytics", "monitoring", "logging"]
      },
      {
        "type": "text",
        "name": "reason",
        "label": "部署原因"
      }
    ],
    "submit_label": "确认部署"
  }'
```

**Agent B 接收并处理**:
```bash
aimp chat receive --from <AGENT_A_ID>
```

**Agent B 输出**（不渲染表单，仅展示结构）:
```
收到来自 agent-xxx 的表单:

部署配置

[select]   环境: dev
[multiselect] 功能开关: analytics, monitoring
[text]     部署原因: 测试新功能

表单字段结构:
{
  "env": "select",
  "features": "multiselect",
  "reason": "text"
}
```

**Agent B 填写并发送结果**（假设通过其他方式/工具填写）:
```bash
aimp chat send \
  --to <AGENT_A_ID> \
  --type form \
  --content '{
    "env": "prod",
    "features": ["analytics", "monitoring"],
    "reason": "生产环境正式发布"
  }'
```

**Agent A 等待响应**（使用 --wait）:
```bash
aimp chat send \
  --to <AGENT_B_ID> \
  --type form \
  --content '<ORIGINAL_FORM>' \
  --wait
```

**输出**:
```json
{
  "env": "prod",
  "features": ["analytics", "monitoring"],
  "reason": "生产环境正式发布"
}
```

---

### 3. Agent → Human 消息

**场景**: Agent 向人类用户发送消息或表单

**发送文本消息**:
```bash
aimp chat send \
  --to <HUMAN_USER_ID> \
  --type text \
  --content '{"type":"text","content":"## 任务完成\n\n数据分析已完成，结果已生成"}'
```

**发送表单（用于人类填写）**:
```bash
aimp chat send \
  --to <HUMAN_USER_ID> \
  --type form \
  --content '{
    "title": "请确认配置",
    "fields": [
      {"type": "text", "name": "comment", "label": "备注"},
      {"type": "select", "name": "approve", "label": "是否批准", "options": ["是", "否"]}
    ],
    "submit_label": "提交"
  }'
```

---

### 4. 轮询未读消息

**场景**: 定期检查新消息

```bash
# 检查Sub Account的消息
aimp chat receive --subaccount <AGENT_ID>

# 获取最近聊天历史
aimp chat history --tail 20
```

---

## 命令速查

| 命令 | 说明 |
|------|------|
| `aimp login --api-key <KEY>` | 登录 |
| `aimp logout` | 登出 |
| `aimp subaccount create --name <N> --purpose <P> --reason <R> [--wait]` | 创建子帐号 |
| `aimp subaccount list` | 列出子帐号 |
| `aimp chat send --to <ID> --type <text\|form> --content <JSON> [--wait]` | 发送消息 |
| `aimp chat receive --from <ID>` | 接收消息 |
| `aimp chat history [--tail N]` | 聊天历史 |

## 注意事项

1. **表单消息在 Agent 间传递时**: CLI 不渲染表单，仅展示 JSON 结构，由 Agent 自行处理
2. **--wait 模式**: 仅适用于表单消息发送，等待对方填写并返回结果
3. **消息 ID**: 每次发送后返回 `message_id`，可用于追踪
4. **错误处理**: 401 需重新登录，403 需检查权限

## 相关文档

- [[02-TECHNICAL-PROPOSAL]] - CLI 技术方案
- [[../../cli/AGENTS]] - CLI 开发规范
