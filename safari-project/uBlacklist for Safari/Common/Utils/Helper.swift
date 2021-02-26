//
//  Helper.swift
//  uBlacklist for Safari
//
//  Created by Selina on 29/1/2021.
//

import Cocoa

extension Bundle {
    
    class func appVersion() -> String {
        if let infoDict = Bundle.main.infoDictionary {
            if let version = infoDict["CFBundleShortVersionString"] as? String {
                return version
            }
        }
        
        return ""
    }
}

extension NSFont {
    
    class func avenirHeavy(size fontSize: CGFloat) -> NSFont {
        let font = NSFont(name: "Avenir-Heavy", size: fontSize)!
        return font
    }
    
    class func avenirMedium(size fontSize: CGFloat) -> NSFont {
        let font = NSFont(name: "Avenir-Medium", size: fontSize)!
        return font
    }
    
    class func avenirLight(size fontSize: CGFloat) -> NSFont {
        let font = NSFont(name: "Avenir-Light", size: fontSize)!
        return font
    }
}

extension NSColor {
    
    convenience init(hex: String, alpha: CGFloat = 1) {
        let scanner = Scanner(string: hex)
        scanner.scanLocation = hex[hex.startIndex] == "#" ? 1 : 0
        
        var rgb: UInt32 = 0
        scanner.scanHexInt32(&rgb)
        
        self.init(red: CGFloat((rgb & 0xFF0000) >> 16)/255.0, green: CGFloat((rgb & 0xFF00) >> 8)/255.0, blue: CGFloat(rgb & 0xFF)/255.0, alpha: alpha)
    }
    
    class func themeColor() -> NSColor {
        return NSColor(hex: "#5E5CE6")
    }
    
    class func bgColor() -> NSColor {
        return NSColor(hex: "#161725")
    }
    
    class func secondaryBgColor() -> NSColor {
        return NSColor(hex: "#21212E")
    }
    
    class func appTextColor() -> NSColor {
        return .white
    }
    
    class func appSecondaryTextColor() -> NSColor {
        return NSColor(hex: "#999999")
    }
    
    class func confirmColor() -> NSColor {
        return NSColor(hex: "#5CC7A2")
    }
}

extension NSImage {
    
    func tint(color: NSColor) -> NSImage {
        let image = self.copy() as! NSImage
        image.lockFocus()
        
        color.set()
        
        let imageRect = NSRect(origin: NSZeroPoint, size: image.size)
        imageRect.fill(using: .sourceAtop)
        
        image.unlockFocus()
        
        return image
    }
}

extension String {
    
    func localized(withComment comment: String? = nil) -> String {
        return NSLocalizedString(self, comment: comment ?? "")
    }
}

extension NSWorkspace {
    
    func open(inSafari url: URL) {
        let safariBundleId = "com.apple.Safari"
        
        if #available(OSX 10.15, *) {
            let config = NSWorkspace.OpenConfiguration()
            let safariURL = self.urlForApplication(withBundleIdentifier: safariBundleId)
            self.open([url], withApplicationAt: safariURL!, configuration: config, completionHandler: nil)
        } else {
            // Fallback on earlier versions
            self.open([url], withAppBundleIdentifier: safariBundleId, options: .default, additionalEventParamDescriptor: nil, launchIdentifiers: nil)
        }
    }
}
