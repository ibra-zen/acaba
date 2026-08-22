@echo off
echo ===================================================
echo   ACABA SALAK MIYIM? - Play Store Release AAB Derleyici
echo ===================================================
echo.

echo 1. Web varliklari senkronize ediliyor...
copy /Y ..\app_simulator\index.html www\index.html
call npx cap sync android

echo 2. Play Store AAB Bundle derleniyor...
cd android
call gradlew.bat bundleRelease

echo.
echo ===================================================
echo Derleme Tamamlandi!
echo Play Store AAB Dosyasi Konumu:
echo android\app\build\outputs\bundle\release\app-release.aab
echo ===================================================
pause
