import { Command } from 'commander'
import { makeTopicCreateCommand } from './create'
import { makeTopicListCommand } from './list'
import { makeTopicSearchCommand } from './search'

export { makeTopicCreateCommand, makeTopicListCommand, makeTopicSearchCommand }

export const makeTopicCommands = (program: Command) => {
  const topic = program
    .command('topic')
    .description('Topic 管理')

  makeTopicCreateCommand(topic)
  makeTopicListCommand(topic)
  makeTopicSearchCommand(topic)
}