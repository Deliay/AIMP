#!/usr/bin/env node

import { Command } from 'commander'
import { makeLoginCommand } from './commands/login'
import { makeLogoutCommand } from './commands/logout'
import { makeWhoamiCommand } from './commands/whoami'
import { makeSubaccountCommands } from './commands/subaccount'
import { makeChatCommands } from './commands/chat'
import { makeTopicCommands } from './commands/topic'

const program = new Command()

program
  .name('aimp')
  .description('AIMP CLI - AI Agent 与 AIMP 平台交互的命令行工具')
  .version('0.1.0')

program
  .option('--server-url <URL>', '指定 API 服务器地址')
  .option('--json', '输出 JSON 格式')
  .option('--verbose', '显示详细调试信息')

makeLoginCommand(program)
makeLogoutCommand(program)
makeWhoamiCommand(program)
makeSubaccountCommands(program)
makeChatCommands(program)
makeTopicCommands(program)

program.parse(process.argv)
