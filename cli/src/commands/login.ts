import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { auth } from '../core/auth'
import { resolve } from '../core/config'
import { handleApiError, ApiError } from '../core/api-client'

export const makeLoginCommand = (program: Command) => {
  program
    .command('login')
    .description('登录 AIMP 平台')
    .requiredOption('--api-key <KEY>', 'API Key')
    .option('--server <URL>', '指定 API 服务器地址')
    .action(async (options) => {
      const spinner = ora('正在登录...').start()

      try {
        const serverUrl = resolve.serverUrl(options.server)
        await auth.login(options.apiKey, serverUrl)

        spinner.succeed(chalk.green('✓ 登录成功'))

        const userId = auth.getUserId()
        if (userId) {
          console.log(chalk.blue('用户:'), userId)
        }
      } catch (error) {
        spinner.fail(chalk.red('登录失败'))
        if (error instanceof ApiError && error.statusCode === 401) {
          console.log(chalk.yellow('API Key 无效，请检查后重试'))
        } else {
          handleApiError(error)
        }
        process.exit(1)
      }
    })
}
