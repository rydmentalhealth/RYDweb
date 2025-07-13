# Deploying RYD Admin to Vercel

This guide provides instructions for deploying the RYD Admin application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. The [Vercel CLI](https://vercel.com/docs/cli) (optional for advanced usage)
3. A PostgreSQL database (Vercel Postgres, Neon, Railway, etc.)

## Deployment Steps

### 1. Set up your database

- Create a PostgreSQL database service (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Neon](https://neon.tech/))
- Get your database connection string

### 2. Deploy to Vercel

#### Option 1: Direct deployment from GitHub

1. Import your GitHub repository in the Vercel dashboard
2. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: A secure random string (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: The URL of your deployed app + `/api/auth` (e.g., `https://your-app.vercel.app/api/auth`)
   - Add any other necessary environment variables from your `.env` file
3. Deploy the application

#### Option 2: Using Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. Log in to Vercel: `vercel login`
3. Deploy the application: `vercel`
4. Follow the CLI prompts to configure your project
5. Set environment variables using the Vercel dashboard or CLI

### 3. Database Connection Settings

For optimal database performance in a serverless environment, make sure to configure connection pooling:

1. If using Vercel Postgres, the connection pooling is handled automatically
2. If using Neon or another provider, set up connection pooling and configure:
   - `DATABASE_URL`: Your pooled connection string
   - `DIRECT_URL`: Your direct (non-pooled) connection string

### 4. Run database migrations

After deployment, you need to run Prisma migrations to set up your database schema:

1. Go to the Vercel dashboard and find your project
2. The build command in `vercel.json` is already configured to run Prisma migrations:
   ```
   npx prisma generate && next build
   ```
3. If you need to run migrations manually:
   ```
   npx prisma migrate deploy
   ```

### 5. Set up admin user

The default admin user will be created automatically with the following credentials:
- Email: `admin@ryd.org`
- Password: `Admin123!`

You should log in with these credentials and change the password immediately.

## Authentication Troubleshooting

If users are having issues with authentication in production:

### Common Issues and Solutions

1. **Invalid credentials error**:
   - Check that the user's email is correctly formatted and case-sensitive
   - Ensure the database connection is properly configured
   - Verify that the password is being hashed consistently

2. **NextAuth configuration**:
   - Ensure `NEXTAUTH_URL` is set correctly with the deployed URL
   - Check that `NEXTAUTH_SECRET` is properly set with a secure random string (at least 32 characters)
   - Verify that the `trustHost` option is enabled in your NextAuth config

3. **CSRF Token errors**:
   - If you encounter "MissingCSRF" errors in the logs:
     - Verify `NEXTAUTH_SECRET` is correctly set in your environment variables
     - Ensure all cookies are being properly sent with requests
     - Check that `basePath` is set to `/api/auth` in your NextAuth config
     - For production, set the following environment variables:
       ```
       NEXTAUTH_URL=https://your-domain.com
       NEXTAUTH_SECRET=your-secure-random-string
       ```
     - Clear browser cookies and try again
     - Disable any browser extensions that might block cookies
     - If using custom domains with Vercel, ensure `NEXTAUTH_URL` reflects your custom domain

4. **Database connection issues**:
   - Check the Vercel logs for any database connection errors
   - Ensure your database service allows connections from Vercel's IP addresses
   - Verify connection pooling is properly configured

5. **Debugging authentication**:
   - Enable NextAuth debug mode by setting `NEXTAUTH_DEBUG=true` in your environment variables
   - Check browser console for client-side errors
   - Review Vercel Function Logs for any server-side errors
   - Use browser developer tools to check if cookies are being properly set

## General Troubleshooting

### Database connection issues

- Ensure your database connection string is correctly formatted
- Check that your database service allows connections from Vercel's IP addresses
- Verify that the database user has the necessary permissions

### Building or runtime errors

- Check the deployment logs in the Vercel dashboard
- Verify that all environment variables are correctly set
- Make sure any file path references are compatible with Vercel's serverless environment 