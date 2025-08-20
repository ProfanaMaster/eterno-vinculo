@echo off
echo Matando todos los procesos de Node.js...
taskkill /f /im node.exe 2>nul
taskkill /f /im nodemon.exe 2>nul
echo Procesos terminados.
echo Iniciando servidor...
npm run dev