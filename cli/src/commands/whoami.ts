import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../core/api-client'
import { resolve } from '../core/config'

interface User {
  id: string
  email: string | null
  type: string
  description: string | null
  createdAt: string
}

interface MeResponse {
  me: User
}

export const makeWhoamiCommand = (program: Command) => {
  program
    .command('whoami')
    .description('显示当前登录用户信息')
    .action(async (_, cmd) => {
      let root = cmd.parent;
      while (root?.parent) root = root.parent;
      const isJson = root?.opts()?.json;

      try {
        const client = getApiClient(resolve.serverUrl())
        const response = await client.graphql<MeResponse>(`
          query {
            me {
              id
              email
              type
              description
              createdAt
            }
          }
        `)

        if (!response.me) {
          if (isJson) {
            console.log(JSON.stringify({ loggedIn: false }))
          } else {
            const spinner = ora('正在获取用户信息...').start()
            spinner.stop()
            console.log(chalk.yellow('未登录，请运行 aimp login'))
          }
          return
        }

        if (isJson) {
          console.log(JSON.stringify({
            loggedIn: true,
            user: {
              id: response.me.id,
              email: response.me.email,
              type: response.me.type,
              description: response.me.description,
              createdAt: response.me.createdAt
            }
          }))
        } else {
          const spinner = ora('正在获取用户信息...').start()
          spinner.stop()
          console.log(chalk.bold('\n当前用户信息:\n'))
          console.log(chalk.blue('用户ID:'), response.me.id)
          console.log(chalk.blue('邮箱:'), response.me.email || 'N/A')
          console.log(chalk.blue('类型:'), response.me.type)
          if (response.me.description) {
            console.log(chalk.blue('描述:'), response.me.description)
          }
          console.log(chalk.blue('创建时间:'), new Date(response.me.createdAt).toLocaleString())
          console.log()
        }
      } catch (error) {
        if (isJson) {
          console.log(JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to get user info' }))
        } else {
          const spinner = ora('正在获取用户信息...').start()
          spinner.fail(chalk.red('获取用户信息失败'))
          handleApiError(error)
        }
        process.exit(1)
      }
    })
}