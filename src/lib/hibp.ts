import { sha1 } from "./crypto";

export interface HIBPResult {
    found: boolean;
    count: number;
    error?: string;
}

/**
 * Check if a password has appeared in known data breaches using the
 * Have I Been Pwned (HIBP) Pwned Passwords API with k-anonymity.
 *
 * Privacy model:
 *  1. Compute SHA-1 hash of the password locally.
 *  2. Send only the first 5 hex characters (prefix) to the API.
 *  3. API returns all hash suffixes matching that prefix.
 *  4. Compare the full hash suffix locally.
 *
 * Your password NEVER leaves your device.
 */
export async function checkHIBP(password: string): Promise<HIBPResult> {
    try {
        const hash = await sha1(password);
        const prefix = hash.slice(0, 5);
        const suffix = hash.slice(5);

        const response = await fetch(
            `https://api.pwnedpasswords.com/range/${prefix}`,
            {
                headers: {
                    "Add-Padding": "true", // request padded responses for extra privacy
                },
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                return { found: false, count: 0, error: "Rate limited — try again in a moment." };
            }
            return { found: false, count: 0, error: `API error (${response.status})` };
        }

        const text = await response.text();
        const lines = text.split("\n");

        for (const line of lines) {
            const [hashSuffix, countStr] = line.trim().split(":");
            if (hashSuffix === suffix) {
                const count = parseInt(countStr, 10);
                return { found: count > 0, count };
            }
        }

        return { found: false, count: 0 };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { found: false, count: 0, error: `Breach check failed: ${message}` };
    }
}
