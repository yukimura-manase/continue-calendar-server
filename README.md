# 継続カレンダー App API

## 開発環境

```bash
npm install
npm run dev
```

```bash
open http://localhost:3500
```

## Deploy

```
npm run deploy
```

## Prisma Migration

```bash
npx prisma migrate dev --name init
```

## Memo📝

### 後でいかに改善予定

```json
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/index.js"
  },
```
