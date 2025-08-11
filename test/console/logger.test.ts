import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Logger } from '../../src/console/logger.ts'

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset context to defaults
    Logger.context = {
      logLevel: 'info',
      merchantId: '',
      isDryRun: false
    }
  })

  describe('context management', () => {
    it('should have default context', () => {
      expect(Logger.context).toEqual({
        logLevel: 'info',
        merchantId: '',
        isDryRun: false
      })
    })

    it('should allow updating context', () => {
      Logger.context = {
        logLevel: 'debug',
        merchantId: 'test-merchant',
        isDryRun: true
      }
      
      expect(Logger.context.logLevel).toBe('debug')
      expect(Logger.context.merchantId).toBe('test-merchant')
      expect(Logger.context.isDryRun).toBe(true)
    })
  })

  describe('log level filtering', () => {
    it('should log info when level is info', () => {
      Logger.context.logLevel = 'info'
      Logger.info('test message')
      
      expect(console.info).toHaveBeenCalled()
    })

    it('should not log debug when level is info', () => {
      Logger.context.logLevel = 'info'
      Logger.debug('test message')
      
      expect(console.debug).not.toHaveBeenCalled()
    })

    it('should log debug when level is debug', () => {
      Logger.context.logLevel = 'debug'
      Logger.debug('test message')
      
      expect(console.debug).toHaveBeenCalled()
    })

    it('should log error regardless of level', () => {
      Logger.context.logLevel = 'error'
      Logger.error('test message')
      
      expect(console.error).toHaveBeenCalled()
    })

    it('should respect log level hierarchy', () => {
      // Set to warn level
      Logger.context.logLevel = 'warn'
      
      // Should log warn and error
      Logger.warn('warn message')
      Logger.error('error message')
      
      expect(console.warn).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
      
      // Should not log debug and info
      Logger.debug('debug message')
      Logger.info('info message')
      
      expect(console.debug).not.toHaveBeenCalled()
      expect(console.info).not.toHaveBeenCalled()
    })
  })

  describe('message formatting', () => {
    beforeEach(() => {
      Logger.context.logLevel = 'debug' // Enable all logs
    })

    it('should include merchant ID in message when set', () => {
      Logger.context.merchantId = 'test-merchant'
      Logger.info('test message')
      
      const call = vi.mocked(console.info).mock.calls[0][0]
      expect(call).toContain('test-merchant')
    })

    it('should include dry run indicator when enabled', () => {
      Logger.context.isDryRun = true
      Logger.info('test message')
      
      const call = vi.mocked(console.info).mock.calls[0][0]
      expect(call).toContain('(DRY RUN)')
    })

    it('should handle extra data parameter', () => {
      const extraData = { key: 'value' }
      Logger.info('test message', extraData)
      
      expect(console.info).toHaveBeenCalledTimes(2) // message + extra data
    })

    it('should stringify non-string messages', () => {
      const objectMessage = { test: 'value' }
      Logger.info(objectMessage as any)
      
      expect(console.info).toHaveBeenCalled()
    })
  })

  describe('raw logging', () => {
    it('should log raw message without formatting', () => {
      Logger.raw('raw message')
      
      expect(console.log).toHaveBeenCalledWith('raw message')
    })

    it('should handle extra data in raw logging', () => {
      const extraData = { key: 'value' }
      Logger.raw('raw message', extraData)
      
      expect(console.log).toHaveBeenCalledTimes(2)
      expect(console.log).toHaveBeenCalledWith('raw message')
      expect(console.log).toHaveBeenCalledWith(JSON.stringify(extraData, null, 2))
    })
  })

  describe('log methods', () => {
    beforeEach(() => {
      Logger.context.logLevel = 'debug' // Enable all logs
    })

    it('should call debug method', () => {
      Logger.debug('debug message')
      expect(console.debug).toHaveBeenCalled()
    })

    it('should call info method', () => {
      Logger.info('info message')
      expect(console.info).toHaveBeenCalled()
    })

    it('should call warn method', () => {
      Logger.warn('warn message')
      expect(console.warn).toHaveBeenCalled()
    })

    it('should call error method', () => {
      Logger.error('error message')
      expect(console.error).toHaveBeenCalled()
    })
  })
})