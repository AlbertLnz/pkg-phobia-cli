#!/usr/bin/env node

import { Command } from 'commander'
import pc from 'picocolors'
import * as p from '@clack/prompts'
import { getSettings, insertSettings } from './functions/user_settings.js'
import { getBothData } from './functions/obtain_data.js'
import {
  bytesToMB,
  colorizeSize,
  parseRepositoryUrl,
  formatDate,
  iterateTable,
  fakeSpinner,
} from './functions/programm.js'
import { createTable } from './functions/create_cli_table3.js'
import { askQuestion } from './functions/config_questions.js'
import { questions } from './data/user_questions.js'

const program = new Command()
program.configureHelp({ showGlobalOptions: true }).option('-g, --global')
const PRODUCTION = false

program
  .command('get-config')
  .description('Get the packagephobia CLI configuration')
  .action(async () => {
    const settings = await getSettings()
    console.log(JSON.stringify(settings, null, 2))
  })

program
  .command('set-config')
  .description('Configure the packagephobia CLI')
  .action(async () => {
    const settings = await getSettings()

    async function main() {
      p.intro(
        `${pc.bgMagenta(pc.black('  --Configure the packagephobia CLI--  '))}`
      )

      const user_config = {}
      for (const question of Object.values(questions)) {
        const response = await askQuestion(
          question.question,
          question.optionsLabel,
          question.optionsValue,
          settings[question.settingLabel]
        )
        user_config[question.settingLabel] = response
      }

      await insertSettings(user_config)
      await fakeSpinner(pc.bold(pc.dim('Saving configuration...')), 1500)
      p.outro(`${pc.yellowBright(pc.bold('Establish right!!'))}`)
    }
    main().catch(console.error)
  })

program
  .arguments('<command>')
  .description(
    'PackagePhobia CLI is a command-line tool that lets you effortlessly check the install size, dependencies, and other crucial details of your favorite packages'
  )
  .option('-a', 'Description')
  .option('-v', '--latestVersion')
  .option('--all', 'Description')
  .option('--table', 'Show output in table format')
  .action(async (command, options) => {
    const settings = await getSettings()
    const { ppApi, registryApi } = await getBothData(PRODUCTION, command)

    const size = bytesToMB(ppApi.install.bytes)
    const prettySize = colorizeSize(size, ppApi.install.color)

    const table = createTable({
      styleBorderColor: 'yellow',
      borderChar: '1x1_double',
    })

    if (options.a) {
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

    if (options.v) {
      const arrayVersionsKeys = Object.keys(registryApi.versions)
      const numBy2Sides = options.all
        ? arrayVersionsKeys.length
        : settings.numTableRows

      if (options.table) {
        const firstRows = arrayVersionsKeys.slice(0, numBy2Sides)
        const lastRows = arrayVersionsKeys.slice(-numBy2Sides)

        let rows = []

        rows = await iterateTable(
          firstRows,
          registryApi,
          rows,
          1,
          arrayVersionsKeys.length,
          numBy2Sides,
          settings
        )

        if (!options.all) {
          rows.push(['...', '...', '...', '...'])
          rows = await iterateTable(
            lastRows,
            registryApi,
            rows,
            2,
            arrayVersionsKeys.length,
            numBy2Sides,
            settings
          )
        }

        const table = createTable({
          head: [
            pc.magentaBright(pc.bold('Id')),
            pc.greenBright(pc.bold('Version')),
            pc.yellowBright(pc.bold('Publish Unpacked Size')),
            pc.blueBright(pc.bold('Timestamp')),
          ],
          colWidths: [6, 15, 30, 25],
          colAligns: ['center', 'center', 'center', 'center'],
          styleBorderColor: 'blue',
          styleCompact: true,
          borderChar: 'all_double',
        })

        table.push(...rows)

        return console.log(table.toString())
      }

      const lastVersion = arrayVersionsKeys.at(-1)
      const formattedDate = await formatDate(
        settings,
        registryApi.time[lastVersion]
      )
      return console.log(
        pc.greenBright('Latest: ' + pc.bold(lastVersion)) +
          ' | ' +
          pc.yellowBright(
            'Size: ' +
              pc.bold(
                `${bytesToMB(
                  registryApi.versions[lastVersion].dist.unpackedSize
                )} MB`
              )
          ) +
          ' | ' +
          pc.blueBright('Date: ' + pc.bold(formattedDate))
      )
    }

    table.push([prettySize])
    console.log(table.toString())
  })

program.parse(process.argv)
