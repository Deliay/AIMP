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
    .action(async (options, cmd) => {
      let root = cmd.parent;
      while (root?.parent) root = root.parent;
      const isJson = root?.opts()?.json;

      try {
        const serverUrl = cmd.parent?.opts()?.serverUrl;
        await auth.login(options.apiKey, serverUrl)

        const userId = auth.getUserId()

        if (isJson) {
          console.log(JSON.stringify({ success: true, userId }))
        } else {
          const spinner = ora('正在登录...').start()
          spinner.succeed(chalk.green('✓ 登录成功'))
          if (userId) {
            console.log(chalk.blue('用户:'), userId)
          }
        }
      } catch (error) {
        if (isJson) {
          console.log(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Login failed' }))
        } else {
          const spinner = ora('正在登录...').start()
          spinner.fail(chalk.red('登录失败'))
          if (error instanceof ApiError && error.statusCode === 401) {
            console.log(chalk.yellow('API Key 无效，请检查后重试'))
          } else {
            handleApiError(error)
          }
        }
        process.exit(1)
      }
    })
}
