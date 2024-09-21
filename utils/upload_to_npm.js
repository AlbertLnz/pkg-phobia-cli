import fs from 'fs/promises'
import path from 'path'
import { minify } from 'minify'

const FOLDER_TO_SAVE_MINIFIED_FILES = './npm_pkg_min'
const PATH_FILES_TO_MINIFY = [
  'index.js',
  'data/user_questions.js',
  'functions/config_questions.js',
  'functions/create_cli_table3.js',
  'functions/get_file_path.js',
  'functions/obtain_data.js',
  'functions/programm.js',
  'functions/user_settings.js',
]
const PATH_FILES_TO_CLONE = [
  'package_production.json', // <-- checked before minify
  'user_settings.json',
  'README.npm.md',
]

const setExecutablePermissions = async (filePath) => {
  await fs.chmod(filePath, 0o755) // Establece permisos de ejecución
}

const minifyFnct = async () => {
  await fs.mkdir(FOLDER_TO_SAVE_MINIFIED_FILES, { recursive: true })

  for (let i = 0; i < PATH_FILES_TO_MINIFY.length; i++) {
    const file = PATH_FILES_TO_MINIFY[i]

    const nameFileToMin = PATH_FILES_TO_MINIFY[i]

    const outputDirectory = path.dirname(nameFileToMin)
    const outputFilePath = path.join(
      FOLDER_TO_SAVE_MINIFIED_FILES,
      nameFileToMin
    )

    if (outputDirectory) {
      await fs.mkdir(
        path.join(FOLDER_TO_SAVE_MINIFIED_FILES, outputDirectory),
        { recursive: true }
      )
    }

    try {
      const data = await minify(file, {
        compress: true,
        mangle: true,
        toplevel: true,
        output: {
          beautify: true,
          indent_level: 2,
          comments: false,
        },
      })

      await fs.writeFile(outputFilePath, data, 'utf-8')
      await setExecutablePermissions(outputFilePath)
      console.log(`Minified file saved to: ${outputFilePath}`)
    } catch (error) {
      console.error(`Error minifying ${file}:`, error)
    }
  }
}

const cloneFile = async () => {
  for (let i = 0; i < PATH_FILES_TO_CLONE.length; i++) {
    let file = PATH_FILES_TO_CLONE[i]

    if (file.matchAll('package_production.json')) {
      file = file.replace('package_production.json', 'package.json')
    }

    const outputFilePath = path.join(
      FOLDER_TO_SAVE_MINIFIED_FILES,
      path.basename(file)
    )

    try {
      await fs.copyFile(file, outputFilePath)
      await setExecutablePermissions(outputFilePath)
      console.log(`File ${file} copied to ${outputFilePath}`)
    } catch (error) {
      console.error(`Error copying ${file}:`, error)
    }
  }
}

const upload_to_npm = async () => {
  await minifyFnct()
  await cloneFile()
}

upload_to_npm()
