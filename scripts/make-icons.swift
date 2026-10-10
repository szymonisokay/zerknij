// Generuje ikony aplikacji z ikony „oko” (design/icons/eye.svg).
// Użycie: swift scripts/make-icons.swift
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let mint = CGColor(srgbRed: 125 / 255, green: 211 / 255, blue: 168 / 255, alpha: 1)
let background = CGColor(srgbRed: 14 / 255, green: 19 / 255, blue: 17 / 255, alpha: 1)
let white = CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 1)

/// Rysuje oko o szerokości `eyeWidth` (część płótna) na środku kwadratu `size`×`size`.
func render(_ file: String, size: Int, eyeWidth: CGFloat, fill: CGColor?, stroke: CGColor) {
  let s = CGFloat(size)
  let ctx = CGContext(
    data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
    space: CGColorSpace(name: CGColorSpace.sRGB)!,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  if let fill {
    ctx.setFillColor(fill)
    ctx.fill(CGRect(x: 0, y: 0, width: s, height: s))
  }

  // Ścieżka w układzie 24×24 jak w SVG; oko ma 20 jednostek + obrys 2.
  let unit = eyeWidth * s / 22
  ctx.translateBy(x: s / 2, y: s / 2)
  ctx.scaleBy(x: unit, y: unit)
  ctx.translateBy(x: -12, y: -12)

  let path = CGMutablePath()
  path.move(to: CGPoint(x: 2, y: 12))
  path.addCurve(to: CGPoint(x: 12, y: 5), control1: CGPoint(x: 2, y: 12), control2: CGPoint(x: 5.5, y: 5))
  path.addCurve(to: CGPoint(x: 22, y: 12), control1: CGPoint(x: 18.5, y: 5), control2: CGPoint(x: 22, y: 12))
  path.addCurve(to: CGPoint(x: 12, y: 19), control1: CGPoint(x: 22, y: 12), control2: CGPoint(x: 18.5, y: 19))
  path.addCurve(to: CGPoint(x: 2, y: 12), control1: CGPoint(x: 5.5, y: 19), control2: CGPoint(x: 2, y: 12))
  path.closeSubpath()
  path.addEllipse(in: CGRect(x: 9, y: 9, width: 6, height: 6))

  ctx.addPath(path)
  ctx.setStrokeColor(stroke)
  ctx.setLineWidth(2)
  ctx.setLineCap(.round)
  ctx.setLineJoin(.round)
  ctx.strokePath()

  let url = URL(fileURLWithPath: "assets/images/\(file)")
  let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, ctx.makeImage()!, nil)
  CGImageDestinationFinalize(dest)
  print("assets/images/\(file)")
}

// Ikona dla starszych launcherów: pełne tło.
render("icon.png", size: 1024, eyeWidth: 0.56, fill: background, stroke: mint)
// Ikona adaptacyjna: oko mieści się w bezpiecznej strefie (66% środka), tło to kolor z app.json.
render("android-icon-foreground.png", size: 1024, eyeWidth: 0.46, fill: nil, stroke: mint)
// Ikony tematyczne (Android 13+): system koloruje kształt, liczy się tylko alfa.
render("android-icon-monochrome.png", size: 1024, eyeWidth: 0.46, fill: nil, stroke: white)
// Ekran startowy.
render("splash-icon.png", size: 512, eyeWidth: 0.9, fill: nil, stroke: mint)
