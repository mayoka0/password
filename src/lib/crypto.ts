/**
 * Cryptography utilities for the Password Manager.
 * Uses Web Crypto API for industry-standard security.
 */

const PBKDF2_ITERATIONS = 600000; // OWASP recommended for PBKDF2-HMAC-SHA256
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // Recommended for AES-GCM
const AUTH_TAG_LENGTH = 128; // Standard for AES-GCM

/**
 * SHA-1 hashing using the Web Crypto API.
 * Primarily used for k-anonymity with HIBP.
 */
export async function sha1(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * Derives an AES-256 key from a master password using PBKDF2.
 * Note: Argon2id is preferred but not natively supported in Web Crypto.
 * We use a high iteration count to compensate.
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts data using AES-256-GCM.
 */
export async function encrypt(data: string, key: CryptoKey): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
            tagLength: AUTH_TAG_LENGTH,
        },
        key,
        encoder.encode(data)
    );

    return { ciphertext, iv };
}

/**
 * Decrypts data using AES-256-GCM.
 */
export async function decrypt(ciphertext: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv,
            tagLength: AUTH_TAG_LENGTH,
        },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Generates a random salt.
 */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Helper to convert ArrayBuffer to Base64 string for storage.
 */
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Helper to convert Base64 string to Uint8Array.
 */
export function base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
