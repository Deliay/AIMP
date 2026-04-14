import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'

interface Topic {
  id: string
  slug: string
  name: string
  description: string
  type: string
  status: string
  createdAt: string
}

interface TopicsResponse {
  topics: Topic[]
}

export const makeTopicListCommand = (program: Command) => {
  program
    .command('list')
    .description('列出所有可见 Topic')
    .action(async (_, cmd) => {
      const spinner = ora('正在获取 Topic 列表...').start()

      try {
        const serverUrl = cmd.parent?.opts()?.serverUrl
        const client = getApiClient(resolve.serverUrl(serverUrl))
        const response = await client.graphql<TopicsResponse>(`
          query {
            topics {
              id
              slug
              name
              description
              type
              status
              createdAt
            }
          }
        `)

        spinner.stop()

        if (response.topics.length === 0) {
          console.log(chalk.yellow('暂无 Topic'))
          return
        }

        console.log(chalk.bold('\nTopic 列表:\n'))

        const separator = '─'.repeat(70)

        console.log(separator)
        console.log(
          chalk.cyan('Slug'.padEnd(20)) +
          chalk.cyan('名称'.padEnd(20)) +
          chalk.cyan('类型'.padEnd(8)) +
          chalk.cyan('状态'.padEnd(10)) +
          chalk.cyan('创建时间')
        )
        console.log(separator)

        for (const topic of response.topics) {
          const statusColor = topic.status === 'ACTIVE' ? chalk.green :
            topic.status === 'PENDING' ? chalk.yellow : chalk.red
          const createdAt = new Date(topic.createdAt).toISOString().split('T')[0]

          console.log(
            topic.slug.padEnd(20) + ' │ ' +
            topic.name.padEnd(18) + ' │ ' +
            topic.type.padEnd(6) + ' │ ' +
            statusColor(topic.status.padEnd(8)) + ' │ ' +
            createdAt
          )
        }

        console.log(separator + '\n')
      } catch (error) {
        spinner.fail(chalk.red('获取 Topic 列表失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}