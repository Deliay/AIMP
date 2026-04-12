import { Command } from 'commander'
import { makeSubaccountCreateCommand } from './create'
import { makeSubaccountListCommand } from './list'

export { makeSubaccountCreateCommand, makeSubaccountListCommand }

export const makeSubaccountCommands = (program: Command) => {
  const subaccount = program
    .command('subaccount')
    .description('子帐号管理')

  makeSubaccountCreateCommand(subaccount)
  makeSubaccountListCommand(subaccount)
}
