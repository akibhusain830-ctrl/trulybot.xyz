/**
 * Enterprise-grade encryption utilities for WooCommerce API credentials
 * Uses AES-256-GCM for authenticated encryption with associated data (AEAD)
 */

import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

/**
 * Derives encryption key from master key and salt using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  // In production, this should use a proper key derivation function
  // For now, we'll use a simple derivation (replace with crypto.scrypt or similar)
  const crypto = require('crypto');
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Gets the master encryption key from environment
 * Falls back to a generated key if not set (for development)
 */
function getMasterKey(): string {
  const masterKey = process.env.WOOCOMMERCE_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  if (!masterKey) {
    return process.env.NEXTAUTH_SECRET || randomBytes(KEY_LENGTH).toString('hex');
  }
  return masterKey;
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns base64 encoded string containing salt, IV, tag, and ciphertext
 */
export async function encryptCredential(data: string): Promise<string> {
  try {
    const masterKey = getMasterKey();
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);
    const key = deriveKey(masterKey, salt);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Add timestamp as additional authenticated data to prevent replay attacks
    const timestamp = Buffer.from(Date.now().toString());
    cipher.setAAD(timestamp);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine all components: salt:iv:tag:timestamp:ciphertext
    const result = [
      salt.toString('hex'),
      iv.toString('hex'),
      tag.toString('hex'),
      timestamp.toString('hex'),
      encrypted
    ].join(':');
    
    // Return base64 encoded result
    return Buffer.from(result).toString('base64');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt credential');
  }
}

/**
 * Decrypts data encrypted with encryptCredential
 * Validates timestamp to prevent replay attacks
 */
export async function decryptCredential(encryptedData: string): Promise<string> {
  try {
    const masterKey = getMasterKey();
    
    // Decode from base64
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
    const parts = decoded.split(':');
    
    if (parts.length !== 5) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltHex, ivHex, tagHex, timestampHex, ciphertext] = parts;
    
    // Convert hex strings back to buffers
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const timestamp = Buffer.from(timestampHex, 'hex');
    
    // Validate timestamp (prevent replay attacks older than 1 hour)
    const timestampMs = parseInt(timestamp.toString('utf8'));
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    if (now - timestampMs > maxAge) {
      throw new Error('Encrypted data has expired');
    }
    
    // Derive key
    const key = deriveKey(masterKey, salt);
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    decipher.setAAD(timestamp);
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt credential');
  }
}

/**
 * Generates a secure random key for testing/development
 * Should NOT be used in production
 */
export function generateSecureKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Validates that an encryption key meets security requirements
 */
export function validateEncryptionKey(key: string): boolean {
  // Must be at least 32 characters (256 bits) and contain mixed case + numbers
  const minLength = 32;
  const hasUpperCase = /[A-Z]/.test(key);
  const hasLowerCase = /[a-z]/.test(key);
  const hasNumbers = /[0-9]/.test(key);
  
  return key.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}
