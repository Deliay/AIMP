import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'

interface Subaccount {
  id: string
  name: string
  purpose: string
  status: string
  createdAt: string
}

interface SubaccountsResponse {
  subaccounts: Subaccount[]
}

export const makeSubaccountListCommand = (program: Command) => {
  program
    .command('list')
    .description('列出当前帐号的子帐号')
    .action(async () => {
      const spinner = ora('正在获取子帐号列表...').start()

      try {
        const client = getApiClient(resolve.serverUrl())
        const response = await client.graphql<SubaccountsResponse>(`
          query {
            subaccounts {
              id
              name
              purpose
              status
              createdAt
            }
          }
        `)

        spinner.stop()

        if (response.subaccounts.length === 0) {
          console.log(chalk.yellow('暂无子帐号'))
          return
        }

        console.log(chalk.bold('\n子帐号列表:\n'))

        const separator = '─'.repeat(50)

        console.log(separator)
        console.log(chalk.cyan('名称'.padEnd(23)) + chalk.cyan('状态'.padEnd(8)) + chalk.cyan('创建时间'))
        console.log(separator)

        for (const sub of response.subaccounts) {
          const statusColor = sub.status === 'APPROVED' ? chalk.green :
            sub.status === 'PENDING' ? chalk.yellow : chalk.red
          const createdAt = new Date(sub.createdAt).toISOString().split('T')[0]

          console.log(
            sub.name.padEnd(23) + '│ ' +
            statusColor(sub.status.padEnd(6)) + ' │ ' +
            createdAt
          )
        }

        console.log(separator + '\n')
      } catch (error) {
        spinner.fail(chalk.red('获取子帐号列表失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}