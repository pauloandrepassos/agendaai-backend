import crypto from 'crypto';

const key = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16);  

export function encrypt(data: string): { encrypted: string } {
    const key = process.env.CRIPTO_KEY; 
    if (!key) {
        throw new Error("CRIPTO_KEY não definido");
    }

    const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(key), null); 
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    
    return { encrypted }; 
}
export function decrypt(encrypted: string): string {
    const key = process.env.CRIPTO_KEY; 
    if (!key) {
        throw new Error("CRIPTO_KEY não definido");
    }

    const decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(key), null); 
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    
    return decrypted; 
}


