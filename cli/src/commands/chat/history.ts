import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'
import { ChatMessage } from '../../types'

export const makeChatHistoryCommand = (program: Command) => {
  program
    .command('history')
    .description('获取聊天历史')
    .option('--tail <N>', '获取最近 N 条消息', '10')
    .action(async (options) => {
      const spinner = ora('正在获取聊天历史...').start()

      try {
        const client = getApiClient(resolve.serverUrl())
        const messages = await client.get<ChatMessage[]>(
          `/api/chat/history?limit=${options.tail}`
        )

        spinner.stop()

        if (messages.length === 0) {
          console.log(chalk.yellow('暂无聊天历史'))
          return
        }

        console.log(chalk.bold(`\n聊天历史 (最近 ${messages.length} 条):\n`))

        for (const msg of messages) {
          const time = new Date(msg.created_at).toLocaleString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
          const direction = msg.from === 'me' ? '→ you' : `→ ${msg.to}`
          const typeLabel = msg.type === 'text' ? '文本消息' : '表单消息'

          console.log(
            chalk.gray(`[${time}]`) +
            ` ${msg.from} ${direction}: ${typeLabel}`
          )
        }

        console.log()
      } catch (error) {
        spinner.fail(chalk.red('获取聊天历史失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}
