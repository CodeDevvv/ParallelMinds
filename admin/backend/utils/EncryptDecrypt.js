import crypto from 'crypto'
import { Buffer } from 'buffer';

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

export function encryptMessage(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        encryptedMessage: encrypted,
        authTag: authTag.toString('hex'),
    };
}

export function decryptMessage(hash) {
    const iv = Buffer.from(hash.iv, 'hex');
    const authTag = Buffer.from(hash.authTag, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag); 
    let decrypted = decipher.update(hash.encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}