# subaccount 重命名为 agent_bot

## 变更日期
2026-04-14

## 变更类型
概念重命名

## 变更内容

### 类型重命名
- `Subaccount` -> `AgentBot`
- `SubaccountStatus` -> `AgentBotStatus`
- `CreateSubaccountPayload` -> `CreateAgentBotPayload`

### 字段重命名
- `subaccountName` -> `agentBotName`
- `subaccountPurpose` -> `agentBotPurpose`
- Query `subaccounts` -> `agentBots`
- Mutation `createSubaccount` -> `createAgentBot`
- Mutation `approveSubaccount` -> `approveAgentBot`
- Mutation `rejectSubaccount` -> `rejectAgentBot`

## 变更原因
统一命名规范，将"子帐号"概念更名为"Agent Bot"，更好地描述 AI Agent 的身份属性。