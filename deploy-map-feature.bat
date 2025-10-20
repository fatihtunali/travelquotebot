@echo off
echo ========================================
echo Deploying Map Feature to Production
echo ========================================
echo.
echo Connecting to server...
echo.

ssh tqb@188.132.230.193 "cd /home/tqb/app/travelquotebot && git pull origin main && npm install && npm run build && pm2 restart travelquotebot"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Please test the map at:
echo https://funnytourism-ykkq.travelquotebot.com/request/funnytourism-ykkq/itinerary/5ee55c04-5881-4bd1-8bb5-a8549dd058be
echo.
pause
