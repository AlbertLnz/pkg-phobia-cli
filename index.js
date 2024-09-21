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
const PRODUCTION = true

program
  .command('get-config')
  .description('Get the Packagephobia CLI configuration')
  .action(async () => {
    const settings = await getSettings()
    return console.log(JSON.stringify(settings, null, 2))
  })

program
  .command('set-config')
  .description('Configure the Packagephobia CLI')
  .action(async () => {
    const settings = await getSettings()

    async function main() {
      p.intro(
        `${pc.bgMagenta(pc.black('  --Configure the Packagephobia CLI--  '))}`
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
  .arguments('<command> [version]')
  .description(
    'PackagePhobia CLI is a command-line tool that lets you effortlessly check the install size, dependencies, and other crucial details of your favorite packages'
  )
  .option('-a', 'Description')
  .option('-v', '--latestVersion')
  .option('--all', 'Description')
  .option('--table', 'Show output in table format')
  .action(async (command, version, options) => {
    const settings = await getSettings()
    const { ppApi, registryApi } = await getBothData(PRODUCTION, 'all', command)

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
        '\nAuthor: ' +
          pc.bold(
            registryApi?.author?.name ? registryApi.author.name : 'Unknown'
          )
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

      if (options.all) {
        const maxItemsPerRow = 15

        const rows = []
        for (let i = 0; i < arrayVersionsKeys.length; i += maxItemsPerRow) {
          rows.push(
            arrayVersionsKeys
              .slice(i, i + maxItemsPerRow)
              .map((version) => pc.dim(version))
              .join(', ')
          )
        }

        const table = createTable({
          styleBorderColor: 'white',
          borderChar: '1x1_double',
        })

        rows.forEach((row) => table.push([row]))
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

    if (version) {
      const { ppApi, registryApi } = await getBothData(
        PRODUCTION,
        'specific',
        command,
        version
      )

      if (ppApi.version === registryApi.version) {
        const table = createTable({
          borderChar: 'all_double',
          styleCompact: false,
          styleBorderColor: 'green',
        })

        const packageName = pc.cyanBright(
          'Package: ' + pc.bold(registryApi.name)
        )

        const author = pc.greenBright(
          '\nAuthor: ' +
            pc.bold(
              registryApi?.author?.name ? registryApi.author.name : 'Unknown'
            )
        )
        const description = pc.whiteBright(
          '\nDescription: ' + pc.dim(registryApi.description)
        )
        const unpackedSize = pc.yellowBright(
          '\nUnpacked size: ' +
            pc.bold(bytesToMB(registryApi.dist.unpackedSize) + ' MB')
        )
        const repository = pc.blueBright(
          '\nRepository: ' +
            pc.bold(
              pc.underline(parseRepositoryUrl(registryApi.repository.url))
            )
        )
        const npmVersion = pc.red(
          '\nNPM version: ' + pc.bold(registryApi._npmVersion)
        )
        const nodeVersion = pc.green(
          '\nNode version: ' + pc.bold(registryApi._nodeVersion)
        )
        const dependencies = registryApi.dependencies
        const devDependencies = registryApi.devDependencies

        const row1 =
          packageName +
          author +
          description +
          unpackedSize +
          repository +
          npmVersion +
          nodeVersion

        const row2 =
          pc.dim(pc.bold(pc.underline('Dependencies') + ':\n')) +
          Object.entries(dependencies)
            .map(
              ([name, version]) =>
                ` · ${pc.italic(name)}: ${pc.bold(pc.whiteBright(version))}`
            )
            .join('\n')

        const row3 =
          pc.dim(pc.bold(pc.underline('Dev Dependencies') + ':\n')) +
          Object.entries(devDependencies)
            .map(
              ([name, version]) =>
                ` · ${pc.italic(name)}: ${pc.bold(pc.whiteBright(version))}`
            )
            .join('\n')

        table.push([row1], [row2], [row3])

        return console.log(table.toString())
      } else {
        return console.log('Version not found')
      }
    }

    table.push([prettySize])
    return console.log(table.toString())
  })

program.parse(process.argv)
