# TravelQuoteBot

AI-Powered B2B SaaS Platform for Turkey Travel Itineraries with Real-Time Pricing

## Overview

TravelQuoteBot is a comprehensive platform that enables tour operators to generate personalized Turkey travel itineraries using Claude AI. The platform features multi-tenant architecture, white-label branding, and real-time pricing integration.

## Features

- **AI-Powered Itinerary Generation** - Uses Claude 3.5 Sonnet to create detailed day-by-day travel plans
- **Multi-Tenant Architecture** - Each tour operator gets their own subdomain and branding
- **Authentication System** - Secure JWT-based authentication for operators
- **Modern UI** - Beautiful bubble-style interface with gradients and animations
- **Database Integration** - MySQL database with hotels, activities, and itineraries
- **Quota Management** - Monthly itinerary generation limits per subscription tier

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS v4, Custom Gradients
- **Backend:** Next.js API Routes
- **Database:** MySQL (MariaDB 10.11.14)
- **AI:** Claude 3.5 Sonnet (Anthropic)
- **Authentication:** JWT, bcrypt
- **Server:** 188.132.230.193

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL access
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fatihtunali/travelquotebot.git
cd travelquotebot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
DATABASE_HOST=188.132.230.193
DATABASE_PORT=3306
DATABASE_USER=tqb
DATABASE_PASSWORD=your_password
DATABASE_NAME=tqb_db
ANTHROPIC_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
travelquotebot/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── itinerary/      # Itinerary generation
│   ├── auth/               # Login & Register pages
│   ├── dashboard/          # Operator dashboard
│   ├── itinerary/          # Itinerary pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── lib/
│   ├── auth.ts             # Authentication utilities
│   └── db.ts               # Database helpers
├── scripts/
│   └── export-schema.js    # Database schema export
├── CODE_REFERENCE.md       # Developer documentation
├── DATABASE_SCHEMA.md      # Database structure
└── kill-port.js            # Port cleanup script
```

## API Routes

### Authentication
- `POST /api/auth/register` - Create operator account
- `POST /api/auth/login` - Login and get JWT token

### Itineraries
- `POST /api/itinerary/generate` - Generate AI itinerary (requires auth)
- `GET /api/itinerary/[id]` - Fetch itinerary by ID (requires auth)

## Database Schema

The platform uses 7 main tables:

1. **operators** - Tour operator companies
2. **users** - Operator staff members
3. **accommodations** - Hotels in Turkey
4. **activities** - Tours and experiences
5. **itineraries** - Generated travel plans
6. **price_cache** - Real-time pricing cache
7. **api_usage** - AI API usage tracking

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete structure.

## Development Scripts

```bash
# Start development server (auto-kills port 3000)
npm run dev

# Export database schema
node scripts/export-schema.js

# Build for production
npm run build

# Start production server
npm start
```

## Features Implemented

- ✅ Operator authentication and registration
- ✅ Multi-tenant dashboard
- ✅ AI itinerary generation with Claude
- ✅ Modern bubble-style UI
- ✅ Database integration
- ✅ Quota management
- ⏳ Pricing engine with caching
- ⏳ White-label branding system
- ⏳ Customer-facing itinerary builder
- ⏳ Production deployment

## Contributing

This is a private project for tour operators. For questions or support, contact the development team.

## Documentation

- [CODE_REFERENCE.md](./CODE_REFERENCE.md) - Complete code reference guide
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure documentation

## License

Private - All Rights Reserved

## Contact

**Developer:** Fatih Tunali
**Email:** fatihtunali@gmail.com
**GitHub:** [@fatihtunali](https://github.com/fatihtunali)

---

Built with ❤️ using Claude AI
