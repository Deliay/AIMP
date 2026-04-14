import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'

interface CreateTopicResponse {
  createTopic: {
    requestId?: string
    status: string
    topic?: {
      id: string
      slug: string
      name: string
      description: string
    }
  }
}

interface TopicStatusResponse {
  topics: Array<{
    id: string
    slug: string
    name: string
    status: string
  }>
}

export const makeTopicCreateCommand = (program: Command) => {
  program
    .command('create')
    .description('创建 Topic 申请')
    .requiredOption('--slug <SLUG>', 'Topic 唯一标识')
    .requiredOption('--name <NAME>', 'Topic 显示名称')
    .requiredOption('--description <DESC>', 'Topic 描述')
    .option('--wait', '等待人类审批后继续', true)
    .action(async (options, cmd) => {
      const serverUrl = cmd.parent?.opts()?.serverUrl
      const client = getApiClient(resolve.serverUrl(serverUrl))

      if (options.wait) {
        await createTopicWithWait(client, options)
      } else {
        await createTopicWithoutWait(client, options)
      }
    })
}

async function createTopicWithWait(
  client: ReturnType<typeof getApiClient>,
  options: { slug: string; name: string; description: string }
): Promise<void> {
  const spinner = ora('正在提交创建申请...').start()

  try {
    const response = await client.graphql<CreateTopicResponse>(`
      mutation CreateTopic($slug: String!, $name: String!, $description: String!, $wait: Boolean) {
        createTopic(slug: $slug, name: $name, description: $description, wait: $wait) {
          requestId
          status
          topic {
            id
            slug
            name
            description
          }
        }
      }
    `, {
      slug: options.slug,
      name: options.name,
      description: options.description,
      wait: true
    })

    const result = response.createTopic

    if (result.status === 'ACTIVE' && result.topic) {
      spinner.succeed(chalk.green('✓ Topic 创建成功'))
      console.log(chalk.blue('Topic ID:'), result.topic.id)
      console.log(chalk.blue('Slug:'), result.topic.slug)
      console.log(chalk.blue('名称:'), result.topic.name)
      return
    }

    if (!result.requestId) {
      spinner.fail(chalk.red('创建失败'))
      console.log(chalk.yellow('请在 Web Console 查看审批状态'))
      return
    }

    spinner.text = '申请已提交，等待审批...'
    await pollForApproval(client, result.requestId)

    const topicResponse = await client.graphql<TopicStatusResponse>(`
      query {
        topics {
          id
          slug
          name
        }
      }
    `)

    const createdTopic = topicResponse.topics.find(t => t.slug === options.slug)
    if (createdTopic) {
      spinner.succeed(chalk.green('✓ Topic 创建成功'))
      console.log(chalk.blue('Topic ID:'), createdTopic.id)
      console.log(chalk.blue('Slug:'), createdTopic.slug)
      console.log(chalk.blue('名称:'), createdTopic.name)
    } else {
      spinner.succeed(chalk.green('✓ Topic 创建成功'))
    }
  } catch (error) {
    spinner.fail(chalk.red('创建失败'))
    handleApiError(error)
    process.exit(1)
  }
}

async function createTopicWithoutWait(
  client: ReturnType<typeof getApiClient>,
  options: { slug: string; name: string; description: string }
): Promise<void> {
  const spinner = ora('正在提交创建申请...').start()

  try {
    const response = await client.graphql<CreateTopicResponse>(`
      mutation CreateTopic($slug: String!, $name: String!, $description: String!, $wait: Boolean) {
        createTopic(slug: $slug, name: $name, description: $description, wait: $wait) {
          requestId
          status
          topic {
            id
            slug
            name
          }
        }
      }
    `, {
      slug: options.slug,
      name: options.name,
      description: options.description,
      wait: false
    })

    const result = response.createTopic

    if (result.status === 'ACTIVE' && result.topic) {
      spinner.succeed(chalk.green('✓ Topic 创建成功'))
      console.log(chalk.blue('Topic ID:'), result.topic.id)
      console.log(chalk.blue('Slug:'), result.topic.slug)
    } else if (result.requestId) {
      spinner.succeed(chalk.green('✓ 申请已提交'))
      console.log(chalk.blue('申请ID:'), result.requestId)
      console.log(chalk.yellow('请在 Web Console 查看审批状态'))
    } else {
      spinner.succeed(chalk.green('✓ 申请已提交'))
      console.log(chalk.yellow('请在 Web Console 查看审批状态'))
    }
  } catch (error) {
    spinner.fail(chalk.red('创建失败'))
    handleApiError(error)
    process.exit(1)
  }
}

async function pollForApproval(
  client: ReturnType<typeof getApiClient>,
  requestId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await client.graphql<{ authRequests: Array<{ id: string; status: string }> }>(`
      query GetAuthRequests {
        authRequests {
          id
          status
        }
      }
    `)

    const request = response.authRequests.find(r => r.id === requestId)
    if (request?.status === 'APPROVED') {
      return
    }

    if (request?.status === 'REJECTED') {
      throw new Error('Topic 创建申请被拒绝')
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('审批超时，请稍后在 Web Console 查看审批状态')
}