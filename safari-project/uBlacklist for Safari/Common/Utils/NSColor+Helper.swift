//
//  NSColor+Helper.swift
//  uBlacklist for Safari
//
//  Created by Selina on 7/1/2021.
//

import Cocoa

extension NSColor {
    
    convenience init(hex: String, alpha: CGFloat = 1) {
        let scanner = Scanner(string: hex)
        scanner.scanLocation = hex[hex.startIndex] == "#" ? 1 : 0
        
        var rgb: UInt32 = 0
        scanner.scanHexInt32(&rgb)
        
        self.init(red: CGFloat((rgb & 0xFF0000) >> 16)/255.0, green: CGFloat((rgb & 0xFF00) >> 8)/255.0, blue: CGFloat(rgb & 0xFF)/255.0, alpha: alpha)
    }
}
