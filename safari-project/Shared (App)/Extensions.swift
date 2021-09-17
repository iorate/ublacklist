//
//  Extensions.swift
//  uBlacklist for Safari
//
//  Created by Selina on 16/9/2021.
//

import Foundation

#if os(iOS)
import UIKit
typealias Font = UIFont
typealias Color = UIColor
#elseif os(macOS)
import Cocoa
typealias Font = NSFont
typealias Color = NSColor
#endif

extension Font {
    
    class func avenirHeavy(size fontSize: CGFloat) -> Font {
        let font = Font(name: "Avenir-Heavy", size: fontSize)!
        return font
    }
    
    class func avenirMedium(size fontSize: CGFloat) -> Font {
        let font = Font(name: "Avenir-Medium", size: fontSize)!
        return font
    }
    
    class func avenirLight(size fontSize: CGFloat) -> Font {
        let font = Font(name: "Avenir-Light", size: fontSize)!
        return font
    }
}

extension Color {
    
    convenience init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }
    
    class func themeColor() -> Color {
        return Color(hex: "#5E5CE6")
    }
    
    class func bgColor() -> Color {
        return Color(hex: "#161725")
    }
    
    class func secondaryBgColor() -> Color {
        return Color(hex: "#21212E")
    }
    
    class func appTextColor() -> Color {
        return .white
    }
    
    class func appSecondaryTextColor() -> Color {
        return Color(hex: "#999999")
    }
    
    class func confirmColor() -> Color {
        return Color(hex: "#5CC7A2")
    }
}

extension String {
    
    func localized(withComment comment: String? = nil) -> String {
        return NSLocalizedString(self, comment: comment ?? "")
    }
}

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
