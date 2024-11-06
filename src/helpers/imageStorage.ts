import { diskStorage, Options } from 'multer'
import { extname } from 'path'
import fs from 'fs'
import Logging from 'library/Logging'
const FileType = import('file-type')

type validFileExtensionsType = 'png' | 'jpg' | 'jpeg'
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg'

const validFileExtensions: validFileExtensionsType[] = ['png', 'jpg', 'jpeg']
const validMimeType: validMimeType[] = ['image/png', 'image/jpg', 'image/jpeg']

export const saveImageToStorage: Options = {
  storage: diskStorage({
    destination: './files',
    filename(req, file, callback) {
      // creating unique suffix:
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      // getting file extension:
      const fileExtension = extname(file.originalname)
      // write filename
      const filename = `${uniqueSuffix}${fileExtension}`

      callback(null, filename)
    },
  }),

  fileFilter(req, file, callback) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
}

export const isFileExtensionsSafe = async (fullFilePath: string): Promise<boolean> => {
  const fileExtensions = (await FileType).fileTypeFromFile(fullFilePath)
  if (!fileExtensions) {
    return false
  }

  const isValidFileExtensions = validFileExtensions.includes((await fileExtensions).ext as validFileExtensionsType)
  const isValidMimeType = validMimeType.includes((await fileExtensions).mime as validMimeType)
  const isFileValid = isValidFileExtensions && isValidMimeType

  return isFileValid
}

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath)
  } catch (error) {
    Logging.error(error)
  }
}
