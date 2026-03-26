# SellMate

**Autonomous WhatsApp sales assistant, powered by AI for small businesses.**

SellMate connects your business with your customers through WhatsApp, automating conversations, orders, appointments, and follow-ups with artificial intelligence. Multi-tenant, modular, and open source.

---

## Features

- **WhatsApp AI Bot** - Automatically responds to your customers using OpenAI, Anthropic, Google Gemini, or any compatible API
- **Multi-tenant** - Serves multiple businesses from a single instance, each with isolated data
- **Module System** - Enable/disable features based on your business type (orders, appointments, quotes, products, loyalty, image generation)
- **Setup Wizard** - Guided onboarding to configure your business in minutes
- **Supported Business Types** - Restaurants, barbershops, clinics, retail stores, professional services, and more
- **Real-time Dashboard** - Metrics and statistics with Socket.IO
- **Conversation Management** - Bot/human/closed modes with seamless transitions
- **Client Management** - Automatic contact creation from WhatsApp
- **AI Usage Tracking** - Cost estimation by provider and model
- **MCP Integration** - External tools via Model Context Protocol (stdio/SSE)
- **Copilot Mode** - AI suggestions for human agents
- **Presence Control** - Set your WhatsApp as online/offline from the dashboard
- **Dark Mode** - Full dark theme support across the interface
- **Image Vision** - Analyze images sent by customers
- **Follow-up Automation** - Automatic customer loyalty engagement

## Screenshots

> _Coming soon_

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Express.js, MariaDB (mysql2), Socket.IO |
| **WhatsApp** | Baileys (WhatsApp Web API) |
| **Frontend** | Vue 3, Vite, Tailwind CSS, Pinia |
| **AI** | OpenAI, Anthropic, Google Gemini, Custom (OpenAI-compatible) |
| **Deploy** | Heroku with JawsDB Maria (or any MariaDB/MySQL) |

## Prerequisites

- **Node.js** 18+ (recommended 22.x)
- **MariaDB** or **MySQL** 5.7+
- An API key from an AI provider (OpenAI, Anthropic, Google Gemini, etc.)
- A phone number with WhatsApp

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/cebasic/sellmate.git
cd sellmate
```

### 2. Install dependencies

```bash
npm install
```

This also installs client dependencies automatically (`postinstall`).

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000
JWT_SECRET=change-this-to-something-secure
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=sellmate

# AI (can be configured later from the wizard)
AI_PROVIDER=openai
AI_API_KEY=your-api-key
AI_MODEL=gpt-4o-mini
```

### 4. Create the database

```bash
mysql -u root -p -e "CREATE DATABASE sellmate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Tables are created automatically when the server starts.

### 5. Run in development

```bash
npm run dev
```

This starts the backend server and the Vite client in parallel:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### 6. Configure your business

Open `http://localhost:5173` in your browser. The first time, it will ask you to create an admin account and guide you through the setup wizard.

## Environment Variables

| Variable | Description | Required | Default |
|----------|------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `NODE_ENV` | Environment (`development` / `production`) | No | `development` |
| `DB_HOST` | MariaDB/MySQL host | Yes | `localhost` |
| `DB_PORT` | MariaDB/MySQL port | No | `3306` |
| `DB_USER` | Database user | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_NAME` | Database name | Yes | `sellmate` |
| `JAWSDB_MARIA_URL` | JawsDB connection URL (Heroku) | No | - |
| `AI_PROVIDER` | AI provider: `openai`, `anthropic`, `gemini`, `custom` | No | `openai` |
| `AI_API_KEY` | AI provider API key | No | - |
| `AI_MODEL` | AI model to use | No | `gpt-4o-mini` |
| `AI_CUSTOM_ENDPOINT` | Endpoint for custom providers | No | - |

> AI configuration can also be managed from the web interface (Settings or Wizard).

## Deploy on Heroku

### 1. Create the app

```bash
heroku create your-sellmate
```

### 2. Add MariaDB

```bash
heroku addons:create jawsdb-maria:kitefin
```

Heroku will automatically configure `JAWSDB_MARIA_URL`.

### 3. Set environment variables

```bash
heroku config:set JWT_SECRET=your-super-secret-key
heroku config:set NODE_ENV=production
heroku config:set AI_PROVIDER=openai
heroku config:set AI_API_KEY=your-api-key
heroku config:set AI_MODEL=gpt-4o-mini
```

### 4. Deploy

```bash
git push heroku main
```

The frontend build runs automatically via `heroku-postbuild`.

### 5. Open the app

```bash
heroku open
```

## Module System

SellMate uses a modular system that allows enabling/disabling features based on each business's needs.

| Module | Description | Restaurant | Barbershop | Clinic | Store | Services |
|--------|------------|:----------:|:----------:|:------:|:-----:|:--------:|
| **Products** | Catalog with prices and images | Yes | Yes | - | Yes | Yes |
| **Orders** | Receive and manage orders | Yes | - | - | Yes | Yes |
| **Appointments** | Schedule appointments from WhatsApp | - | Yes | Yes | - | Yes |
| **Loyalty** | Automatic follow-up | Yes | Yes | Yes | Yes | Yes |
| **AI Copilot** | Suggestions for agents | Yes | Yes | Yes | Yes | Yes |
| **Auto Response** | Bot responds automatically | Yes | Yes | Yes | Yes | Yes |

Modules are configured during the initial wizard or from the Settings section.

## Architecture

```
sellmate/
├── server/
│   ├── index.js                # Entry point (Express + Socket.IO + static serving)
│   ├── config/
│   │   └── database.js         # MySQL pool, schema init, auto-migrations
│   ├── db/
│   │   └── schema.sql          # Full schema (22 tables, multi-tenant)
│   ├── middleware/
│   │   └── auth.js             # JWT auth, tenant context, role checks
│   ├── services/
│   │   ├── ai.js               # Multi-provider AI abstraction + tool calling loops
│   │   ├── bot.js              # Message handling, system prompt builder
│   │   ├── whatsapp.js         # Baileys manager (per-tenant connections)
│   │   ├── mcp.js              # Model Context Protocol (stdio/SSE)
│   │   ├── socket.js           # Real-time event hub
│   │   ├── followups.js        # Cron job: loyalty messaging (hourly)
│   │   └── dbAuthState.js      # WhatsApp session persistence in DB
│   └── routes/
│       ├── auth.js             # Register, login, agents CRUD
│       ├── conversations.js    # Chat history, delete, clear
│       ├── products.js         # Catalog CRUD
│       ├── clients.js          # Contact database
│       ├── orders.js           # Order lifecycle management
│       ├── appointments.js     # Calendar + public confirmation links
│       ├── followups.js        # Loyalty rules engine
│       ├── settings.js         # Bot config, AI keys CRUD, test-ai
│       ├── business.js         # Business info management
│       ├── modules.js          # Feature flags + presets
│       ├── copilot.js          # AI suggestions for human agents
│       └── usage.js            # Token tracking + cost analytics
├── client/
│   ├── src/
│   │   ├── App.vue             # Root (Sidebar + TopBar layout)
│   │   ├── router/index.js     # 18 routes
│   │   ├── views/              # Pages
│   │   │   ├── Landing.vue     # Public marketing page
│   │   │   ├── Login.vue       # Auth
│   │   │   ├── SetupWizard.vue # Onboarding wizard
│   │   │   ├── Dashboard.vue   # Metrics overview
│   │   │   ├── ChatView.vue    # Live chat (bot/human modes)
│   │   │   ├── Conversations.vue
│   │   │   ├── Clients.vue     # Contact CRM
│   │   │   ├── Orders.vue      # Order management
│   │   │   ├── Appointments.vue # Calendar (day/week/month)
│   │   │   ├── Settings.vue    # All settings + AI key management
│   │   │   ├── AIUsage.vue     # Token analytics dashboard (chart.js)
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Sidebar.vue
│   │   │   ├── TopBar.vue
│   │   │   └── calendar/       # Day, Week, Month, DetailModal
│   │   ├── stores/             # Pinia (auth, theme, settings, notifications)
│   │   ├── composables/        # useSocket.js
│   │   └── lib/                # Utilities (api.js, phone.js)
│   ├── vite.config.js          # Proxy /api + /socket.io to backend
│   └── tailwind.config.js
├── Procfile                    # web: node server/index.js
├── .env.example
└── package.json                # Root + postinstall + dev scripts
```

### Message Flow

```
WhatsApp → Baileys → bot.js → ai.js → [OpenAI/Anthropic/Gemini]
                                           ↓
                                    Structured JSON
                                    {response, topic, emoji, order?, appointment?}
                                           ↓
                        ┌──────────────────┼──────────────────┐
                        ↓                  ↓                  ↓
                  Send response      Create order/appt   Classify topic
                  via WhatsApp       in the DB           in conversation
                        ↓
                  Socket.IO → Dashboard updated in real time
```

### Multi-tenant

Each tenant (business) has completely isolated data:
- Its own WhatsApp connection (independent Baileys instance)
- Its own products, conversations, clients, orders
- Its own AI API keys and configuration
- JWT tokens include `tenant_id` to filter everything

### Database

22 tables in MariaDB/MySQL with automatic migrations on startup:

| Table | Description |
|-------|------------|
| `tenants` | Registered businesses |
| `users` | Users with roles (admin, agent, super_admin) |
| `settings` | Bot and active AI config per tenant |
| `business_info` | Business data (name, hours, address) |
| `products` | Catalog with prices, stock, images |
| `conversations` | WhatsApp conversations (status: bot/human/closed) |
| `messages` | Message history with image support |
| `clients` | Contact database with tags and metrics |
| `orders` | Orders with full lifecycle |
| `appointments` | Appointments with public confirmation tokens |
| `follow_up_rules` | Automatic loyalty rules |
| `ai_keys` | Multiple API keys per tenant |
| `ai_usage` | Token and cost tracking per request |
| `tenant_modules` | Feature flags per business |
| `mcp_servers` | Configured MCP servers |
| `wa_auth_state` | WhatsApp session persisted in DB |
| ... | And more |

### REST API

All endpoints require JWT (`Authorization: Bearer <token>`) and are scoped by tenant.

| Group | Main Endpoints |
|-------|---------------|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Conversations** | `GET /api/conversations`, `GET /api/conversations/:id/messages` |
| **Products** | CRUD at `/api/products` |
| **Clients** | CRUD at `/api/clients` |
| **Orders** | CRUD + `PUT /api/orders/:id/status` |
| **Appointments** | CRUD + `GET /api/cita/:token` (public) |
| **Settings** | `GET/PUT /api/settings`, CRUD `/api/settings/ai-keys`, `POST /api/settings/test-ai` |
| **AI Usage** | `GET /api/usage`, `GET /api/usage/detailed`, `GET /api/usage/by-provider` |
| **Modules** | `GET /api/modules`, `PUT /api/modules/:key` |

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

### Reporting Bugs

Open an [issue](https://github.com/cebasic/sellmate/issues) describing the problem, steps to reproduce it, and the expected behavior.

## License

This project is licensed under the [MIT](LICENSE) license.

---

Made with AI - SellMate
