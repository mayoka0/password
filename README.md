# 🔒 Password Hygiene Checker

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=mayoka0&show_icons=true&theme=radical" alt="GitHub Stats" />
</div>

### 🛠️ Tech Stack & Skills
<div align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,nodejs,git,vercel" alt="Skill Icons" />
</div>

A **privacy-first** password hygiene checker built with Next.js 14, TypeScript, and Tailwind CSS. All analysis runs locally in your browser — your password **never** leaves your device.

---

## Features

### 🔐 Strength Analysis (Local)
- **zxcvbn-ts** powered strength estimation (score 0–4)
- Score label (Very Weak → Very Strong)
- Estimated crack time
- Warnings & suggestions
- Detected patterns (repeated, sequences, common words)
- **Requirements checklist**: length ≥ 12, lowercase, uppercase, number, symbol, not common

### 🧹 Hygiene Checks (Local)
- Detects repeated characters (e.g. `aaaaa`)
- Detects keyboard patterns (e.g. `qwerty`)
- Detects sequential patterns (e.g. `1234`, `abcd`)
- Optional check against your name/email
- **Fix-it advice** with actionable recommendations
- Passphrase suggestion

### 🔍 Breach Check (HIBP k-Anonymity)
- Toggle-based opt-in breach check
- Uses the [Have I Been Pwned](https://haveibeenpwned.com/) Pwned Passwords API
- **k-anonymity model**: only the first 5 characters of the SHA-1 hash are sent
- Comparison done locally — your password never leaves your device
- Handles rate limits and errors gracefully

---

## Privacy Model

| What                    | Where it happens |
|-------------------------|------------------|
| Password input          | Browser only     |
| Strength analysis       | Browser only     |
| Hygiene checks          | Browser only     |
| SHA-1 hashing           | Browser only (WebCrypto) |
| Breach check API call   | Only first 5 hex chars of SHA-1 sent |
| Password storage        | **Never** — no localStorage, cookies, or analytics |

---

## How the Breach Check Works (k-Anonymity)

1. Your password is SHA-1 hashed **locally** in the browser using the Web Crypto API.
2. Only the **first 5 characters** (prefix) of the hash are sent to the HIBP API.
3. The API returns **all hash suffixes** matching that prefix (~500–800 entries).
4. The full hash suffix is compared **locally** — no plaintext password ever leaves your device.

This approach is called [k-anonymity](https://www.troyhunt.com/ive-just-launched-pwned-passwords-version-2/) and is the industry standard for privacy-preserving breach checks.

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **zxcvbn-ts** — strength estimation
- **WebCrypto API** — SHA-1 hashing
- **HIBP Pwned Passwords API** — breach check

---

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.tsx           # Root layout with SEO metadata
│   └── page.tsx             # Landing page
├── components/
│   └── PasswordChecker.tsx  # Main checker component
└── lib/
    ├── crypto.ts            # SHA-1 helper (WebCrypto)
    ├── hibp.ts              # HIBP k-anonymity breach check
    └── hygiene.ts           # Local hygiene analysis
```

---

## Getting Started

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Manual QA Test Plan

- [ ] Type a weak password (e.g. `password`) → verify "Very Weak" score, red bar, warnings
- [ ] Type a strong password (e.g. `X7#mK9!pLz$w2Qn`) → verify "Very Strong" score, green bar
- [ ] Check requirements checklist updates in real-time
- [ ] Type `aaaaa` → verify repeated characters detected
- [ ] Type `qwerty123` → verify keyboard pattern detected
- [ ] Type `abcdefgh` → verify sequential pattern detected
- [ ] Enter name "John", type `john123` → verify personal info warning
- [ ] Toggle breach check ON → verify privacy note appears
- [ ] Test with `password` → verify breach count shown
- [ ] Test with a strong random password → verify "Not found"
- [ ] Toggle breach check OFF → verify result clears
- [ ] Click Show/Hide password toggle
- [ ] Click Clear (✕) button
- [ ] Expand "Password Best Practices" → verify tips visible
- [ ] Verify keyboard navigation (Tab through all controls)
- [ ] Verify no errors in browser console
- [ ] Verify `npm run build` passes

---

## Screenshots

*Screenshots will be added after visual review.*

---

## License

MIT
