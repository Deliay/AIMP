import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError, ApiError } from '../../core/api-client'
import { resolve } from '../../core/config'
import { SendMessageResponse, Message } from '../../types'

export const makeChatSendCommand = (program: Command) => {
  program
    .command('send')
    .description('发送消息')
    .requiredOption('--to <TARGET_ID>', '目标用户/Agent ID')
    .requiredOption('--type <TYPE>', '消息类型: text 或 form')
    .requiredOption('--content <CONTENT>', '消息内容（JSON 格式字符串）')
    .option('--wait', '等待表单响应后继续（仅 type=form 时有效）')
    .action(async (options) => {
      const spinner = ora('正在发送消息...').start()

      try {
        const client = getApiClient(resolve.serverUrl())
        let content: unknown

        try {
          content = JSON.parse(options.content)
        } catch {
          spinner.fail(chalk.red('消息内容必须是有效的 JSON 格式'))
          process.exit(1)
        }

        const response = await client.post<SendMessageResponse>('/api/chat/send', {
          to: options.to,
          type: options.type,
          content: content
        })

        spinner.succeed(chalk.green('✓ 消息已发送'))
        console.log(chalk.blue('消息ID:'), response.message_id)

        if (options.wait && options.type === 'form') {
          spinner.text = '等待表单响应...'
          const formResult = await pollForFormResponse(client, response.message_id)
          spinner.succeed(chalk.green('✓ 收到表单响应'))
          console.log(JSON.stringify(formResult, null, 2))
        }
      } catch (error) {
        spinner.fail(chalk.red('消息发送失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}

async function pollForFormResponse(
  client: ReturnType<typeof getApiClient>,
  messageId: string,
  maxAttempts = 120,
  intervalMs = 5000
): Promise<unknown> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await client.get<{ status: string; result?: unknown }>(
        `/api/chat/messages/${messageId}`
      )

      if (response.status === 'responded' && response.result) {
        return response.result
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        await new Promise(resolve => setTimeout(resolve, intervalMs))
        continue
      }
      throw error
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('等待表单响应超时')
}
