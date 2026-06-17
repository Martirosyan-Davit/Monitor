# Instagram Stories Telegram Bot

A personal Telegram bot that monitors Instagram Stories for specified public accounts via `insta-stories.io` and sends new stories (photos/videos) directly to your Telegram chat.

## Install

```bash
npm install
```

## Configure

```bash
cp .env.example .env
```

Edit `.env` and set your Telegram bot token:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

Get a token from [@BotFather](https://t.me/BotFather) on Telegram.

## Run (local)

```bash
npm run start:dev
```

## Run (Docker)

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove data volume
docker compose down -v
```

The `data/storage.json` file is persisted in a Docker volume (`bot-data`), so accounts and history survive container restarts.

## Bot Commands

| Command | Description |
|---|---|
| `/start` | Show welcome message and command list |
| `/add <username>` | Add an Instagram account to monitor |
| `/list` | Show all monitored accounts |
| `/remove <username>` | Remove an account from the list |
| `/monitor` | Start monitoring (checks every ~5 minutes) |
| `/stop` | Stop monitoring and clear send history (accounts are kept) |

## How It Works

1. Add Instagram usernames with `/add`
2. Start monitoring with `/monitor`
3. The bot checks for new stories every ~5 minutes
4. New stories (photos or videos) are sent directly to your chat
5. Already-sent stories are tracked so nothing is sent twice
6. `/stop` pauses monitoring — accounts stay saved, use `/monitor` to resume
