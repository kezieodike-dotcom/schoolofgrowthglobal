$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$source = [System.Drawing.Image]::FromFile((Join-Path $root 'public/logo.jpg'))
$destination = Join-Path $root 'public/icons'
[System.IO.Directory]::CreateDirectory($destination) | Out-Null
$exports = @(
  @{ Name = 'sgg-launch-192-v1.png'; Size = 192; Scale = 0.92 },
  @{ Name = 'sgg-launch-512-v1.png'; Size = 512; Scale = 0.92 },
  @{ Name = 'sgg-maskable-512-v1.png'; Size = 512; Scale = 0.60 },
  @{ Name = 'sgg-apple-touch-180-v1.png'; Size = 180; Scale = 0.92 }
)
try {
  foreach ($export in $exports) {
    $size = $export.Size
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.Clear([System.Drawing.Color]::Black)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      # Preserve the original artwork's proportions; maskable icons need a wider safe margin.
      $scale = $size * $export.Scale / [Math]::Max($source.Width, $source.Height)
      $width = [int][Math]::Round($source.Width * $scale)
      $height = [int][Math]::Round($source.Height * $scale)
      $left = [int][Math]::Round(($size - $width) / 2)
      $top = [int][Math]::Round(($size - $height) / 2)
      $graphics.DrawImage($source, $left, $top, $width, $height)
      $bitmap.Save((Join-Path $destination $export.Name), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  }
} finally {
  $source.Dispose()
}
Get-ChildItem -LiteralPath $destination | Select-Object Name,Length
