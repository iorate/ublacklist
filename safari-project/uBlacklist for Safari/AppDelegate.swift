//
//  AppDelegate.swift
//  uBlacklist for Safari
//
//  Created by Selina on 6/1/2021.
//

import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    lazy var windowController: MainWindowController = {
        let mwc = MainWindowController()
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
