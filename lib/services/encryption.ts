import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import { EncryptionAlgo } from '@prisma/client'

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_ROUNDS = 12
const TAG_LENGTH = 16

// Ensure encryption key is properly set
if (!process.env.ENCRYPTION_KEY) {
  console.warn('[Encryption] ENCRYPTION_KEY not set in environment. Using generated key (not recommended for production)')
}

export interface EncryptionResult {
  encryptedData: string
  algorithm: EncryptionAlgo
  keyVersion: number
}

export interface DecryptionResult {
  decryptedData: string
  success: boolean
}

export class EncryptionService {
  private static keyVersion = 1

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  static encrypt(plaintext: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(IV_LENGTH)
      const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
      cipher.setAAD(Buffer.from('RYD-HR-SYSTEM'))

      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const authTag = cipher.getAuthTag()
      
      // Combine IV, auth tag, and encrypted data
      const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted

      return {
        encryptedData: combined,
        algorithm: EncryptionAlgo.AES_256,
        keyVersion: this.keyVersion
      }
    } catch (error) {
      console.error('[Encryption] Failed to encrypt data:', error)
      throw new Error('Encryption failed')
    }
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   */
  static decrypt(encryptedData: string): DecryptionResult {
    try {
      const parts = encryptedData.split(':')
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format')
      }

      const iv = Buffer.from(parts[0], 'hex')
      const authTag = Buffer.from(parts[1], 'hex')
      const encrypted = parts[2]

      const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
      decipher.setAAD(Buffer.from('RYD-HR-SYSTEM'))
      decipher.setAuthTag(authTag)

      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return {
        decryptedData: decrypted,
        success: true
      }
    } catch (error) {
      console.error('[Encryption] Failed to decrypt data:', error)
      return {
        decryptedData: '',
        success: false
      }
    }
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, SALT_ROUNDS)
    } catch (error) {
      console.error('[Encryption] Failed to hash password:', error)
      throw new Error('Password hashing failed')
    }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      console.error('[Encryption] Failed to verify password:', error)
      return false
    }
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID()
  }

  /**
   * Create HMAC signature for data integrity
   */
  static createHMAC(data: string, secret?: string): string {
    const hmacSecret = secret || ENCRYPTION_KEY
    return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex')
  }

  /**
   * Verify HMAC signature
   */
  static verifyHMAC(data: string, signature: string, secret?: string): boolean {
    const hmacSecret = secret || ENCRYPTION_KEY
    const expectedSignature = crypto.createHmac('sha256', hmacSecret).update(data).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  }

  /**
   * Encrypt and store sensitive field in database
   */
  static async encryptAndStore(
    tableName: string,
    recordId: string,
    fieldName: string,
    plaintext: string
  ): Promise<void> {
    try {
      const encryptionResult = this.encrypt(plaintext)
      
      await prisma.encryptedData.upsert({
        where: {
          tableName_recordId_fieldName: {
            tableName,
            recordId,
            fieldName
          }
        },
        update: {
          encryptedValue: encryptionResult.encryptedData,
          algorithm: encryptionResult.algorithm,
          keyVersion: encryptionResult.keyVersion,
          updatedAt: new Date()
        },
        create: {
          tableName,
          recordId,
          fieldName,
          encryptedValue: encryptionResult.encryptedData,
          algorithm: encryptionResult.algorithm,
          keyVersion: encryptionResult.keyVersion
        }
      })
    } catch (error) {
      console.error('[Encryption] Failed to encrypt and store data:', error)
      throw new Error('Failed to encrypt and store sensitive data')
    }
  }

  /**
   * Retrieve and decrypt sensitive field from database
   */
  static async retrieveAndDecrypt(
    tableName: string,
    recordId: string,
    fieldName: string
  ): Promise<string | null> {
    try {
      const encryptedRecord = await prisma.encryptedData.findUnique({
        where: {
          tableName_recordId_fieldName: {
            tableName,
            recordId,
            fieldName
          }
        }
      })

      if (!encryptedRecord) {
        return null
      }

      const decryptionResult = this.decrypt(encryptedRecord.encryptedValue)
      return decryptionResult.success ? decryptionResult.decryptedData : null
    } catch (error) {
      console.error('[Encryption] Failed to retrieve and decrypt data:', error)
      return null
    }
  }

  /**
   * Encrypt sensitive user data fields
   */
  static async encryptUserSensitiveData(userId: string, data: {
    nationalId?: string
    phone?: string
    emergencyContact?: string
    bankDetails?: string
  }): Promise<void> {
    const promises = []

    if (data.nationalId) {
      promises.push(this.encryptAndStore('User', userId, 'nationalId', data.nationalId))
    }
    if (data.phone) {
      promises.push(this.encryptAndStore('User', userId, 'phone', data.phone))
    }
    if (data.emergencyContact) {
      promises.push(this.encryptAndStore('User', userId, 'emergencyContact', data.emergencyContact))
    }
    if (data.bankDetails) {
      promises.push(this.encryptAndStore('User', userId, 'bankDetails', data.bankDetails))
    }

    await Promise.all(promises)
  }

  /**
   * Decrypt sensitive user data fields
   */
  static async decryptUserSensitiveData(userId: string): Promise<{
    nationalId?: string
    phone?: string
    emergencyContact?: string
    bankDetails?: string
  }> {
    const [nationalId, phone, emergencyContact, bankDetails] = await Promise.all([
      this.retrieveAndDecrypt('User', userId, 'nationalId'),
      this.retrieveAndDecrypt('User', userId, 'phone'),
      this.retrieveAndDecrypt('User', userId, 'emergencyContact'),
      this.retrieveAndDecrypt('User', userId, 'bankDetails')
    ])

    return {
      ...(nationalId && { nationalId }),
      ...(phone && { phone }),
      ...(emergencyContact && { emergencyContact }),
      ...(bankDetails && { bankDetails })
    }
  }

  /**
   * Encrypt employee sensitive data
   */
  static async encryptEmployeeSensitiveData(employeeId: string, data: {
    nationalId?: string
    phone?: string
    address?: string
    bankAccount?: string
    taxId?: string
  }): Promise<void> {
    const promises = []

    if (data.nationalId) {
      promises.push(this.encryptAndStore('EmployeeProfile', employeeId, 'nationalId', data.nationalId))
    }
    if (data.phone) {
      promises.push(this.encryptAndStore('EmployeeProfile', employeeId, 'phone', data.phone))
    }
    if (data.address) {
      promises.push(this.encryptAndStore('EmployeeProfile', employeeId, 'address', data.address))
    }
    if (data.bankAccount) {
      promises.push(this.encryptAndStore('EmployeeProfile', employeeId, 'bankAccount', data.bankAccount))
    }
    if (data.taxId) {
      promises.push(this.encryptAndStore('EmployeeProfile', employeeId, 'taxId', data.taxId))
    }

    await Promise.all(promises)
  }

  /**
   * Decrypt employee sensitive data
   */
  static async decryptEmployeeSensitiveData(employeeId: string): Promise<{
    nationalId?: string
    phone?: string
    address?: string
    bankAccount?: string
    taxId?: string
  }> {
    const [nationalId, phone, address, bankAccount, taxId] = await Promise.all([
      this.retrieveAndDecrypt('EmployeeProfile', employeeId, 'nationalId'),
      this.retrieveAndDecrypt('EmployeeProfile', employeeId, 'phone'),
      this.retrieveAndDecrypt('EmployeeProfile', employeeId, 'address'),
      this.retrieveAndDecrypt('EmployeeProfile', employeeId, 'bankAccount'),
      this.retrieveAndDecrypt('EmployeeProfile', employeeId, 'taxId')
    ])

    return {
      ...(nationalId && { nationalId }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(bankAccount && { bankAccount }),
      ...(taxId && { taxId })
    }
  }

  /**
   * Rotate encryption keys (for key management)
   */
  static async rotateEncryptionKey(newKey: string): Promise<void> {
    // This would be implemented for key rotation in production
    // For now, we'll increment the key version
    this.keyVersion += 1
    console.log(`[Encryption] Key version updated to ${this.keyVersion}`)
  }

  /**
   * Get encryption statistics
   */
  static async getEncryptionStats(): Promise<{
    totalEncryptedRecords: number
    encryptedTables: string[]
    keyVersion: number
    algorithm: string
  }> {
    const stats = await prisma.encryptedData.groupBy({
      by: ['tableName'],
      _count: {
        id: true
      }
    })

    const totalEncryptedRecords = stats.reduce((sum, stat) => sum + stat._count.id, 0)
    const encryptedTables = stats.map(stat => stat.tableName)

    return {
      totalEncryptedRecords,
      encryptedTables,
      keyVersion: this.keyVersion,
      algorithm: ALGORITHM
    }
  }

  /**
   * Validate data integrity using checksums
   */
  static validateDataIntegrity(data: string, checksum: string): boolean {
    const calculatedChecksum = crypto.createHash('sha256').update(data).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(checksum), Buffer.from(calculatedChecksum))
  }

  /**
   * Create data checksum
   */
  static createChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }
}

// Export commonly used functions
export const encrypt = EncryptionService.encrypt
export const decrypt = EncryptionService.decrypt
export const hashPassword = EncryptionService.hashPassword
export const verifyPassword = EncryptionService.verifyPassword
export const generateSecureToken = EncryptionService.generateSecureToken