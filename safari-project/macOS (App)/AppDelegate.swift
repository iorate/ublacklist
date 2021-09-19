//
//  AppDelegate.swift
//  uBlacklist for Safari
//
//  Created by Selina on 6/1/2021.
//

import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    private let windowSize = CGSize(width: 594, height: 384)
    
    lazy var window: NSWindow = {
        let screenSize = NSScreen.main!.visibleFrame.size
        let x = (screenSize.width - windowSize.width) / 2
        let y = (screenSize.height - windowSize.height) / 2
        
        let window = NSWindow(contentRect: NSMakeRect(x, y, windowSize.width, windowSize.height), styleMask: [.closable, .titled], backing: .buffered, defer: false)
        window.backgroundColor = NSColor.bgColor()
        window.titlebarAppearsTransparent = true
        return window
    }()
    
    lazy var windowController: MainWindowController = {
        let mwc = MainWindowController(window: self.window)
        mwc.contentViewController = MainViewController()
        return mwc
    }()

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Insert code here to initialize your application
        self.windowController.showWindow(self)
    }

    func applicationWillTerminate(_ notification: Notification) {
        // Insert code here to tear down your application
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    func applicationDidBecomeActive(_ notification: Notification) {
        NotificationCenter.default.post(name: NSNotification.Name(rawValue: AppActiveNotification), object: nil)
    }
    
    func applicationDidResignActive(_ notification: Notification) {
        NotificationCenter.default.post(name: NSNotification.Name(rawValue: AppResignActiveNotification), object: nil)
    }
}

// MARK: Action
extension AppDelegate {
    
    @IBAction private func privacyAction(_ sender: AnyObject?) {
        let url = URL(string: AppPrivacyURL)
        NSWorkspace.shared.open(url!)
    }
    
    @IBAction private func termsAction(_ sender: AnyObject?) {
        let url = URL(string: AppTermsURL)
        NSWorkspace.shared.open(url!)
    }
}
