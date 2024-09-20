#!/usr/bin/env node

import { Command } from 'commander'
import pc from 'picocolors'
import { getSettings } from './functions/user_settings.js'
import { getBothData } from './functions/obtain_data.js'
import {
  bytesToMB,
  colorizeSize,
  parseRepositoryUrl,
} from './functions/programm.js'
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
  .action(async (command, option) => {
    const settings = await getSettings()
    const { ppApi, registryApi } = await getBothData(PRODUCTION, command)

    const size = bytesToMB(ppApi.install.bytes)
    const prettySize = colorizeSize(size, ppApi.install.color)

    const table = createTable({
      styleBorderColor: 'yellow',
      borderChar: '1x1_double',
    })

    if (option.a) {
      const table = createTable({
        styleBorderColor: 'cyan',
        borderChar: '1x1_double',
      })

      const npmPackage = pc.cyanBright(
        `Package: ${pc.bold(ppApi.name)}@${pc.bold(ppApi.version)}`
      )
      const author = pc.greenBright(
        `Author: ${pc.bold(registryApi.author.name)}`
      )
      const description = pc.whiteBright(
        `Description: ${pc.dim(registryApi.description)}`
      )
      const repository = pc.blueBright(
        `Repository: ${pc.underline(
          parseRepositoryUrl(registryApi.repository.url)
        )}`
      )
      const install_size = pc.yellowBright(
        `Install size: ${pc.bold(size + ' MB')}`
      )
      const num_files = pc.magentaBright(
        `Number of files: ${pc.bold(ppApi.install.files)}`
      )

      const all_info = `${npmPackage}\n${author}\n${description}\n\n${repository}\n\n${install_size}\n${num_files}`
      table.push([all_info])
      return console.log(table.toString())
    }

    table.push([prettySize])
    console.log(table.toString())
  })

program.parse(process.argv)
