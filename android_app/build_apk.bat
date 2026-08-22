@echo off
echo ===================================================
echo   ACABA SALAK MIYIM? - Android APK Derleyici
echo ===================================================
echo.

echo 1. Web varliklari kopyalaniyor...
copy /Y ..\app_simulator\index.html www\index.html

echo 2. Capacitor senkronize ediliyor...
call npx cap sync android

echo 3. APK derleniyor...
cd android
call gradlew.bat assembleDebug

echo.
echo ===================================================
echo Derleme Tamamlandi!
echo APK Dosyasi Konumu:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo ===================================================
pause
