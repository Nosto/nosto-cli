import { describe, it, expect } from 'vitest'
import { MissingConfigurationError } from '../../src/errors/MissingConfigurationError.ts'

describe('MissingConfigurationError', () => {
  it('should create error with correct name and message', () => {
    const error = new MissingConfigurationError('Test configuration error')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(MissingConfigurationError)
    expect(error.name).toBe('MissingConfigurationError')
    expect(error.message).toBe('Test configuration error')
  })

  it('should be throwable and catchable', () => {
    const testMessage = 'Missing API key'
    
    expect(() => {
      throw new MissingConfigurationError(testMessage)
    }).toThrow(MissingConfigurationError)
    
    expect(() => {
      throw new MissingConfigurationError(testMessage)
    }).toThrow(testMessage)
  })

  it('should have stack trace', () => {
    const error = new MissingConfigurationError('Test error')
    
    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })
})