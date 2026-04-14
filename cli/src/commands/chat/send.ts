import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'

interface SendMessageResponse {
  sendMessage: {
    id: string
    topicId: string
    type: string
    content: unknown
    createdAt: string
  }
}

interface MessageResponse {
  messages: Array<{
    id: string
    topicId: string
    type: string
    content: unknown
    readBy: string[]
    createdAt: string
  }>
}

export const makeChatSendCommand = (program: Command) => {
  program
    .command('send')
    .description('发送消息')
    .requiredOption('--to <TARGET_ID>', '目标用户/Agent ID')
    .requiredOption('--type <TYPE>', '消息类型: TEXT 或 FORM')
    .requiredOption('--content <CONTENT>', '消息内容（JSON 格式字符串）')
    .option('--wait', '等待表单响应后继续（仅 type=FORM 时有效）')
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

        const response = await client.graphql<SendMessageResponse>(`
          mutation SendMessage($topicId: ID!, $type: MessageType!, $content: JSON!) {
            sendMessage(topicId: $topicId, type: $type, content: $content) {
              id
              topicId
              type
              content
              createdAt
            }
          }
        `, {
          topicId: options.to,
          type: options.type.toUpperCase(),
          content
        })

        spinner.succeed(chalk.green('✓ 消息已发送'))
        console.log(chalk.blue('消息ID:'), response.sendMessage.id)

        if (options.wait && options.type.toUpperCase() === 'FORM') {
          spinner.text = '等待表单响应...'
          const formResult = await pollForFormResponse(client, response.sendMessage.id)
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
    const response = await client.graphql<MessageResponse>(`
      query GetMessage($topicId: ID!) {
        messages(topicId: $topicId, limit: 10) {
          id
          type
          content
          readBy
        }
      }
    `, { topicId: messageId })

    const message = response.messages.find(m => m.id === messageId)
    if (message && message.readBy.length > 1) {
      return message.content
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('等待表单响应超时')
}