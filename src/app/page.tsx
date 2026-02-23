import PasswordChecker from "@/components/PasswordChecker";

export default function Home() {
    return (
        <main className="min-h-screen py-12 px-4 sm:px-6">
            {/* Hero header */}
            <div className="max-w-2xl mx-auto text-center mb-10 space-y-4 motion-safe:animate-fade-in">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
                    <span aria-hidden="true">🔒</span>
                    Privacy-First • 100% Local
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
                    Password Hygiene
                    <br />
                    Checker
                </h1>

                <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                    Analyze password strength, detect bad patterns, and check for breaches
                    — all without your password ever leaving your browser.
                </p>
            </div>

            {/* Checker */}
            <PasswordChecker />

            {/* Footer */}
            <footer className="max-w-2xl mx-auto mt-16 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
                <p>
                    Built with{" "}
                    <a
                        href="https://nextjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        Next.js
                    </a>
                    {" • "}
                    Powered by{" "}
                    <a
                        href="https://zxcvbn-ts.github.io/zxcvbn/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        zxcvbn-ts
                    </a>
                    {" • "}
                    Breach data via{" "}
                    <a
                        href="https://haveibeenpwned.com/API/v3#PwnedPasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        HIBP
                    </a>
                </p>
            </footer>
        </main>
    );
}
