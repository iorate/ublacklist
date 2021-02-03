//
//  ViewController.swift
//  uBlacklist for Safari
//
//  Created by Selina on 6/1/2021.
//

import Cocoa
import SafariServices.SFSafariApplication
import SafariServices.SFSafariExtensionManager

let appName = "uBlacklist for Safari"
let extensionBundleIdentifier = "com.honeyluka.uBlacklist-for-Safari.Extension"

let openSettingsCmd = "native-open-options"

class ViewController: NSViewController {
    
    @IBOutlet weak var versionLabel: NSTextField!
    
    @IBOutlet weak var step1Container: NSView!
    @IBOutlet weak var openSafariPrefButton: NSButton!
    @IBOutlet weak var extensionEnabledImageView: NSImageView!
    
    @IBOutlet weak var step2Container: NSView!
    @IBOutlet weak var openuBlacklistSettingButton: NSButton!
    
    @IBOutlet weak var step3Container: NSView!
    
    var timer: Timer?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.initView()
        self.initNotifications()
        self.refreshExtensionState()
    }
    
    private func initView() {
        self.step1Container.isHidden = true
        self.step2Container.isHidden = true
        self.step3Container.isHidden = true
        
        self.step1Container.wantsLayer = true
        self.step1Container.layer?.masksToBounds = true
        self.step1Container.layer?.backgroundColor = NSColor(hex: "#21212e").cgColor
        self.step1Container.layer?.cornerRadius = 12
        
        self.openSafariPrefButton.wantsLayer = true
        self.openSafariPrefButton.layer?.masksToBounds = true
        self.openSafariPrefButton.layer?.backgroundColor = NSColor.systemIndigo.cgColor
        self.openSafariPrefButton.layer?.cornerRadius = 20
        
        self.step2Container.wantsLayer = true
        self.step2Container.layer?.masksToBounds = true
        self.step2Container.layer?.backgroundColor = NSColor(hex: "#21212e").cgColor
        self.step2Container.layer?.cornerRadius = 12
        
        self.openuBlacklistSettingButton.wantsLayer = true
        self.openuBlacklistSettingButton.layer?.masksToBounds = true
        self.openuBlacklistSettingButton.layer?.backgroundColor = NSColor.systemIndigo.cgColor
        self.openuBlacklistSettingButton.layer?.cornerRadius = 20
        
        self.step3Container.wantsLayer = true
        self.step3Container.layer?.masksToBounds = true
        self.step3Container.layer?.backgroundColor = NSColor(hex: "#21212e").cgColor
        self.step3Container.layer?.cornerRadius = 12
        
        self.versionLabel.stringValue = "v\(Bundle.appVersion())"
    }
    
    private func initNotifications() {
        NotificationCenter.default.addObserver(self, selector: #selector(onActivate), name: NSNotification.Name(rawValue: AppActiveNotification), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(onResignActive), name: NSNotification.Name(rawValue: AppResignActiveNotification), object: nil)
    }
    
    @objc func onActivate() {
        self.stopTimer()
        self.refreshExtensionState()
    }
    
    @objc func onResignActive() {
        self.startTimer()
    }
    
    private func startTimer() {
        self.stopTimer()
        self.timer = Timer.scheduledTimer(timeInterval: 1, target: self, selector: #selector(onTimer), userInfo: nil, repeats: true)
    }
    
    private func stopTimer() {
        if let t = self.timer {
            t.invalidate()
            self.timer = nil
        }
    }
    
    @objc func onTimer() {
        self.refreshExtensionState()
    }
    
    private func refreshExtensionState() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                self.reloadViews(enabled: state.isEnabled)
            }
        }
    }
    
    private func reloadViews(enabled: Bool) {
        if (enabled) {
            self.step1Container.animator().isHidden = false
            self.openSafariPrefButton.animator().isHidden = true
            self.extensionEnabledImageView.animator().isHidden = false
            
            self.step2Container.animator().isHidden = false
            self.step3Container.animator().isHidden = false
        } else {
            self.step1Container.animator().isHidden = false
            self.openSafariPrefButton.animator().isHidden = false
            self.extensionEnabledImageView.animator().isHidden = true
            
            self.step2Container.animator().isHidden = true
            self.step3Container.animator().isHidden = true
        }
    }
    
    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }
        }
    }

    @IBAction func openSettings(_ sender: AnyObject?) {
        SFSafariApplication.dispatchMessage(withName: openSettingsCmd, toExtensionWithIdentifier: extensionBundleIdentifier, userInfo: nil) { error in
            debugPrint("message attempted. error info: \(String.init(describing: error))")
        }
    }
}
