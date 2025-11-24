# Chargebee Hookdeck Demo

A TypeScript Express.js application demonstrating how to receive Chargebee webhooks via Hookdeck Event Gateway with proper authentication and separation of concerns.

## Overview

This project provides a webhook receiver that integrates Chargebee subscription events with Hookdeck for reliable webhook delivery, monitoring, and debugging. The application features:

- **Separate handlers** for customer, subscription, and payment events
- **Dual authentication** with Hookdeck signature verification and Chargebee Basic Auth
- **Clean architecture** with modular, focused components
- **TypeScript** for type safety and better developer experience

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Chargebee account
- A Hookdeck account

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd chargebee-demo
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your values:
```bash
PORT=4000
CHARGEBEE_WEBHOOK_USERNAME=your_webhook_username
CHARGEBEE_WEBHOOK_PASSWORD=your_webhook_password
HOOKDECK_WEBHOOK_SECRET=your_hookdeck_webhook_secret
```

## Development

Run the application in development mode with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:4000` (or the PORT specified in your `.env` file).

## Building for Production

Build the TypeScript code:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

## Project Structure

```
chargebee-demo/
├── src/
│   ├── index.ts                      # Main application entry point
│   ├── handlers/
│   │   ├── customer.ts              # Customer event handler
│   │   ├── subscription.ts          # Subscription event handler
│   │   └── payments.ts              # Payment event handler
│   ├── middleware/
│   │   ├── chargebee-auth.ts        # Chargebee Basic Auth verification
│   │   └── hookdeck-auth.ts         # Hookdeck signature verification
│   └── types/
│       └── express.d.ts             # TypeScript type extensions
├── scripts/
│   └── cli-connection.sh            # Hookdeck CLI connection script
├── dist/                            # Compiled JavaScript output
├── .env.example                     # Environment variables template
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Setting Up Hookdeck

### Using the CLI Script (Recommended)

The project includes a convenience script for setting up Hookdeck connections:

```bash
./scripts/cli-connection.sh
```

This script will:
- Create or update a Hookdeck connection
- Provide you with the webhook URL to configure in Chargebee
- Start forwarding webhooks to your local server

### Manual Setup

1. Sign up for a free Hookdeck account at [hookdeck.com](https://hookdeck.com)

2. Install the Hookdeck CLI:
```bash
npm install -g @hookdeck/cli
```

3. Authenticate the CLI:
```bash
hookdeck login
```

4. Create a connection to forward Chargebee webhooks to your local server:
```bash
hookdeck listen 4000 --source chargebee
```

5. Copy the webhook URL provided by Hookdeck and configure it in your Chargebee dashboard

## Authentication

The application uses dual authentication for maximum security:

1. **Hookdeck Signature Verification** - Verifies that webhooks are coming from Hookdeck using HMAC-SHA256 signatures
2. **Chargebee Basic Auth** - Validates the Basic Auth credentials that Chargebee includes with webhooks

Both authentication methods are applied globally to all `/webhooks/*` routes.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run the production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Webhook Endpoints

The application provides three focused webhook endpoints:

### `/webhooks/chargebee/customer`
Handles customer-related events:
- `customer_created` - New customer registration
- `customer_changed` - Customer profile updates

### `/webhooks/chargebee/subscription`
Handles subscription lifecycle events:
- `subscription_created` - New subscription provisioning
- `subscription_renewed` - Subscription renewal
- `subscription_changed` - Plan changes and updates

### `/webhooks/chargebee/payments`
Handles payment events:
- `payment_succeeded` - Successful payment processing

Each endpoint logs relevant event details and includes TODO comments for implementing business logic.

## Health Check

The application includes a health check endpoint at `/health` (no authentication required):

```bash
curl http://localhost:4000/health
```

## License

MIT