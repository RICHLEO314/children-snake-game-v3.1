@echo off
set PATH=%PATH%;C:\Users\Administrator\python-sdk\python3.13.2
python --version
if %ERRORLEVEL% EQU 0 (
    echo Python路径已临时设置成功！
    echo 现在可以使用python命令了。
    echo 注意：此设置仅对当前命令窗口有效。
) else (
    echo 设置失败，请检查Python安装路径是否正确。
)