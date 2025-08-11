import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import { parseConfigFile } from '../../src/config/fileConfig.ts'

vi.mock('fs')
vi.mock('../../src/console/logger.ts', () => ({
  Logger: {
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('File Config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseConfigFile', () => {
    it('should return empty object when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)
      
      const result = parseConfigFile('/test/path')
      
      expect(result).toEqual({})
      expect(fs.existsSync).toHaveBeenCalledWith('/test/path/.nosto.json')
    })

    it('should parse valid JSON config file', () => {
      const mockConfig = {
        apiKey: 'test-key',
        merchant: 'test-merchant',
        logLevel: 'debug'
      }
      
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig))
      
      const result = parseConfigFile('/test/path')
      
      expect(result).toEqual(mockConfig)
      expect(fs.readFileSync).toHaveBeenCalledWith('/test/path/.nosto.json', 'utf-8')
    })

    it('should throw error for invalid JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json{')
      
      expect(() => parseConfigFile('/test/path')).toThrow('Invalid JSON in configuration file')
    })

    it('should throw error for invalid config schema', () => {
      const invalidConfig = {
        apiKey: 'test-key',
        logLevel: 'invalid-level'
      }
      
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(invalidConfig))
      
      expect(() => parseConfigFile('/test/path')).toThrow('Invalid configuration file')
    })

    it('should handle file read errors', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File read error')
      })
      
      expect(() => parseConfigFile('/test/path')).toThrow('File read error')
    })
  })
})