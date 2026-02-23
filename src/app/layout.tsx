import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Password Hygiene Checker — Security Tool",
    description:
        "A privacy-first password hygiene checker. Analyze strength, detect patterns, check breaches — all locally in your browser. No passwords are ever stored or transmitted.",
    keywords: [
        "password checker",
        "password strength",
        "password hygiene",
        "breach check",
        "HIBP",
        "security tool",
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
