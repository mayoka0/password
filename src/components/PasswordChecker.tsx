"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { analyzeHygiene } from "@/lib/hygiene";
import { checkHIBP, type HIBPResult } from "@/lib/hibp";

/* ──────────────────── zxcvbn setup ──────────────────── */
const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
    },
};
zxcvbnOptions.setOptions(options);

/* ──────────────────── helpers ──────────────────── */
const SCORE_LABELS = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
] as const;

const SCORE_COLORS = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-500",
];

const SCORE_TEXT_COLORS = [
    "text-red-400",
    "text-orange-400",
    "text-yellow-400",
    "text-blue-400",
    "text-emerald-400",
];

const SCORE_GLOW = [
    "shadow-red-500/30",
    "shadow-orange-500/30",
    "shadow-yellow-500/30",
    "shadow-blue-500/30",
    "shadow-emerald-500/30",
];

/* ──────────────────── component ──────────────────── */
export default function PasswordChecker() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [showPersonalFields, setShowPersonalFields] = useState(false);
    const [breachToggle, setBreachToggle] = useState(false);
    const [breachResult, setBreachResult] = useState<HIBPResult | null>(null);
    const [breachLoading, setBreachLoading] = useState(false);
    const [showTips, setShowTips] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Run zxcvbn analysis
    const result = password.length > 0 ? zxcvbn(password) : null;
    const hygiene =
        password.length > 0
            ? analyzeHygiene(password, userName || undefined, userEmail || undefined)
            : null;

    // Requirements checklist
    const requirements = password.length > 0
        ? [
            {
                label: `Length ≥ 12 (currently ${password.length})`,
                passed: password.length >= 12,
            },
            { label: "Contains lowercase letter", passed: /[a-z]/.test(password) },
            { label: "Contains uppercase letter", passed: /[A-Z]/.test(password) },
            { label: "Contains number", passed: /[0-9]/.test(password) },
            {
                label: "Contains symbol",
                passed: /[^a-zA-Z0-9]/.test(password),
            },
            {
                label: "Not a common password",
                passed: result ? result.score >= 1 : false,
            },
        ]
        : [];

    // Breach check handler
    const handleBreachCheck = useCallback(
        async (pw: string) => {
            if (!pw || !breachToggle) return;
            setBreachLoading(true);
            const res = await checkHIBP(pw);
            setBreachResult(res);
            setBreachLoading(false);
        },
        [breachToggle]
    );

    // Debounced breach check
    useEffect(() => {
        if (!breachToggle || !password) {
            setBreachResult(null);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            handleBreachCheck(password);
        }, 800);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [password, breachToggle, handleBreachCheck]);

    const score = result?.score ?? 0;
    const crackTime =
        result?.crackTimesDisplay?.offlineSlowHashing1e4PerSecond ?? "—";

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 motion-safe:animate-fade-in">
            {/* ── Disclaimer ── */}
            <div
                role="alert"
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"
            >
                <p className="flex items-start gap-2">
                    <span className="text-amber-400 text-lg leading-none" aria-hidden="true">⚠️</span>
                    <span>
                        <strong>Disclaimer:</strong> Do not paste your real banking or
                        financial passwords. This tool is for educational purposes and
                        password hygiene assessment only.
                    </span>
                </p>
            </div>

            {/* ── Password Input ── */}
            <div className="space-y-2">
                <label
                    htmlFor="password-input"
                    className="block text-sm font-medium text-gray-300"
                >
                    Enter a password to check
                </label>
                <div className="relative group">
                    <input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        aria-describedby="password-strength-label"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Type or paste a password…"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-24 text-white
                       placeholder:text-gray-500 font-mono text-base
                       focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                       transition-all duration-200"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white
                         hover:bg-white/10 transition-colors"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                        {password && (
                            <button
                                type="button"
                                onClick={() => {
                                    setPassword("");
                                    setBreachResult(null);
                                }}
                                aria-label="Clear password"
                                className="rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:text-red-400
                           hover:bg-white/10 transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Strength Meter ── */}
            {result && (
                <div className="space-y-3 motion-safe:animate-slide-up">
                    <div className="flex items-center justify-between">
                        <span
                            id="password-strength-label"
                            className={`text-sm font-semibold ${SCORE_TEXT_COLORS[score]}`}
                        >
                            {SCORE_LABELS[score]}
                        </span>
                        <span className="text-xs text-gray-500">
                            Crack time: <span className="text-gray-300">{crackTime}</span>
                        </span>
                    </div>

                    {/* Strength bar */}
                    <div className="flex gap-1.5" role="meter" aria-label="Password strength" aria-valuenow={score} aria-valuemin={0} aria-valuemax={4}>
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 rounded-full transition-all duration-500 ${i <= score ? SCORE_COLORS[score] : "bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Warnings & Suggestions */}
                    {(result.feedback.warning || result.feedback.suggestions.length > 0) && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 space-y-2">
                            {result.feedback.warning && (
                                <p className="text-sm text-orange-300 flex items-center gap-2">
                                    <span aria-hidden="true">⚡</span> {result.feedback.warning}
                                </p>
                            )}
                            {result.feedback.suggestions.map((s, i) => (
                                <p key={i} className="text-sm text-gray-400 flex items-center gap-2">
                                    <span aria-hidden="true" className="text-violet-400">→</span> {s}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Requirements Checklist ── */}
            {requirements.length > 0 && (
                <div className="space-y-2 motion-safe:animate-slide-up">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <span aria-hidden="true">📋</span> Requirements Checklist
                    </h3>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {requirements.map((req) => (
                            <div
                                key={req.label}
                                className="flex items-center gap-2 text-sm"
                            >
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${req.passed
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-red-500/20 text-red-400"
                                        } transition-colors duration-300`}
                                    aria-hidden="true"
                                >
                                    {req.passed ? "✓" : "✕"}
                                </span>
                                <span className={req.passed ? "text-gray-300" : "text-gray-500"}>
                                    {req.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Hygiene Checks ── */}
            {hygiene && (
                <div className="space-y-3 motion-safe:animate-slide-up">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <span aria-hidden="true">🧹</span> Hygiene Checks
                    </h3>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 space-y-2">
                        {hygiene.checks.map((check) => (
                            <div key={check.id} className="flex items-start gap-2 text-sm">
                                <span
                                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${check.passed
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}
                                    aria-hidden="true"
                                >
                                    {check.passed ? "✓" : "✕"}
                                </span>
                                <div>
                                    <span className={check.passed ? "text-gray-300" : "text-gray-400"}>
                                        {check.label}
                                    </span>
                                    {check.detail && (
                                        <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recommendations */}
                    {hygiene.recommendations.length > 0 && (
                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
                            <p className="text-sm font-semibold text-violet-300 flex items-center gap-2">
                                <span aria-hidden="true">💡</span> Fix-It Advice
                            </p>
                            {hygiene.recommendations.map((rec, i) => (
                                <p key={i} className="text-sm text-gray-400 pl-6">
                                    {i + 1}. {rec}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Personal Info Check ── */}
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => setShowPersonalFields((s) => !s)}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    aria-expanded={showPersonalFields}
                >
                    <span
                        className={`transition-transform duration-200 ${showPersonalFields ? "rotate-90" : ""}`}
                        aria-hidden="true"
                    >
                        ▶
                    </span>
                    Check against personal info (optional)
                </button>
                {showPersonalFields && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 motion-safe:animate-slide-up">
                        <div>
                            <label htmlFor="name-input" className="block text-xs text-gray-500 mb-1">
                                Your name
                            </label>
                            <input
                                id="name-input"
                                type="text"
                                autoComplete="off"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white
                           placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-input" className="block text-xs text-gray-500 mb-1">
                                Your email
                            </label>
                            <input
                                id="email-input"
                                type="email"
                                autoComplete="off"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="john@example.com"
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white
                           placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Breach Check (HIBP) ── */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <span aria-hidden="true">🔍</span> Breach Check
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Check if this password appears in known data breaches
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle breach check">
                        <input
                            type="checkbox"
                            checked={breachToggle}
                            onChange={(e) => {
                                setBreachToggle(e.target.checked);
                                if (!e.target.checked) setBreachResult(null);
                            }}
                            className="sr-only peer"
                        />
                        <div
                            className="w-11 h-6 bg-white/10 rounded-full peer
                         peer-checked:bg-violet-600 peer-focus:ring-2 peer-focus:ring-violet-500/50
                         after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5
                         after:transition-all peer-checked:after:translate-x-full"
                        />
                    </label>
                </div>

                {breachToggle && (
                    <div className="space-y-2 motion-safe:animate-slide-up">
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/[0.02] rounded-lg px-3 py-2">
                            <span aria-hidden="true">🔒</span>
                            <span>
                                Only the first 5 characters of the SHA-1 hash are sent; your
                                password never leaves your device.
                            </span>
                        </div>

                        {breachLoading && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                                Checking…
                            </div>
                        )}

                        {!breachLoading && breachResult && (
                            <div
                                className={`rounded-lg px-4 py-3 text-sm font-medium ${breachResult.error
                                        ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
                                        : breachResult.found
                                            ? "bg-red-500/10 text-red-300 border border-red-500/20"
                                            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                    }`}
                            >
                                {breachResult.error ? (
                                    <span>⚠️ {breachResult.error}</span>
                                ) : breachResult.found ? (
                                    <span>
                                        🚨 Found <strong>{breachResult.count.toLocaleString()}</strong> times
                                        in known breaches. <em>Do not use this password!</em>
                                    </span>
                                ) : (
                                    <span>✅ Not found in known breach databases. Looking good!</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Password Tips ── */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowTips((s) => !s)}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    aria-expanded={showTips}
                >
                    <span
                        className={`transition-transform duration-200 ${showTips ? "rotate-90" : ""}`}
                        aria-hidden="true"
                    >
                        ▶
                    </span>
                    Password Best Practices
                </button>
                {showTips && (
                    <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] p-5 space-y-3 text-sm text-gray-400 motion-safe:animate-slide-up">
                        <h4 className="font-semibold text-gray-200">🛡️ How to Create Strong Passwords</h4>
                        <ul className="space-y-2 list-none">
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5" aria-hidden="true">•</span>
                                <span>Use <strong className="text-gray-300">12+ characters</strong> — longer is always better.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5" aria-hidden="true">•</span>
                                <span>Mix <strong className="text-gray-300">uppercase, lowercase, numbers, and symbols</strong>.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5" aria-hidden="true">•</span>
                                <span>Use a <strong className="text-gray-300">passphrase</strong>: combine 4+ random, unrelated words.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5" aria-hidden="true">•</span>
                                <span>Never reuse passwords across sites — use a <strong className="text-gray-300">password manager</strong>.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5" aria-hidden="true">•</span>
                                <span>Enable <strong className="text-gray-300">two-factor authentication</strong> (2FA) wherever possible.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5" aria-hidden="true">•</span>
                                <span>Avoid personal info (names, birthdays, pet names) in passwords.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-0.5" aria-hidden="true">•</span>
                                <span>Regularly check for breaches at <strong className="text-gray-300">haveibeenpwned.com</strong>.</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* ── Privacy Note ── */}
            <div className="text-center text-xs text-gray-600 pt-4 border-t border-white/5 space-y-1">
                <p>
                    🔒 <strong className="text-gray-500">Privacy-first:</strong> No passwords are stored, logged, or sent over the network.
                </p>
                <p>All analysis runs locally in your browser. Zero analytics. Zero tracking.</p>
            </div>
        </div>
    );
}
