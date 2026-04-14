import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'

interface AgentBot {
  id: string
  name: string
  purpose: string
  status: string
  createdAt: string
}

interface AgentBotsResponse {
  agentBots: AgentBot[]
}

export const makeAgentBotListCommand = (program: Command) => {
  program
    .command('list')
    .description('列出当前帐号的 Agent Bot')
    .action(async (_, cmd) => {
      const spinner = ora('正在获取 Agent Bot 列表...').start()

      try {
        const serverUrl = cmd.parent?.opts()?.serverUrl;
        const client = getApiClient(resolve.serverUrl(serverUrl));
        const response = await client.graphql<AgentBotsResponse>(`
          query {
            agentBots {
              id
              name
              purpose
              status
              createdAt
            }
          }
        `)

        spinner.stop()

        if (response.agentBots.length === 0) {
          console.log(chalk.yellow('暂无 Agent Bot'))
          return
        }

        console.log(chalk.bold('\nAgent Bot 列表:\n'))

        const separator = '─'.repeat(50)

        console.log(separator)
        console.log(chalk.cyan('名称'.padEnd(23)) + chalk.cyan('状态'.padEnd(8)) + chalk.cyan('创建时间'))
        console.log(separator)

        for (const bot of response.agentBots) {
          const statusColor = bot.status === 'APPROVED' ? chalk.green :
            bot.status === 'PENDING' ? chalk.yellow : chalk.red
          const createdAt = new Date(bot.createdAt).toISOString().split('T')[0]

          console.log(
            bot.name.padEnd(23) + '│ ' +
            statusColor(bot.status.padEnd(6)) + ' │ ' +
            createdAt
          )
        }

        console.log(separator + '\n')
      } catch (error) {
        spinner.fail(chalk.red('获取 Agent Bot 列表失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}
