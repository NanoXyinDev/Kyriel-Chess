# ♟️ Chess Assist Pro

Web app analisis catur advanced pake Stockfish engine. Bisa jalan di HP dan laptop.

## Fitur

- **FEN Input** → Paste position dari chess.com, langsung dapet best move
- **Manual Board** → Setup papan manual kalo males copy FEN
- **Screen Capture** → Izinkan screen capture buat detect papan catur otomatis
- **Notifikasi** → "Bang lu harus jalan kuda a2 ke b4!" style notif
- **Zen Mode** → Tampilan minimalis buat main tanpa ketahuan
- **Sound Alert** → Suara notif pas dapet best move
- **History** → Riwayat analisis tersimpan di localStorage
- **Multi-engine** → Stockfish WASM jalan di browser

## Deploy ke Vercel

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build for production
npm run build

# Deploy ke Vercel
vercel --prod
```

## Cara Pakai

1. Buka chess.com → mulai game
2. Copy FEN dari analysis board atau setup manual
3. Paste di web app → auto analyze
4. Dapet notif best move + evaluasi
5. Pake Zen Mode kalo mau tampilan minimalis

## Tips Anti-Ketahuan

- Split screen di HP
- Jangan analyze tiap move
- Pake Zen Mode
- Variasiin timing 5-10 detik
- Depth 15-18 buat blitz

## Tech Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Stockfish WASM
- Web Screen Capture API
- Web Audio API
