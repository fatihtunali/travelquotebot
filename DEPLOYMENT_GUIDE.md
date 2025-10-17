# TravelQuoteBot Production Deployment Guide

## Server Information
- **Host:** 188.132.230.193
- **User:** tqb
- **SSH:** `ssh tqb@188.132.230.193`
- **App Directory:** `/home/tqb/app/travelquotebot`

---

## Quick Deployment (Manual Steps)

### Step 1: Connect to Server
```bash
ssh tqb@188.132.230.193
```

### Step 2: Navigate to App Directory
```bash
cd /home/tqb/app
```

### Step 3: Remove Old Installation (if exists)
```bash
rm -rf travelquotebot
```

### Step 4: Upload Files from Local Machine

**Option A: Using SCP (from your local machine)**
```bash
cd C:\Users\fatih\Desktop\TripPlannerAI\travelquotebot
scp -r . tqb@188.132.230.193:/home/tqb/app/travelquotebot
```

**Option B: Using Git (recommended)**
```bash
# On your local machine, commit and push to a repository
git init
git add .
git commit -m "Initial production deployment"
git remote add origin YOUR_REPO_URL
git push -u origin main

# Then on the server:
cd /home/tqb/app
git clone YOUR_REPO_URL travelquotebot
```

**Option C: Using SFTP**
1. Use FileZilla or WinSCP
2. Connect to: sftp://188.132.230.193
3. Upload the entire `travelquotebot` folder to `/home/tqb/app/`

### Step 5: Install Dependencies on Server
```bash
cd /home/tqb/app/travelquotebot
npm install --production
```

### Step 6: Create Environment File
```bash
cat > .env.local << 'EOF'
# Database Configuration (already on same server)
DB_HOST=localhost
DB_PORT=3306
DB_USER=tqb
DB_PASSWORD=YOUR_DB_PASSWORD
DB_DATABASE=tqb_db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Anthropic API
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dwgua2oxy
CLOUDINARY_API_KEY=994236387543137
CLOUDINARY_API_SECRET=FOnpJ8e5Pm9Q9uEw851Kh67BqQY

# App URL
NEXT_PUBLIC_APP_URL=http://188.132.230.193:3000
EOF
```

### Step 7: Build the Application
```bash
npm run build
```

### Step 8: Start with PM2
```bash
# Stop any existing instance
pm2 stop travelquotebot
pm2 delete travelquotebot

# Start the application
pm2 start npm --name "travelquotebot" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Step 9: Check Status
```bash
pm2 status
pm2 logs travelquotebot
```

### Step 10: Test the Application
```bash
curl http://localhost:3000/api/test-e2e
```

---

## Alternative: Automated Deployment Script

Save this as `deploy.sh` on your local machine:

```bash
#!/bin/bash

# Configuration
SERVER="tqb@188.132.230.193"
APP_DIR="/home/tqb/app/travelquotebot"
LOCAL_DIR="C:/Users/fatih/Desktop/TripPlannerAI/travelquotebot"

echo "🚀 Starting deployment to production server..."

# 1. Build locally
echo "📦 Building application locally..."
cd "$LOCAL_DIR"
npm run build

# 2. Create deployment package
echo "📦 Creating deployment package..."
tar -czf travelquotebot.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next/cache \
  .next package.json package-lock.json \
  app lib public

# 3. Upload to server
echo "⬆️  Uploading to server..."
scp travelquotebot.tar.gz "$SERVER:/home/tqb/app/"

# 4. Extract and install on server
echo "📥 Installing on server..."
ssh "$SERVER" << 'ENDSSH'
cd /home/tqb/app
rm -rf travelquotebot
mkdir -p travelquotebot
cd travelquotebot
tar -xzf ../travelquotebot.tar.gz
npm install --production --legacy-peer-deps

# Restart PM2
pm2 restart travelquotebot || pm2 start npm --name "travelquotebot" -- start
pm2 save

echo "✅ Deployment complete!"
pm2 status
ENDSSH

echo "✅ Deployment finished! Check status at http://188.132.230.193:3000"
```

---

## Manual Deployment (Step-by-Step with Commands)

### On Your Local Machine:

```bash
# 1. Navigate to project
cd C:\Users\fatih\Desktop\TripPlannerAI\travelquotebot

# 2. Build the project
npm run build

# 3. Create a deployment archive (excluding dev files)
tar -czf deploy.tar.gz ^
  --exclude=node_modules ^
  --exclude=.git ^
  --exclude=.next/cache ^
  .next package.json package-lock.json app lib public next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs

# 4. Upload to server
scp deploy.tar.gz tqb@188.132.230.193:/home/tqb/app/
```

### On the Server (via SSH):

```bash
# 1. SSH to server
ssh tqb@188.132.230.193

# 2. Navigate and extract
cd /home/tqb/app
rm -rf travelquotebot
mkdir travelquotebot
cd travelquotebot
tar -xzf ../deploy.tar.gz

# 3. Install dependencies
npm install --production

# 4. Create .env.local file
nano .env.local
# (paste the environment variables from Step 6 above)

# 5. Start with PM2
pm2 stop travelquotebot 2>/dev/null || true
pm2 delete travelquotebot 2>/dev/null || true
pm2 start npm --name "travelquotebot" -- start
pm2 save

# 6. Check status
pm2 logs travelquotebot --lines 50
```

---

## Port Configuration

The application runs on port 3000 by default. You have two options:

### Option 1: Access via Port 3000
- URL: `http://188.132.230.193:3000`
- Ensure firewall allows port 3000

### Option 2: Configure Nginx/Apache Reverse Proxy (Recommended)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name travelquotebot.com www.travelquotebot.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Post-Deployment Checklist

- [ ] Application accessible at server IP
- [ ] Database connection working
- [ ] Environment variables loaded correctly
- [ ] PM2 process running and stable
- [ ] Logs show no errors
- [ ] Test endpoint returns success: `/api/test-e2e`
- [ ] Login page accessible
- [ ] Dashboard loads with branding
- [ ] Customer request form accessible via subdomain route

---

## Monitoring Commands

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs travelquotebot

# Restart application
pm2 restart travelquotebot

# Stop application
pm2 stop travelquotebot

# View system resources
pm2 monit
```

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs travelquotebot --lines 100

# Check if port is in use
netstat -tulpn | grep 3000

# Verify environment variables
cat .env.local

# Test build
npm run build
```

### Database Connection Issues
```bash
# Test database connection
mysql -u tqb -p tqb_db -e "SELECT 1"

# Check if database is running
systemctl status mariadb
```

### Permission Issues
```bash
# Fix ownership
chown -R tqb:tqb /home/tqb/app/travelquotebot

# Fix permissions
chmod -R 755 /home/tqb/app/travelquotebot
```

---

## Update/Redeploy

To update the application:

```bash
# On local machine: build and upload
npm run build
scp -r .next tqb@188.132.230.193:/home/tqb/app/travelquotebot/

# On server: restart
ssh tqb@188.132.230.193
pm2 restart travelquotebot
```

---

## Security Recommendations

1. **Change JWT Secret** in production
2. **Set up SSL/HTTPS** using Let's Encrypt
3. **Configure Firewall** to only allow necessary ports
4. **Enable PM2 logs rotation** to prevent disk space issues
5. **Set up automated backups** for database
6. **Configure rate limiting** on public endpoints

---

## Support

For issues:
1. Check PM2 logs: `pm2 logs travelquotebot`
2. Check Next.js logs in console
3. Verify environment variables
4. Test database connectivity
5. Review TEST_RESULTS.md for expected behavior

---

**Deployment Status:** Ready to Deploy
**Last Updated:** October 17, 2025
