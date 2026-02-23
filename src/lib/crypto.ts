/**
 * SHA-1 hashing using the Web Crypto API.
 * Runs entirely in the browser — no plaintext leaves the device.
 */
export async function sha1(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
