param(
    [string]$Exe = 'C:\Github\t-rex\release\T-Rex H2O-win32-x64\T-Rex H2O.exe',
    [string]$OutPath = 'C:\Github\t-rex\media\verify\win-build.png'
)

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
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
if (-not ('Win32' -as [type])) { Add-Type -TypeDefinition $pinvoke }

New-Item -ItemType Directory -Force -Path (Split-Path $OutPath) | Out-Null

Write-Host "Launching $Exe"
# Ensure clean process state
Get-Process -Name 'T-Rex H2O' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

$proc = Start-Process -FilePath $Exe -PassThru
$hwnd = [IntPtr]::Zero
# Look for the actual app window — distinguished by reasonable size (>= 200x200) and on-screen position
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    $candidates = Get-Process -Name 'T-Rex H2O' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }
    foreach ($c in $candidates) {
        $r = New-Object Win32+RECT
        [void][Win32]::GetWindowRect($c.MainWindowHandle, [ref]$r)
        $cw = $r.Right - $r.Left
        $ch = $r.Bottom - $r.Top
        if ($cw -ge 200 -and $ch -ge 200 -and $r.Left -ge 0 -and $r.Top -ge 0) {
            $hwnd = $c.MainWindowHandle
            break
        }
    }
    if ($hwnd -ne [IntPtr]::Zero) { break }
}
if ($hwnd -eq [IntPtr]::Zero) {
    Write-Error "T-Rex H2O window did not appear with reasonable dimensions"
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
$bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose()
$bmp.Dispose()

Write-Host "Saved $OutPath"

Get-Process -Name 'T-Rex H2O' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Done"
