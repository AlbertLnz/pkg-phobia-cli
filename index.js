#!/usr/bin/env node

import { Command } from 'commander'
import { getSettings } from './functions/user_settings.js'
import { getBothData } from './functions/obtain_data.js'

const program = new Command()
program.configureHelp({ showGlobalOptions: true }).option('-g, --global')
const PRODUCTION = false

program
  .arguments('<command>')
  .description(
    'PackagePhobia CLI is a command-line tool that lets you effortlessly check the install size, dependencies, and other crucial details of your favorite packages'
  )
  .action(async (command) => {
    const settings = await getSettings()
    console.log(JSON.stringify(settings, null, 2))

    const { ppApi, registryApi } = await getBothData(PRODUCTION, 'all', command)
    console.log('PackagePhobia API', ppApi)
    console.log('NPM Registry API', registryApi)
  })

program.parse(process.argv)
