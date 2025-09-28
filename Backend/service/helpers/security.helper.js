const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SECURITY_HASH_ALGO = 'sha512'

/**
 * Create a hash from a utf-8 encoded string
 * @param {string} clearText - The text to hash
 * @returns {string} Hashed text
 */
const getHash = function (clearText) {
    let hasher = crypto.createHash(SECURITY_HASH_ALGO)
    let hash = hasher.update(clearText, 'utf-8')
    return hash.digest('hex')
}

/**
 * Generate safe hash for a password
 * @param {string} clearText - cleartext password
 * @returns {Promise<string>} Promise with the hashed password
 */
const encryptPassword = async function (clearText) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(clearText, salt)
}

/**
 * Verify a password against its hash
 * @param {string} clearText - The password to verify
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} True if password matches hash
 */
const verifyPassword = async function (clearText, hash) {
    return await bcrypt.compare(clearText, hash)
}

/**
 * Generates a secure random token
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} Random token
 */
const generateSecureToken = function (length = 32) {
    return crypto.randomBytes(length).toString('hex')
}

/**
 * Hashes a token for secure storage
 * @param {string} token - The token to hash
 * @returns {Promise<string>} Hashed token
 */
const hashToken = async function (token) {
    return await bcrypt.hash(token, 10)
}

/**
 * Verifies a token against its hash
 * @param {string} token - The token to verify
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} True if token matches hash
 */
const verifyToken = async function (token, hash) {
    return await bcrypt.compare(token, hash)
}

/**
 * Generates an expiration date
 * @param {number} hours - Hours from now (default: 24)
 * @returns {Date} Expiration date
 */
const generateExpiration = function (hours = 24) {
    const expiration = new Date()
    expiration.setHours(expiration.getHours() + hours)
    return expiration
}

/**
 * Checks if a date has expired
 * @param {Date} expirationDate - The expiration date
 * @returns {boolean} True if expired
 */
const isExpired = function (expirationDate) {
    return new Date() > new Date(expirationDate)
}

/**
 * Generates a JWT token for a user
 * @param {Object} userData - User data to include in token
 * @param {string} expiresIn - Token expiration (default: 24h)
 * @returns {string} JWT token
 */
const generateJwtToken = function (userData, expiresIn = '24h') {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
    
    const payload = {
        id: userData.id,
        username: userData.username,
        email: userData.email
    }
    
    return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyJwtToken = function (token) {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
        return jwt.verify(token, secret)
    } catch (error) {
        return null
    }
}

module.exports = {
    getHash,
    encryptPassword,
    verifyPassword,
    generateSecureToken,
    hashToken,
    verifyToken,
    generateExpiration,
    isExpired,
    generateJwtToken,
    verifyJwtToken
}
