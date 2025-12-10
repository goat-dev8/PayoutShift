# 🚀 PayoutShift

<div align="center">

![PayoutShift Logo](frontend/public/logo.png)

### Cross-Chain Payouts Made Simple

**Pay 50+ winners and contributors in any coin, on any chain, from one treasury**

[![Built with SideShift.ai](https://img.shields.io/badge/Powered%20by-SideShift.ai-orange?style=for-the-badge)](https://sideshift.ai)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?style=for-the-badge&logo=mongodb)](https://mongodb.com)

[Live Demo](https://payoutshift.vercel.app) • [API Docs](https://docs.sideshift.ai) • [SideShift Buildathon Wave 3](https://sideshift.ai)

</div>

---

## ✨ What is PayoutShift?

PayoutShift is a **cross-chain payout management system** that allows hackathon organizers, DAOs, and teams to pay multiple recipients in their preferred cryptocurrency - all from a single treasury.

### 🎯 The Problem

- Hackathon winners want payouts in different coins (ETH, BTC, SOL, etc.)
- Treasury holds only one asset (usually USDC or ETH)
- Manual conversions are time-consuming and error-prone
- Tracking 50+ individual payments is a nightmare

### 💡 The Solution

PayoutShift leverages **SideShift.ai's API** to:
1. Accept deposits in your treasury coin
2. Automatically convert to each recipient's preferred coin
3. Deliver payments to their wallets on any chain
4. Track everything in real-time

---

## 🌟 Features

### Core Functionality
| Feature | Description |
|---------|-------------|
| 🔐 **Wallet Authentication** | Connect with MetaMask, WalletConnect, Rainbow, and more |
| 📦 **Batch Payouts** | Pay 50+ recipients in a single batch |
| 🔄 **Cross-Chain Swaps** | Automatic conversion via SideShift.ai |
| 📊 **Real-Time Tracking** | Live status updates every 30 seconds |
| 📤 **CSV Import/Export** | Bulk upload recipients, export history |
| 🔗 **Public Proof Pages** | Shareable links for transparency |

### SideShift.ai Integration
| Endpoint | Usage |
|----------|-------|
| `GET /v2/coins` | 200+ supported assets |
| `POST /v2/quotes` | Fixed-rate quotes |
| `POST /v2/shifts/fixed` | Order creation |
| `GET /v2/shifts/:id` | Status polling |
| `DELETE /v2/shifts/:id` | Order cancellation |
| `GET /v2/pairs/:from/:to` | Real-time rates |

### Premium UI/UX
- ✨ Animated gradient backgrounds
- 🪟 Glassmorphism design
- 🌗 Dark/Light mode support
- 📱 Fully responsive
- ⚡ Framer Motion animations

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Lightning fast builds
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **RainbowKit + Wagmi** - Wallet connection
- **React Query** - Data fetching

### Backend
- **Express.js** + TypeScript
- **MongoDB** + Mongoose
- **SideShift.ai API v2** - Shift operations
- **Bottleneck** - Rate limiting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- SideShift.ai Affiliate Account

### 1. Clone & Install

```bash
git clone https://github.com/goat-dev8/PayoutShift.git
cd PayoutShift
npm install
```

### 2. Configure Environment

Create `.env` in the root directory:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/payoutshift

# SideShift.ai (get from https://sideshift.ai/affiliate)
SIDESHIFT_SECRET=your_secret_here
SIDESHIFT_AFFILIATE_ID=your_affiliate_id

# Optional
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Development

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📖 How It Works

### Step 1: Connect Wallet
Connect your wallet using RainbowKit. Your wallet address authenticates all requests.

### Step 2: Create a Batch
1. Enter batch name and description
2. Select your **treasury coin** (what you'll pay with)
3. Add recipients via:
   - Manual entry
   - CSV upload
   - Paste CSV data

### Step 3: Prepare Shifts
Click "Prepare Shifts" to create SideShift orders for each recipient. This generates unique deposit addresses.

### Step 4: Fund the Batch
Send funds to the deposit addresses. Options:
- Download CSV for Gnosis Safe multi-send
- Copy individual addresses
- Scan QR codes

### Step 5: Monitor & Complete
Watch real-time status updates as SideShift processes conversions. Recipients receive funds automatically.

---

## 📊 CSV Format

### Import Format
```csv
name,handle,amount,settleCoin,settleNetwork,settleAddress
Alice,@alice,100,ETH,ethereum,0x742d35Cc6634C0532925a3b844Bc454e4438f44e
Bob,@bob,50,BTC,bitcoin,bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
Charlie,@charlie,75,SOL,solana,7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuFN7FzSd
```

### Column Definitions
| Column | Required | Description |
|--------|----------|-------------|
| `name` | Yes | Recipient name |
| `handle` | No | Social handle (optional) |
| `amount` | Yes | Amount in treasury coin |
| `settleCoin` | Yes | Coin to receive (ETH, BTC, SOL, etc.) |
| `settleNetwork` | Yes | Network (ethereum, bitcoin, solana, etc.) |
| `settleAddress` | Yes | Wallet address |

---


## 🔒 Security

- **Wallet-Based Auth**: No passwords stored, uses Web3 signatures
- **Per-Wallet Isolation**: Each wallet sees only their own data
- **Rate Limiting**: 10,000 requests/15min to prevent abuse
- **CORS Protection**: Configurable origin whitelist
- **Helmet.js**: Security headers enabled

---

## 📡 API Endpoints

### Batches (Wallet Auth Required)
```
GET    /api/batches              # List your batches
POST   /api/batches              # Create new batch
GET    /api/batches/:id          # Get batch details
POST   /api/batches/:id/prepare  # Create SideShift shifts
GET    /api/batches/:id/funding  # Get deposit addresses
POST   /api/batches/:id/refresh  # Refresh status
```

### Analytics
```
GET    /api/analytics/local         # Your stats
GET    /api/analytics/recent-activity  # Last 10 shifts
GET    /api/analytics/export-csv    # Download history
```

### Coins (Public)
```
GET    /api/coins                # All supported coins
GET    /api/coins/pair/:from/:to # Exchange rate
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [SideShift.ai](https://sideshift.ai) - Cross-chain swap API
- [RainbowKit](https://rainbowkit.com) - Wallet connection
- [Framer Motion](https://framer.com/motion) - Animations
- [TailwindCSS](https://tailwindcss.com) - Styling

---

<div align="center">

**Built with ❤️ for SideShift Buildathon Wave 3**

[⬆ Back to Top](#-payoutshift)

</div>
