@echo off
rem Rift Kontra - bu bilgisayardan tam guncelleme (buluttan engellenen kaynaklar burada cekilir)
rem Kullanim: guncelle.cmd  (cift tikla)
cd /d "%~dp0"
git pull -q
echo === Wild Rift ===
node wr\scripts\update.js %*
if exist lol\scripts\update.js (echo === League of Legends === & node lol\scripts\update.js %*)
if exist valorant\scripts\update.js (echo === VALORANT === & node valorant\scripts\update.js %*)
for %%d in (wr\data wr\img lol\data lol\img valorant\data valorant\img) do if exist %%d git add %%d
git diff --cached --quiet && (echo Veri degismedi.) || (git commit -q -m "Veri guncellemesi (yerel)" && git push -q && echo Gonderildi.)
pause
