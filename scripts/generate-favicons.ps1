Add-Type -AssemblyName System.Drawing

function Draw-Favicon([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $center = $size / 2.0
    $radius = ($size / 2.0) - 1.5

    # Forest background circle
    $forestBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 19, 38, 28))
    $g.FillEllipse($forestBrush, [float]($center - $radius), [float]($center - $radius), [float]($radius * 2), [float]($radius * 2))

    # Gold rim border
    $goldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 212, 175, 55), [float]($size * 0.055))
    $g.DrawEllipse($goldPen, [float]($center - $radius), [float]($center - $radius), [float]($radius * 2), [float]($radius * 2))

    # Inner subtle dashed ring
    $innerRadius = $radius * 0.85
    $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 212, 175, 55), [float]($size * 0.02))
    $g.DrawEllipse($innerPen, [float]($center - $innerRadius), [float]($center - $innerRadius), [float]($innerRadius * 2), [float]($innerRadius * 2))

    # Star sparkle function (curved 4-pointed star)
    function Draw-Star([float]$cx, [float]$cy, [float]$rayLength, [float]$innerW, [System.Drawing.Color]$col) {
        $brush = New-Object System.Drawing.SolidBrush($col)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        
        # 4 diamond/curved star points
        $pTop = New-Object System.Drawing.PointF($cx, ($cy - $rayLength))
        $pBottom = New-Object System.Drawing.PointF($cx, ($cy + $rayLength))
        $pLeft = New-Object System.Drawing.PointF(($cx - $rayLength), $cy)
        $pRight = New-Object System.Drawing.PointF(($cx + $rayLength), $cy)

        $points = @(
            $pTop,
            (New-Object System.Drawing.PointF(($cx + $innerW), ($cy - $innerW))),
            $pRight,
            (New-Object System.Drawing.PointF(($cx + $innerW), ($cy + $innerW))),
            $pBottom,
            (New-Object System.Drawing.PointF(($cx - $innerW), ($cy + $innerW))),
            $pLeft,
            (New-Object System.Drawing.PointF(($cx - $innerW), ($cy - $innerW)))
        )
        $g.FillPolygon($brush, $points)
        $brush.Dispose()
        $path.Dispose()
    }

    # Diagonal smaller star (45 deg)
    $state = $g.Save()
    $g.TranslateTransform($center, $center)
    $g.RotateTransform(45)
    Draw-Star 0 0 ($size * 0.28) ($size * 0.04) ([System.Drawing.Color]::FromArgb(210, 229, 194, 120))
    $g.Restore($state)

    # Primary 4-pointed star
    Draw-Star $center $center ($size * 0.42) ($size * 0.065) ([System.Drawing.Color]::FromArgb(255, 247, 231, 180))

    # Tiny side accent sparkles
    Draw-Star ($center + $size * 0.26) ($center - $size * 0.26) ($size * 0.12) ($size * 0.02) ([System.Drawing.Color]::FromArgb(240, 247, 231, 180))
    Draw-Star ($center - $size * 0.25) ($center + $size * 0.25) ($size * 0.08) ($size * 0.015) ([System.Drawing.Color]::FromArgb(200, 247, 231, 180))

    # Center glowing jewel
    $coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $coreR = [float]($size * 0.05)
    $g.FillEllipse($coreBrush, [float]($center - $coreR), [float]($center - $coreR), [float]($coreR * 2), [float]($coreR * 2))

    # Clean up
    $forestBrush.Dispose()
    $goldPen.Dispose()
    $innerPen.Dispose()
    $coreBrush.Dispose()
    $g.Dispose()

    return $bmp
}

# Generate resolutions
$bmp16 = Draw-Favicon 16
$bmp32 = Draw-Favicon 32
$bmp48 = Draw-Favicon 48
$bmp180 = Draw-Favicon 180

# Save Apple Touch Icon
$bmp180.Save("d:\Wix\image-to-image-exactly\public\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp32.Save("d:\Wix\image-to-image-exactly\public\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Convert to standard Multi-Resolution .ICO file
$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Open("d:\Wix\image-to-image-exactly\public\favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()

$bmp16.Dispose()
$bmp32.Dispose()
$bmp48.Dispose()
$bmp180.Dispose()

Write-Output "Successfully generated favicon.ico, favicon.svg, favicon-32x32.png, and apple-touch-icon.png!"

