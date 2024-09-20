import fs from 'node:fs/promises'
import { getFilePath } from './get_file_path.js'
import { user_agents_list } from '../utils/user_agents.js'

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

const loadFetch = async (endpoint) => {
  const user_agent =
    user_agents_list[Math.floor(Math.random() * user_agents_list.length)]

  try {
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': user_agent,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.error('Error al leer o parsear el archivo JSON:', error)
    throw error
  }
}

export const getBothData = async (inProduction = false, command) => {
  if (inProduction) {
    const ppApiEndpoint = `https://packagephobia.com/v2/api.json?p=${command}`
    const registryApiEndpoint = `https://registry.npmjs.org/${command}`

    const remote_data_ppApi = await loadFetch(ppApiEndpoint)
    const remote_data_registryApi = await loadFetch(registryApiEndpoint)
    return {
      ppApi: remote_data_ppApi,
      registryApi: remote_data_registryApi,
    }
  }

  if (!inProduction) {
    const ppApiEndpoint = await loadJsonData(PP_PATH_ALL)
    const registryApiEndpoint = await loadJsonData(REGISTRY_PATH_ALL)

    return {
      ppApi: ppApiEndpoint,
      registryApi: registryApiEndpoint,
    }
  }
}
