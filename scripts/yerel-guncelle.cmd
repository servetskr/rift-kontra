@echo off
rem Rift Kontra - yerel tam guncelleme (eslesme verisi bulutta engellendigi icin bu bilgisayardan cekilir)
cd /d "%~dp0.."
git pull -q
node scripts\update.js %*
git add data img
git diff --cached --quiet && (echo Veri degismedi.) || (git commit -q -m "Veri guncellemesi (yerel)" && git push -q && echo Gonderildi.)
