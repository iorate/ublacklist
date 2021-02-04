//
//  WindowController.swift
//  uBlacklist for Safari
//
//  Created by Selina on 7/1/2021.
//

import Cocoa

class MainWindowController: NSWindowController {
    
    override func windowDidLoad() {
        super.windowDidLoad()
        self.window?.backgroundColor = NSColor.bgColor()
        self.contentViewController = MainViewController()
    }
}
