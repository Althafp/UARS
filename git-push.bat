@echo off
echo Adding all files...
git add -A

echo Committing changes...
git commit -m "Add OAuth debug logging and update production URLs"

echo Pushing to GitHub...
git push origin main

echo Done!
pause

