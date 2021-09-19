//
//  Helper.swift
//  uBlacklist for Safari
//
//  Created by Selina on 29/1/2021.
//

import Cocoa


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
