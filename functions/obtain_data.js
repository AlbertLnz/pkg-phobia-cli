import fs from 'node:fs/promises'
import { getFilePath } from './get_file_path.js'

// https://packagephobia.com/v2/api.json?p=satori <---- LATEST VERSION
const PP_PATH_ALL = getFilePath('../local_data/all_ppApi_satori.json')
// https://registry.npmjs.org/satori <--- ALL VERSIONS
const REGISTRY_PATH_ALL = getFilePath(
  '../local_data/all_registryApi_satori.json'
)

const loadJsonData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8')

    return JSON.parse(data)
  } catch (error) {
    console.error('Error al leer o parsear el archivo JSON:', error)
    throw error
  }
}

export const getBothData = async (inProduction = false) => {
  if (!inProduction) {
    const ppApiEndpoint = await loadJsonData(PP_PATH_ALL)
    const registryApiEndpoint = await loadJsonData(REGISTRY_PATH_ALL)

    return {
      ppApi: ppApiEndpoint,
      registryApi: registryApiEndpoint,
    }
  }
}
