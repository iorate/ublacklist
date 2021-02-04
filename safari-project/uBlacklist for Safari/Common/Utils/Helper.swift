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

extension String {
    func localized(withComment comment: String? = nil) -> String {
        return NSLocalizedString(self, comment: comment ?? "")
    }
}

extension NSWorkspace {
    func open(inSafari url: URL) {
        let config = NSWorkspace.OpenConfiguration()
        
        let safariURL = self.urlForApplication(withBundleIdentifier: "com.apple.Safari")
        self.open([url], withApplicationAt: safariURL!, configuration: config, completionHandler: nil)
    }
}
