Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$illustrationDir = Join-Path $PSScriptRoot '..\public\assets\images\illustration'
$iconsDir = Join-Path $PSScriptRoot '..\public\assets\images\icons'
$maxIllustrationWidth = 1280
$mobileIllustrationWidth = 800
$jpegQuality = 82L
$iconMaxWidth = 96

function Get-JpegEncoder {
    [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
}

function Get-EncoderParameters([long]$quality) {
    $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
        [System.Drawing.Imaging.Encoder]::Quality,
        $quality
    )
    $parameters
}

function Save-Bitmap([System.Drawing.Bitmap]$bitmap, [string]$path, [long]$quality) {
    $encoder = Get-JpegEncoder
    $directory = Split-Path $path -Parent
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    $bitmap.Save($path, $encoder, (Get-EncoderParameters $quality))
}

function Resize-Bitmap([System.Drawing.Image]$image, [int]$maxWidth) {
    $scale = 1.0
    $longest = [Math]::Max($image.Width, $image.Height)
    if ($longest -gt $maxWidth) {
        $scale = $maxWidth / $longest
    }
    $targetWidth = [Math]::Max(1, [int][Math]::Round($image.Width * $scale))
    $targetHeight = [Math]::Max(1, [int][Math]::Round($image.Height * $scale))
    $bitmap = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($image, 0, 0, $targetWidth, $targetHeight)
    $graphics.Dispose()
    $bitmap
}

function Read-Image([string]$path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $stream = New-Object System.IO.MemoryStream(,$bytes)
    [System.Drawing.Image]::FromStream($stream)
}

function Optimize-Illustration([string]$path) {
    $image = Read-Image $path
    try {
        $desktop = Resize-Bitmap $image $maxIllustrationWidth
        try {
            Save-Bitmap $desktop $path $jpegQuality
        } finally {
            $desktop.Dispose()
        }

        $mobile = Resize-Bitmap $image $mobileIllustrationWidth
        try {
            $baseName = [System.IO.Path]::GetFileNameWithoutExtension($path)
            $mobilePath = Join-Path ([System.IO.Path]::GetDirectoryName($path)) "$baseName-800.jpg"
            Save-Bitmap $mobile $mobilePath $jpegQuality
        } finally {
            $mobile.Dispose()
        }
    } finally {
        $image.Dispose()
    }
}

function Optimize-Icon([string]$path) {
    $image = Read-Image $path
    try {
        $resized = Resize-Bitmap $image $iconMaxWidth
        try {
            $resized.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
        } finally {
            $resized.Dispose()
        }
    } finally {
        $image.Dispose()
    }
}

Get-ChildItem $illustrationDir -File | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } | ForEach-Object {
    Optimize-Illustration $_.FullName
    Write-Output "Optimized illustration $($_.Name)"
}

Get-ChildItem $iconsDir -File -Filter '*.png' | ForEach-Object {
    Optimize-Icon $_.FullName
    Write-Output "Optimized icon $($_.Name)"
}

Write-Output 'Image optimization complete.'
