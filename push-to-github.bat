@echo off
echo Initializing git repository...
git init

echo Adding all files...
git add -A

echo Committing files...
git commit -m "Initial commit: UARS Dashboard - Cross-chain reputation system with Achievement NFTs"

echo Adding GitHub remote...
git remote add origin https://github.com/Althafp/UARS.git

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo Done! Your code is now on GitHub.
pause

