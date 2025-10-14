# Refugees Youth & PWDs (RYD)

A modern, responsive website for RYD Mental Health, an organization dedicated to supporting mental health and well-being through community and resources.

## 🌐 Live Website
Visit our website at: [rydmentalhealth.org](https://rydmentalhealth.org)

## 🚀 Features

- **Modern Design**: Clean, responsive interface with smooth animations
- **Mobile-First**: Fully responsive design for all devices
- **Interactive Components**: Engaging UI elements with Framer Motion animations
- **Resource Library**: Comprehensive mental health resources and tools
- **Contact System**: Easy-to-use contact form and support channels
- **Donation Platform**: Secure donation system for supporting the cause

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **Deployment**: Vercel

## 🏗️ Project Structure

```
app/
├── components/     # Reusable UI components
├── pages/         # Page components
├── styles/        # Global styles
└── public/        # Static assets
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/lawmwad123/RYD.git
   ```

2. Install dependencies:
   ```bash
   cd RYD
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔐 Authentication Setup

This application supports multiple authentication methods:

- **Email/Password**: Always available
- **Google OAuth**: Optional (requires setup)
- **Apple OAuth**: Optional (requires setup)

### Setting up Google OAuth

1. Follow the detailed guide: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
2. Or use the automated setup script:
   ```bash
   ./setup-vercel-env.sh
   ```

### Verifying Configuration

Check your authentication setup:
```bash
node scripts/verify-auth-config.js
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contact

For any questions or support, please contact us at:
- Email: info@rydmentalhealth.org
- Phone: +256 776 803262/ +256740929848/ +256709039595
- Address: Namugongo, Wakiso, Uganda. 
P.O Box 187215 Kampala GPO

---

Made with ❤️ by the RYD Team

## Quickstart

1) Create `.env` with the minimum config for local dev:

```
AUTH_SECRET=development-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="postgresql://username:password@localhost:5432/db?schema=public"
```

2) Generate Prisma client and migrate:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3) Verify auth config:

```bash
npm run verify:auth
```

4) Start dev server:

```bash
npm run dev
```

Email-link login is disabled by default in the UI unless `NEXT_PUBLIC_EMAIL_SIGNIN_ENABLED=true` is set and the Email provider is configured.
