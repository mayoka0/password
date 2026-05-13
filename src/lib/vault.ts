import {
    deriveKey,
    encrypt,
    decrypt,
    generateSalt,
    bufferToBase64,
    base64ToBuffer
} from "./crypto";

export interface VaultItem {
    id: string;
    site: string;
    username: string;
    passwordPlain: string;
}

export interface EncryptedVault {
    ciphertext: string;
    iv: string;
    salt: string;
}

const STORAGE_KEY = "password_manager_vault";

/**
 * Saves the vault items to local storage, encrypted with the master password.
 * Implements Zero-Knowledge architecture: the master password never leaves local memory.
 */
export async function saveVault(items: VaultItem[], masterPassword: string): Promise<void> {
    const salt = generateSalt();
    const key = await deriveKey(masterPassword, salt);
    const data = JSON.stringify(items);
    const { ciphertext, iv } = await encrypt(data, key);

    const vault: EncryptedVault = {
        ciphertext: bufferToBase64(ciphertext),
        iv: bufferToBase64(iv),
        salt: bufferToBase64(salt),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
}

/**
 * Loads and decrypts the vault items from local storage using the master password.
 */
export async function loadVault(masterPassword: string): Promise<VaultItem[]> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const vault: EncryptedVault = JSON.parse(stored);
    const salt = base64ToBuffer(vault.salt);
    const iv = base64ToBuffer(vault.iv);
    const ciphertext = base64ToBuffer(vault.ciphertext);

    try {
        const key = await deriveKey(masterPassword, salt);
        const decrypted = await decrypt(ciphertext.buffer, key, iv);
        return JSON.parse(decrypted);
    } catch (err) {
        throw new Error("Invalid master password or corrupted vault.");
    }
}

/**
 * Checks if a vault exists in local storage.
 */
export function hasVault(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_KEY);
}

/**
 * Wipes the vault from local storage.
 */
export function deleteVault(): void {
    localStorage.removeItem(STORAGE_KEY);
}
