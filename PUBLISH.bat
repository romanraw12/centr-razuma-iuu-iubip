@echo off
chcp 65001 >nul
setlocal
title Publish - Centr razuma

rem PUBLISH.bat — публикация сайта без PowerShell.
rem При пуше git сам спросит имя пользователя и токен GitHub.

set "PROJ=C:\Users\user\.cline\data\workspaces\chat\centr-razuma-iuu-iubip"
cd /d "%PROJ%"
if errorlevel 1 (
  echo ERROR: project folder not found
  pause
  exit /b 1
)

rem --- найти git.exe ---
set "GITEXE="
if exist "C:\Program Files\Git\cmd\git.exe" set "GITEXE=C:\Program Files\Git\cmd\git.exe"
if not defined GITEXE if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "GITEXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
if defined GITEXE goto :gitok

echo Searching for git.exe in Downloads, please wait...
for /f "delims=" %%f in ('dir /s /b "%USERPROFILE%\Downloads\git.exe" 2^>nul') do if not defined GITEXE set "GITEXE=%%f"
if defined GITEXE goto :gitok

for /f "delims=" %%f in ('dir /s /b "%USERPROFILE%\Desktop\git.exe" 2^>nul') do if not defined GITEXE set "GITEXE=%%f"
if defined GITEXE goto :gitok

echo.
echo ERROR: git.exe not found.
echo.
echo How to fix, one time:
echo   1. Download MinGit zip:
echo      https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/MinGit-2.47.1-64-bit.zip
echo   2. Right-click the zip, choose "Extract All..." into the Downloads folder
echo   3. Run PUBLISH.bat again
echo.
pause
exit /b 1

:gitok
for %%i in ("%GITEXE%") do set "GITDIR=%%~dpi"
set "PATH=%GITDIR%;%PATH%"
rem если git нашёлся в bin\, добавим ещё и соседний cmd\
echo %GITEXE% | findstr /i "\\bin\\" >nul && set "PATH=%GITDIR%..\cmd;%PATH%"
echo git found: %GITEXE%
git --version
if errorlevel 1 (
  echo ERROR: git found but failed to run. Extract the zip so that this path exists:
echo   Downloads\MinGit-2.47.1-64-bit\cmd\git.exe
  pause
  exit /b 1
)

rem --- конфиг пользователя, если ещё не задан ---
git config user.name >nul 2>&1 || git config user.name romanraw12
git config user.email >nul 2>&1 || git config user.email romanraw12@users.noreply.github.com

rem --- коммит ---
git add -A
git status --porcelain | findstr . >nul
if errorlevel 1 (
  echo Nothing new to commit.
) else (
  git commit -m "feat: electronic library site - Centr razuma IUU IUBiP"
)

rem --- пуш: git попросит логин и токен ---
echo.
echo Pushing to GitHub...
echo   Username: romanraw12
echo   Password: paste your GitHub token here, then press Enter.
echo.
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed - see messages above.
) else (
  echo.
  echo SUCCESS!
  echo Repo:  https://github.com/romanraw12/centr-razuma-iuu-iubip
  echo Site:  https://romanraw12.github.io/centr-razuma-iuu-iubip/
  echo Pages will update in 1-2 minutes.
)
echo.
pause
