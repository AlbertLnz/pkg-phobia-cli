#!/usr/bin/env node

import { Command } from 'commander'

const program = new Command()
program.configureHelp({ showGlobalOptions: true }).option('-g, --global')

program
  .arguments('<command>')
  .description(
    'PackagePhobia CLI is a command-line tool that lets you effortlessly check the install size, dependencies, and other crucial details of your favorite packages'
  )
  .action(async (command) => {
    console.log('command:', command)
  })

program.parse(process.argv)
