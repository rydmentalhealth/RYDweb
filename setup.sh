#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}    RYD Admin - PostgreSQL & Prisma Setup Script    ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if PostgreSQL is installed
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is already installed${NC}"
else
    echo -e "${BLUE}Installing PostgreSQL...${NC}"
    
    # Check the OS and install PostgreSQL accordingly
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install postgresql
    else
        echo -e "${RED}Unsupported OS. Please install PostgreSQL manually.${NC}"
        exit 1
    fi
    
    # Start PostgreSQL service
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo service postgresql start
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql
    fi
    
    echo -e "${GREEN}✅ PostgreSQL installed successfully${NC}"
fi

# Check if the postgres user exists and can be accessed
if sudo -u postgres psql -c '\q' &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL user is accessible${NC}"
else
    echo -e "${RED}Cannot access PostgreSQL with postgres user.${NC}"
    echo -e "${RED}Please ensure PostgreSQL is properly configured.${NC}"
    exit 1
fi

# Database name, user, and password
DB_NAME="rydadmin"
DB_USER="ryduser"
DB_PASSWORD=$(openssl rand -base64 12)

echo -e "${BLUE}Setting up database '${DB_NAME}'...${NC}"

# Check if database and user already exist
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -wq ${DB_NAME} && echo "true" || echo "false")
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 && echo "true" || echo "false")

if [[ "$USER_EXISTS" == "true" ]]; then
    echo -e "${YELLOW}User '${DB_USER}' already exists. Updating password...${NC}"
    # Update password for existing user
    sudo -u postgres psql -c "ALTER USER ${DB_USER} PASSWORD '${DB_PASSWORD}';" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Password updated for existing user '${DB_USER}'${NC}"
    else
        echo -e "${RED}Failed to update password for user '${DB_USER}'.${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}Creating user '${DB_USER}'...${NC}"
    sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ User '${DB_USER}' created successfully${NC}"
    else
        echo -e "${RED}Failed to create user '${DB_USER}'.${NC}"
        exit 1
    fi
fi

if [[ "$DB_EXISTS" == "true" ]]; then
    echo -e "${YELLOW}Database '${DB_NAME}' already exists. Ensuring permissions...${NC}"
    # Ensure permissions are set correctly
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" >/dev/null 2>&1
else
    echo -e "${BLUE}Creating database '${DB_NAME}'...${NC}"
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" >/dev/null 2>&1
if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database '${DB_NAME}' created successfully${NC}"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" >/dev/null 2>&1
    else
        echo -e "${RED}Failed to create database '${DB_NAME}'.${NC}"
        exit 1
    fi
fi

# Enable required extensions
echo -e "${BLUE}Setting up database extensions...${NC}"
sudo -u postgres psql -d ${DB_NAME} -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >/dev/null 2>&1

echo -e "${GREEN}✅ Database setup completed successfully${NC}"
    
    # Update .env file with database connection
    echo -e "${BLUE}Updating .env file...${NC}"
    
    # Create or update .env file
    if [ -f .env ]; then
        # Backup existing .env file
        cp .env .env.backup
    fi
    
    # Create/update DATABASE_URL in .env file
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
    
    if grep -q "DATABASE_URL" .env 2>/dev/null; then
        # Replace existing DATABASE_URL
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"${CONNECTION_STRING}\"|g" .env
        rm -f .env.bak
    else
        # Add DATABASE_URL if it doesn't exist
        echo "DATABASE_URL=\"${CONNECTION_STRING}\"" >> .env
    fi
    
    echo -e "${GREEN}✅ .env file updated with database configuration${NC}"
    
    # Run Prisma migrations
    echo -e "${BLUE}Running Prisma migrations...${NC}"
    npx prisma migrate dev --name initial
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Prisma migrations completed successfully${NC}"
    else
        echo -e "${RED}Failed to run Prisma migrations. Please check your Prisma schema.${NC}"
    exit 1
    fi
    
    # Create admin user
    echo -e "${BLUE}Creating initial admin user...${NC}"
    npx prisma db seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeding completed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Database seeding encountered an issue (admin user might already exist)${NC}"
fi
    
    # Print success message
    echo ""
    echo -e "${GREEN}==================================================${NC}"
    echo -e "${GREEN}    RYD Admin setup completed successfully!    ${NC}"
    echo -e "${GREEN}==================================================${NC}"
    echo ""
    echo -e "Database Information:"
    echo -e "  - Database: ${BLUE}${DB_NAME}${NC}"
    echo -e "  - Username: ${BLUE}${DB_USER}${NC}"
    echo -e "  - Password: ${BLUE}${DB_PASSWORD}${NC}"
echo ""
echo -e "Admin User Credentials:"
echo -e "  - Email: ${BLUE}admin@ryd.org${NC}"
echo -e "  - Password: ${BLUE}Admin123!${NC}"
    echo ""
    echo -e "The database connection string has been added to your .env file."
    echo -e "You can now run ${BLUE}npm run dev${NC} to start the application."
    echo ""