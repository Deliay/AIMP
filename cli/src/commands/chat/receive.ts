import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'
import { ChatMessage, FormMessage, FormField } from '../../types'

export const makeChatReceiveCommand = (program: Command) => {
  program
    .command('receive')
    .description('接收来自指定用户/Agent 的未读消息')
    .requiredOption('--from <TARGET_ID>', '来源用户/Agent ID')
    .action(async (options) => {
      const spinner = ora('正在获取消息...').start()

      try {
        const client = getApiClient(resolve.serverUrl())
        const messages = await client.get<ChatMessage[]>(
          `/api/chat/receive?from=${options.from}`
        )

        spinner.stop()

        if (messages.length === 0) {
          console.log(chalk.yellow('暂无未读消息'))
          return
        }

        for (const msg of messages) {
          console.log(chalk.blue(`\n收到来自 ${msg.from} 的消息:\n`))

          if (msg.type === 'text') {
            const content = JSON.parse(msg.content)
            console.log(content.content || msg.content)
          } else if (msg.type === 'form') {
            const form: FormMessage = JSON.parse(msg.content)
            console.log(chalk.bold(form.title))
            console.log()

            for (const field of form.fields) {
              const fieldType = `[${field.type}]`.padEnd(12)
              console.log(`${fieldType} ${field.label}: ${field.options?.join(', ') || ''}`)
            }

            console.log(chalk.yellow('\n请在 Web Console 填写并提交'))
          }

          console.log()
        }
      } catch (error) {
        spinner.fail(chalk.red('获取消息失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}
