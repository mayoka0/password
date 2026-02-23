export interface HygieneCheck {
    id: string;
    label: string;
    passed: boolean;
    detail?: string;
}

export interface HygieneResult {
    checks: HygieneCheck[];
    recommendations: string[];
}

const KEYBOARD_ROWS = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "1234567890",
    "!@#$%^&*()",
];

const SEQUENTIAL_ALPHA = "abcdefghijklmnopqrstuvwxyz";
const SEQUENTIAL_NUM = "0123456789";

function hasRepeatedChars(password: string, minRun: number = 3): boolean {
    const lower = password.toLowerCase();
    for (let i = 0; i <= lower.length - minRun; i++) {
        const char = lower[i];
        let run = 1;
        while (i + run < lower.length && lower[i + run] === char) run++;
        if (run >= minRun) return true;
    }
    return false;
}

function hasKeyboardPattern(password: string, minLen: number = 4): boolean {
    const lower = password.toLowerCase();
    for (const row of KEYBOARD_ROWS) {
        for (let start = 0; start <= row.length - minLen; start++) {
            const pattern = row.slice(start, start + minLen);
            const reversed = pattern.split("").reverse().join("");
            if (lower.includes(pattern) || lower.includes(reversed)) return true;
        }
    }
    return false;
}

function hasSequentialPattern(password: string, minLen: number = 4): boolean {
    const lower = password.toLowerCase();
    for (const seq of [SEQUENTIAL_ALPHA, SEQUENTIAL_NUM]) {
        for (let start = 0; start <= seq.length - minLen; start++) {
            const pattern = seq.slice(start, start + minLen);
            const reversed = pattern.split("").reverse().join("");
            if (lower.includes(pattern) || lower.includes(reversed)) return true;
        }
    }
    return false;
}

function containsPersonalInfo(
    password: string,
    name?: string,
    email?: string
): string | null {
    const lower = password.toLowerCase();

    if (name) {
        const parts = name
            .toLowerCase()
            .split(/[\s.@_-]+/)
            .filter((p) => p.length >= 2);
        for (const part of parts) {
            if (lower.includes(part)) return `your name ("${part}")`;
        }
    }

    if (email) {
        const localPart = email.split("@")[0]?.toLowerCase();
        if (localPart && localPart.length >= 2 && lower.includes(localPart)) {
            return `your email ("${localPart}")`;
        }
    }

    return null;
}

export function analyzeHygiene(
    password: string,
    name?: string,
    email?: string
): HygieneResult {
    const checks: HygieneCheck[] = [];
    const recommendations: string[] = [];

    // Repeated characters
    const repeated = hasRepeatedChars(password);
    checks.push({
        id: "repeated",
        label: "No repeated characters (e.g. aaa)",
        passed: !repeated,
        detail: repeated
            ? "Contains 3+ identical characters in a row"
            : undefined,
    });
    if (repeated) {
        recommendations.push(
            "Replace repeated characters with varied letters, numbers, or symbols."
        );
    }

    // Keyboard patterns
    const keyboard = hasKeyboardPattern(password);
    checks.push({
        id: "keyboard",
        label: "No keyboard patterns (e.g. qwerty)",
        passed: !keyboard,
        detail: keyboard ? "Contains a keyboard walk pattern" : undefined,
    });
    if (keyboard) {
        recommendations.push(
            "Avoid keyboard walks like 'qwerty' or 'asdf' — they're among the first patterns attackers try."
        );
    }

    // Sequential patterns
    const sequential = hasSequentialPattern(password);
    checks.push({
        id: "sequential",
        label: "No sequential patterns (e.g. 1234, abcd)",
        passed: !sequential,
        detail: sequential
            ? "Contains a sequential character pattern"
            : undefined,
    });
    if (sequential) {
        recommendations.push(
            "Replace sequences like '1234' or 'abcd' with random characters."
        );
    }

    // Personal info
    const personalMatch = containsPersonalInfo(password, name, email);
    checks.push({
        id: "personal",
        label: "Does not contain name or email",
        passed: !personalMatch,
        detail: personalMatch
            ? `Contains ${personalMatch}`
            : undefined,
    });
    if (personalMatch) {
        recommendations.push(
            `Remove personal information (${personalMatch}) from your password — attackers will try these first.`
        );
    }

    // Passphrase suggestion if weak
    if (recommendations.length >= 2) {
        recommendations.push(
            '💡 Try a passphrase instead: combine 4+ random, unrelated words (e.g. "correct horse battery staple") for a strong and memorable password.'
        );
    }

    return { checks, recommendations: recommendations.slice(0, 3) };
}
