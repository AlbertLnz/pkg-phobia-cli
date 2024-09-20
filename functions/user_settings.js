import fs from 'node:fs/promises'
import pc from 'picocolors'
import { getFilePath } from './get_file_path.js'

const SETTINGS_PATH = getFilePath('../user_settings.json')

const DEFAULT_SETTINGS = {
  dateFormat: 'DD/MM/YYYY',
  numTableRows: 3,
}

export const getSettings = async () => {
  try {
    let settings = await fs.readFile(SETTINGS_PATH, 'utf-8')
    return JSON.parse(settings)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(
        pc.bgRed(pc.bold(pc.whiteBright('⚠️  User settings file not found!')))
      )
      console.log(
        pc.bgGreen(
          pc.bold(pc.whiteBright('🆕 Creating a new user settings file at:'))
        )
      )
      console.log(`${pc.dim(SETTINGS_PATH)}`)

      await fs.writeFile(
        SETTINGS_PATH,
        JSON.stringify(DEFAULT_SETTINGS, null, 2),
        'utf-8'
      )
      return DEFAULT_SETTINGS
    } else {
      console.error(error)
      throw error
    }
  }
}
