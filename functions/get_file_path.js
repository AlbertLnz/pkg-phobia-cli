import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const getFilePath = (filePath) => {
  const filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(filename)
  const file = join(__dirname, filePath)
  return file
}
