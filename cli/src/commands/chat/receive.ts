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
  members: Array<{ id: string; email: string | null }>
  createdAt: string
}

interface Message {
  id: string
  topicId: string
  type: string
  content: unknown
  sender: {
    id: string
    email: string | null
  }
  createdAt: string
}

interface TopicsResponse {
  topics: Topic[]
}

interface MessagesResponse {
  messages: Message[]
}

interface MarkAsReadResponse {
  markAsRead: boolean
}

export const makeChatReceiveCommand = (program: Command) => {
  program
    .command('receive')
    .description('接收来自指定用户/Agent 的未读消息')
    .option('--from <TOPIC_ID>', '指定话题 ID')
    .action(async (options) => {
      const spinner = ora('正在获取消息...').start()

      try {
        const client = getApiClient(resolve.serverUrl())

        let topicId = options.from
        if (!topicId) {
          const topicsResponse = await client.graphql<TopicsResponse>(`
            query {
              topics {
                id
                type
                name
                unreadCount
                members {
                  id
                  email
                }
                createdAt
              }
            }
          `)

          const unreadTopics = topicsResponse.topics.filter(t => t.unreadCount > 0)

          if (unreadTopics.length === 0) {
            spinner.stop()
            console.log(chalk.yellow('暂无未读消息'))
            return
          }

          if (unreadTopics.length === 1) {
            topicId = unreadTopics[0].id
          } else {
            spinner.stop()
            console.log(chalk.bold('\n未读话题列表:\n'))
            for (const topic of unreadTopics) {
              console.log(`${topic.id} - ${topic.name || '未命名'} (${topic.unreadCount} 条未读)`)
            }
            console.log()
            console.log(chalk.yellow('请使用 --from <TOPIC_ID> 指定要接收的话题'))
            return
          }
        }

        const messagesResponse = await client.graphql<MessagesResponse>(`
          query GetMessages($topicId: ID!) {
            messages(topicId: $topicId, limit: 50) {
              id
              topicId
              type
              content
              sender {
                id
                email
              }
              createdAt
            }
          }
        `, { topicId })

        spinner.stop()

        if (messagesResponse.messages.length === 0) {
          console.log(chalk.yellow('暂无未读消息'))
          return
        }

        for (const msg of messagesResponse.messages) {
          const senderId = msg.sender.email || msg.sender.id
          console.log(chalk.blue(`\n收到来自 ${senderId} 的消息:\n`))

          if (msg.type === 'TEXT') {
            const content = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content
            console.log(content.content || msg.content)
          } else if (msg.type === 'FORM') {
            const form = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content
            console.log(chalk.bold(form.title || '表单'))
            console.log()

            if (form.fields) {
              for (const field of form.fields) {
                const fieldType = `[${field.type}]`.padEnd(12)
                console.log(`${fieldType} ${field.label}: ${field.options?.join(', ') || ''}`)
              }
            }

            console.log(chalk.yellow('\n请在 Web Console 填写并提交'))
          }

          console.log()
        }

        await client.graphql<MarkAsReadResponse>(`
          mutation MarkAsRead($topicId: ID!) {
            markAsRead(topicId: $topicId)
          }
        `, { topicId })

      } catch (error) {
        spinner.fail(chalk.red('获取消息失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}