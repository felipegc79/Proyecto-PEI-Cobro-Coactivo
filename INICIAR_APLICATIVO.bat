@echo off
title Sistema de Cobro Coactivo
color 0A
echo ==================================================
echo       INICIANDO SISTEMA DE COBRO COACTIVO
echo ==================================================
echo.
echo Iniciando el servidor de desarrollo...
echo El navegador se abrira automaticamente en unos segundos.
echo.

cd frontend
cmd /k "npm run dev -- --open"
