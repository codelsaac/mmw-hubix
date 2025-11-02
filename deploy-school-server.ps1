# MMW Hubix - School Server Deployment Script
# Run this on your school server to deploy/update the application

param(
    [switch]$FirstTime,
    [switch]$Update,
    [switch]$Restart
)

Write-Host "🏫 MMW Hubix School Server Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

if ($FirstTime) {
    Write-Host "📦 First-time deployment..." -ForegroundColor Yellow
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    
    # Run database migrations
    Write-Host "Running database migrations..." -ForegroundColor Cyan
    npx prisma migrate deploy
    
    # Seed database
    Write-Host "Seeding database..." -ForegroundColor Cyan
    npm run db:seed
    
    # Build application
    Write-Host "Building application..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "✅ First-time deployment completed!" -ForegroundColor Green
}

if ($Update) {
    Write-Host "🔄 Updating application..." -ForegroundColor Yellow
    
    # Pull latest changes (if using git)
    # git pull origin main
    
    # Install new dependencies
    Write-Host "Installing/updating dependencies..." -ForegroundColor Cyan
    npm install
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    
    # Run database migrations (if schema changed)
    Write-Host "Running database migrations..." -ForegroundColor Cyan
    npx prisma migrate deploy
    
    # Build application
    Write-Host "Building application..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "✅ Application updated!" -ForegroundColor Green
}

if ($Restart) {
    Write-Host "🔄 Restarting application..." -ForegroundColor Yellow
    
    # Stop existing process (if running with PM2)
    # pm2 stop mmw-hubix
    
    # Start application
    Write-Host "Starting application..." -ForegroundColor Cyan
    npm start
    
    Write-Host "✅ Application restarted!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Deployment completed!" -ForegroundColor Green
Write-Host "Your MMW Hubix application should be running on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  .\deploy-school-server.ps1 -FirstTime  # First deployment" -ForegroundColor White
Write-Host "  .\deploy-school-server.ps1 -Update    # Update application" -ForegroundColor White
Write-Host "  .\deploy-school-server.ps1 -Restart   # Restart application" -ForegroundColor White
