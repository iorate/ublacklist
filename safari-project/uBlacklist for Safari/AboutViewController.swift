//
//  AboutViewController.swift
//  uBlacklist for Safari
//
//  Created by Selina on 8/1/2021.
//

import Cocoa

class AboutViewController: NSViewController {
    
    @IBOutlet weak var descView: NSTextView!
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        self.preferredContentSize = NSSize(width: 450, height: 300)
    }
    
    override init(nibName nibNameOrNil: NSNib.Name?, bundle nibBundleOrNil: Bundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
        self.preferredContentSize = NSSize(width: 450, height: 300)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.wantsLayer = true
        self.view.layer?.backgroundColor = NSColor(hex: "#161725").cgColor
        self.initViews()
    }
    
    private func initViews() {
        let font = NSFont(name: "Avenir-Light", size: 12) ?? NSFont.systemFont(ofSize: 12)
        let normalAttr = [NSAttributedString.Key.font: font, NSAttributedString.Key.foregroundColor: NSColor(hex: "#999999")] as [NSAttributedString.Key : Any]
        
        let prefixStr = NSAttributedString(string: "uBlacklist for Safari is made possible by the ", attributes: normalAttr)
        
        let ublacklistlink = URL(string: "https://iorate.github.io/ublacklist/")
        let ublacklistLinkStr = NSAttributedString(string: "uBlacklist", attributes: [NSAttributedString.Key.font: font, NSAttributedString.Key.link: ublacklistlink!])
        
        let otherStr = NSAttributedString(string: " open source project and other ", attributes: normalAttr)
        
        let otherLicencePath = Bundle.main.path(forResource: "other-licence", ofType: "html")
        let otherlink = URL(fileURLWithPath: otherLicencePath!)
        let otherLinkStr = NSAttributedString(string: "open source software", attributes: [NSAttributedString.Key.font: font, NSAttributedString.Key.link: otherlink])
        
        let endStr = NSAttributedString(string: ".", attributes: normalAttr)
        
        let finalStr = prefixStr.mutableCopy() as! NSMutableAttributedString
        finalStr.append(ublacklistLinkStr)
        finalStr.append(otherStr)
        finalStr.append(otherLinkStr)
        finalStr.append(endStr)
        
        self.descView.linkTextAttributes = [NSAttributedString.Key.font: font, NSAttributedString.Key.foregroundColor: NSColor.systemIndigo, NSAttributedString.Key.cursor: NSCursor.pointingHand]
        self.descView.textStorage?.setAttributedString(finalStr)
    }
    
    @IBAction func closeAction(_ sender: AnyObject?) {
        self.presentingViewController?.dismiss(self)
    }
    
    @IBAction func homepageAction(_ sender: AnyObject?) {
        let url = URL(string: AppHomePageURL)
        NSWorkspace.shared.open(url!)
    }
    
    @IBAction func feedbackAction(_ sender: AnyObject?) {
        let subject = "「uBlacklist for Safari v\(Bundle.appVersion())」Feedback: "
        let mailto = "mailto:\(AppFeedbackEmail)"
        
        guard var comp = URLComponents(string: mailto) else {
            return
        }
        
        comp.queryItems = [URLQueryItem(name: "subject", value: subject)]
        
        if let url = comp.url {
            NSWorkspace.shared.open(url)
        }
    }
    
    @IBAction func startedManualAction(_ sender: AnyObject?) {
        if let url = URL(string: StartManualURL) {
            NSWorkspace.shared.open(url)
        }
    }
    
    @IBAction func advancedManualAction(_ sender: AnyObject?) {
        if let url = URL(string: AdvanceManualURL) {
            NSWorkspace.shared.open(url)
        }
    }
}
