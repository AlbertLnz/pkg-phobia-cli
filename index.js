#!/usr/bin/env node

import { Command } from 'commander'
import { getSettings } from './functions/user_settings.js'
import { getBothData } from './functions/obtain_data.js'
import { bytesToMB, colorizeSize } from './functions/programm.js'
import { createTable } from './functions/create_cli_table3.js'

const program = new Command()
program.configureHelp({ showGlobalOptions: true }).option('-g, --global')
const PRODUCTION = false

program
  .arguments('<command>')
  .description(
    'PackagePhobia CLI is a command-line tool that lets you effortlessly check the install size, dependencies, and other crucial details of your favorite packages'
  )
  .option('-a', 'Description')
  .action(async (command) => {
    const settings = await getSettings()
    const { ppApi, registryApi } = await getBothData(PRODUCTION, command)

    const size = bytesToMB(ppApi.install.bytes)
    const prettySize = colorizeSize(size, ppApi.install.color)

    const table = createTable({
      styleBorderColor: 'yellow',
      borderChar: '1x1_double',
    })

    table.push([prettySize])
    console.log(table.toString())
  })

program.parse(process.argv)
