import { jest } from '@jest/globals'

export const getFileInfo = jest.fn<typeof import('prettier').getFileInfo>()
export const check = jest.fn<typeof import('prettier').check>()
export const format = jest.fn<typeof import('prettier').format>()

export default {
  getFileInfo,
  check,
  format
}
