@echo off
git add .
git commit -m "Auto deploy %date% %time%"
git push origin main
echo Done! Build sent to Vercel.