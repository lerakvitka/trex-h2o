$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$pinvoke = @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")]
    public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
Add-Type -TypeDefinition $pinvoke

$exe = 'C:\Github\t-rex\release\T-Rex H2O-win32-x64\T-Rex H2O.exe'
$outPath = 'C:\Github\t-rex\media\verify\win-build.png'
New-Item -ItemType Directory -Force -Path (Split-Path $outPath) | Out-Null

Write-Host "Launching $exe"
$proc = Start-Process -FilePath $exe -PassThru
$hwnd = [IntPtr]::Zero
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    $p = Get-Process -Name 'T-Rex H2O' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
    if ($p) { $hwnd = $p.MainWindowHandle; break }
}
if ($hwnd -eq [IntPtr]::Zero) {
    Write-Error "T-Rex H2O window did not appear"
    Get-Process -Name 'T-Rex H2O' -ErrorAction SilentlyContinue | Stop-Process -Force
    exit 1
}

# Give the React app extra time to fully render (zoom factor applied after did-finish-load)
Start-Sleep -Seconds 4

$rect = New-Object Win32+RECT
[void][Win32]::GetWindowRect($hwnd, [ref]$rect)
$w = $rect.Right - $rect.Left
$h = $rect.Bottom - $rect.Top
Write-Host "Window rect: x=$($rect.Left) y=$($rect.Top) w=$w h=$h"

# PrintWindow captures the window's actual pixels regardless of Z-order.
# Note: with Chromium/Electron, PW_RENDERFULLCONTENT (flag 2) often only renders
# the upper portion — sufficient to verify the build launches and renders correctly.
$bmp = New-Object System.Drawing.Bitmap $w, $h
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $gfx.GetHdc()
$ok = [Win32]::PrintWindow($hwnd, $hdc, 2)
$gfx.ReleaseHdc($hdc)
Write-Host "PrintWindow returned $ok"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose()
$bmp.Dispose()

Write-Host "Saved $outPath"

Get-Process -Name 'T-Rex H2O' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Done"
