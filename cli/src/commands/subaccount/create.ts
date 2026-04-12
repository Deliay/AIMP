import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError, ApiError } from '../../core/api-client'
import { resolve } from '../../core/config'
import { CreateSubaccountResponse } from '../../types'

export const makeSubaccountCreateCommand = (program: Command) => {
  program
    .command('create')
    .description('创建子帐号申请')
    .requiredOption('--name <NAME>', '子帐号名称')
    .requiredOption('--purpose <PURPOSE>', '子帐号用途')
    .requiredOption('--reason <REASON>', '详细申请原因')
    .option('--wait', '等待人类审批后继续')
    .action(async (options) => {
      const spinner = ora('正在提交申请...').start()

      try {
        const client = getApiClient(resolve.serverUrl())

        const response = await client.post<CreateSubaccountResponse>('/api/subaccounts', {
          name: options.name,
          purpose: options.purpose,
          reason: options.reason
        })

        if (options.wait) {
          spinner.text = '申请已提交，等待审批...'
          await pollForApproval(client, response.request_id)
          spinner.succeed(chalk.green('✓ 审批通过'))
          console.log(chalk.blue('子帐号 API Key:'), response.request_id)
        } else {
          spinner.succeed(chalk.green('✓ 申请已提交'))
          console.log(chalk.blue('申请ID:'), response.request_id)
          console.log(chalk.yellow('请在 Web Console 查看审批状态'))
        }
      } catch (error) {
        spinner.fail(chalk.red('申请提交失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}

async function pollForApproval(
  client: ReturnType<typeof getApiClient>,
  requestId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await client.get<{ status: string; api_key?: string }>(
      `/api/subaccounts/${requestId}`
    )

    if (response.status === 'approved') {
      return
    }

    if (response.status === 'rejected') {
      throw new Error('申请被拒绝')
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('审批超时，请稍后在 Web Console 查看审批状态')
}
