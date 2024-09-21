import fs from 'node:fs/promises'
import { user_agents_list } from '../utils/user_agents.js'
import { getFilePath } from './get_file_path.js'

const USE_LOCAL_USER_AGENTS = false

// https://packagephobia.com/v2/api.json?p=satori <---- LATEST VERSION
const PP_PATH_ALL = getFilePath('../local_data/all_ppApi_satori.json')
// https://registry.npmjs.org/satori <--- ALL VERSIONS
const REGISTRY_PATH_ALL = getFilePath(
  '../local_data/all_registryApi_satori.json'
)

// https://packagephobia.com/v2/api.json?p=satori@0.4.3 <--- SPECIFIC VERSION
const PP_PATH_SPECIFIC = getFilePath('../local_data/specific_ppApi_satori.json')

// https://registry.npmjs.org/satori/0.4.3 <--- SPECIFIC VERSION
const REGISTRY_PATH_SPECIFIC = getFilePath(
  '../local_data/specific_registryApi_satori.json'
)

const getRandomUserAgentByURL = async () => {
  const url =
    'https://raw.githubusercontent.com/AlbertLnz/pkg-phobia-cli/refs/heads/develop/utils/user_agents.txt'

  try {
    const response = await fetch(url)

    if (!response.ok)
      throw new Error(`Error al obtener el archivo: ${response.statusText}`)

    const text = await response.text()
    const userAgents = text.split('\n').filter((line) => line.trim() !== '')
    const randomIndex = Math.floor(Math.random() * userAgents.length)

    return userAgents[randomIndex]
  } catch (error) {
    console.error('Error al obtener User-Agent:', error)
    return null
  }
}

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
  const user_agent = USE_LOCAL_USER_AGENTS
    ? user_agents_list[Math.floor(Math.random() * user_agents_list.length)]
    : await getRandomUserAgentByURL()

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

export const getBothData = async (
  inProduction = false,
  type = 'all',
  command,
  version = undefined
) => {
  if (inProduction) {
    const ppApiEndpoint =
      type === 'all'
        ? `https://packagephobia.com/v2/api.json?p=${command}`
        : `https://packagephobia.com/v2/api.json?p=${command}@${version}`
    const registryApiEndpoint =
      type === 'all'
        ? `https://registry.npmjs.org/${command}`
        : `https://registry.npmjs.org/${command}/${version}`

    const remote_data_ppApi = await loadFetch(ppApiEndpoint)
    const remote_data_registryApi = await loadFetch(registryApiEndpoint)
    return {
      ppApi: remote_data_ppApi,
      registryApi: remote_data_registryApi,
    }
  }

  if (!inProduction) {
    const ppApiEndpoint =
      type === 'all'
        ? await loadJsonData(PP_PATH_ALL)
        : await loadJsonData(PP_PATH_SPECIFIC)

    const registryApiEndpoint =
      type === 'all'
        ? await loadJsonData(REGISTRY_PATH_ALL)
        : await loadJsonData(REGISTRY_PATH_SPECIFIC)

    return {
      ppApi: ppApiEndpoint,
      registryApi: registryApiEndpoint,
    }
  }
}
