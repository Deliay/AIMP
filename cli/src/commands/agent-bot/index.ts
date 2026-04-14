import { Command } from 'commander'
import { makeAgentBotCreateCommand } from './create'
import { makeAgentBotListCommand } from './list'

export { makeAgentBotCreateCommand, makeAgentBotListCommand }

export const makeAgentBotCommands = (program: Command) => {
  const agentBot = program
    .command('agent-bot')
    .description('Agent Bot 管理')

  makeAgentBotCreateCommand(agentBot)
  makeAgentBotListCommand(agentBot)
}
