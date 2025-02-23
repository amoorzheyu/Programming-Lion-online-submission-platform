@echo off

:: 设置 uploads 文件夹的路径
set UPLOADS_DIR=uploads

:: 删除 uploads 文件夹下的所有文件
del /q "%UPLOADS_DIR%\*"

echo 所有文件已被删除
pause
