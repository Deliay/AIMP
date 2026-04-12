import { Command } from 'commander'
import chalk from 'chalk'
import { auth } from '../core/auth'
import { resetApiClient } from '../core/api-client'

export const makeLogoutCommand = (program: Command) => {
  program
    .command('logout')
    .description('登出并清除本地配置')
    .action(() => {
      auth.logout()
      resetApiClient()
      console.log(chalk.green('✓ 已成功登出'))
    })
}
