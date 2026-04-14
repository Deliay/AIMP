import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'

interface Topic {
  id: string
  type: string
  name: string | null
  unreadCount: number
  lastMessage: {
    id: string
    type: string
    content: unknown
    createdAt: string
  } | null
  createdAt: string
}

interface Message {
  id: string
  topicId: string
  type: string
  content: unknown
  createdAt: string
}

interface TopicsResponse {
  topics: Topic[]
}

interface MessagesResponse {
  messages: Message[]
}

export const makeChatHistoryCommand = (program: Command) => {
  program
    .command('history')
    .description('获取聊天历史')
    .option('--topic <TOPIC_ID>', '指定话题 ID')
    .option('--tail <N>', '获取最近 N 条消息', '10')
    .action(async (options) => {
      const spinner = ora('正在获取聊天历史...').start()

      try {
        const client = getApiClient(resolve.serverUrl())

        if (options.topic) {
          const response = await client.graphql<MessagesResponse>(`
            query GetMessages($topicId: ID!, $limit: Int) {
              messages(topicId: $topicId, limit: $limit) {
                id
                topicId
                type
                content
                createdAt
              }
            }
          `, {
            topicId: options.topic,
            limit: parseInt(options.tail, 10)
          })

          spinner.stop()

          if (response.messages.length === 0) {
            console.log(chalk.yellow('暂无聊天历史'))
            return
          }

          console.log(chalk.bold(`\n聊天历史 (话题 ${options.topic}, 最近 ${response.messages.length} 条):\n`))

          for (const msg of response.messages) {
            const time = new Date(msg.createdAt).toLocaleString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            })
            const typeLabel = msg.type === 'TEXT' ? '文本消息' : '表单消息'

            console.log(
              chalk.gray(`[${time}]`) +
              ` ${typeLabel}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`
            )
          }

          console.log()
        } else {
          const topicsResponse = await client.graphql<TopicsResponse>(`
            query {
              topics {
                id
                type
                name
                unreadCount
                lastMessage {
                  id
                  type
                  content
                  createdAt
                }
                createdAt
              }
            }
          `)

          spinner.stop()

          if (topicsResponse.topics.length === 0) {
            console.log(chalk.yellow('暂无聊天历史'))
            return
          }

          console.log(chalk.bold(`\n聊天话题列表:\n`))

          const separator = '─'.repeat(60)

          console.log(separator)
          console.log(chalk.cyan('ID'.padEnd(24)) + chalk.cyan('名称'.padEnd(15)) + chalk.cyan('未读'))
          console.log(separator)

          for (const topic of topicsResponse.topics) {
            const name = (topic.name || topic.id).padEnd(14)
            const unread = topic.unreadCount > 0 ? chalk.yellow(`${topic.unreadCount}`) : '0'

            console.log(`${topic.id.slice(0, 24).padEnd(24)} ${name} ${unread}`)
          }

          console.log(separator + '\n')
        }
      } catch (error) {
        spinner.fail(chalk.red('获取聊天历史失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}