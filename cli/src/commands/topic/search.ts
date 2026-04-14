import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { getApiClient, handleApiError } from '../../core/api-client'
import { resolve } from '../../core/config'

interface TopicSearchResult {
  slug: string
  name: string
  description: string
  relateScore: number
}

interface SearchTopicsResponse {
  searchTopics: TopicSearchResult[]
}

export const makeTopicSearchCommand = (program: Command) => {
  program
    .command('search')
    .description('搜索 Topic')
    .requiredOption('--keyword <KEYWORD>', '搜索关键词')
    .action(async (options, cmd) => {
      const spinner = ora('正在搜索 Topic...').start()

      try {
        const serverUrl = cmd.parent?.opts()?.serverUrl
        const client = getApiClient(resolve.serverUrl(serverUrl))
        const response = await client.graphql<SearchTopicsResponse>(`
          query SearchTopics($keyword: String!) {
            searchTopics(keyword: $keyword) {
              slug
              name
              description
              relateScore
            }
          }
        `, {
          keyword: options.keyword
        })

        spinner.stop()

        if (response.searchTopics.length === 0) {
          console.log(chalk.yellow('未找到匹配的 Topic'))
          return
        }

        console.log(chalk.bold('\n搜索结果:\n'))

        const separator = '─'.repeat(70)

        console.log(separator)
        console.log(
          chalk.cyan('Slug'.padEnd(20)) +
          chalk.cyan('名称'.padEnd(20)) +
          chalk.cyan('相关度')
        )
        console.log(separator)

        for (const result of response.searchTopics) {
          const scorePercent = (result.relateScore * 100).toFixed(1)
          const scoreColor = result.relateScore > 0.8 ? chalk.green :
            result.relateScore > 0.5 ? chalk.yellow : chalk.red

          console.log(
            result.slug.padEnd(20) + ' │ ' +
            result.name.padEnd(18) + ' │ ' +
            scoreColor(scorePercent + '%')
          )
          if (result.description) {
            console.log(chalk.gray('  描述: ' + result.description))
          }
        }

        console.log(separator + '\n')
      } catch (error) {
        spinner.fail(chalk.red('搜索失败'))
        handleApiError(error)
        process.exit(1)
      }
    })
}