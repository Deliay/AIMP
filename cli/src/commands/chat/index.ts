import { Command } from 'commander'
import { makeChatSendCommand } from './send'
import { makeChatReceiveCommand } from './receive'
import { makeChatHistoryCommand } from './history'

export { makeChatSendCommand, makeChatReceiveCommand, makeChatHistoryCommand }

export const makeChatCommands = (program: Command) => {
  const chat = program
    .command('chat')
    .description('消息管理')

  makeChatSendCommand(chat)
  makeChatReceiveCommand(chat)
  makeChatHistoryCommand(chat)
}
