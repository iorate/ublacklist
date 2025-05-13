//
//  InfoViewController.swift
//  uBlacklist for Safari
//
//  Created by Selina on 5/2/2021.
//

import Cocoa

// MARK: - View Layout
extension InfoViewController {
    
    enum Row: Int, CaseIterable {
        case Manual, Homepage, Feedback
    }
    
    private func setupViews() {
        self.view.wantsLayer = true
        self.view.layer?.backgroundColor = NSColor.bgColor().cgColor
        
        // Top Bar
        self.view.addSubview(self.topBar)
        self.topBar.snp.makeConstraints { (make) in
            make.left.top.right.equalToSuperview()
        }
        
        self.topBar.addSubview(self.closeButton)
        self.closeButton.snp.makeConstraints { (make) in
            make.left.equalTo(ItemInset)
            make.centerY.equalToSuperview()
            make.width.height.equalTo(TopBarButtonWidth)
        }
        
        self.topBar.addSubview(self.titleLabel)
        self.titleLabel.snp.makeConstraints { (make) in
            make.center.equalToSuperview()
        }
        
        self.view.addSubview(self.descView)
        self.descView.snp.makeConstraints { (make) in
            make.left.equalTo(ItemInset)
            make.right.equalTo(-ItemInset)
            make.bottom.equalTo(-ItemInset)
            make.height.equalTo(40)
        }
        
        self.view.addSubview(self.tableStackView)
        self.tableStackView.snp.makeConstraints { (make) in
            make.left.equalTo(ItemInset)
            make.right.equalTo(-ItemInset)
            make.top.equalTo(self.topBar.snp.bottom).offset(ItemInset)
            make.bottom.equalTo(self.descView.snp.top).offset(-ItemInset * 2)
        }
        
        self.view.snp.makeConstraints { (make) in
            make.width.equalTo(450)
        }
        
        self.initTableCells()
    }
    
    private func createLinkButton(_ title: String, target: Any?, action: Selector?) -> NSButton {
        let button = NSButton(title: title, target: target, action: action)
        button.font = NSFont.avenirLight(size: SmallFontSize)
        button.isBordered = false
        button.contentTintColor = NSColor.themeColor()
        return button
    }
    
    private func initTableCells() {
        Row.allCases.forEach { (c) in
            let cell = TableViewCell()
            
            switch c {
            case .Manual:
                cell.titleLabel.stringValue = "manual_title".localized()
                let basicButton = self.createLinkButton("basic_btn_title".localized(), target: self, action: #selector(onBasicManual))
                let advancedButton = self.createLinkButton("advanced_btn_title".localized(), target: self, action: #selector(onAdvancedManual))
                cell.rightStackView.addArrangedSubview(basicButton)
                cell.rightStackView.addArrangedSubview(advancedButton)
            case .Homepage:
                cell.titleLabel.stringValue = "homepage_title".localized()
                let homepageButton = self.createLinkButton("uBlacklist for Safari", target: self, action: #selector(onHomepage))
                cell.rightStackView.addArrangedSubview(homepageButton)
            case .Feedback:
                cell.titleLabel.stringValue = "feedback_title".localized()
                let feedbackButton = self.createLinkButton(AppFeedbackEmail, target: self, action: #selector(onFeedback))
                cell.rightStackView.addArrangedSubview(feedbackButton)
            }
            
            self.tableStackView.addArrangedSubview(cell)
        }
    }
}

// MARK: - Action
extension InfoViewController {
    
    @objc private func onClose() {
        self.presentingViewController?.dismiss(self)
    }
    
    @objc private func onBasicManual() {
        if let url = URL(string: StartManualURL) {
            NSWorkspace.shared.open(url)
        }
    }
    
    @objc private func onAdvancedManual() {
        if let url = URL(string: AdvancedManualURL) {
            NSWorkspace.shared.open(url)
        }
    }
    
    @objc private func onHomepage() {
        let url = URL(string: AppHomePageURL)
        NSWorkspace.shared.open(url!)
    }
    
    @objc private func onFeedback() {
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
}

class InfoViewController: NSViewController {
    
    private let TableStackViewSpacing: CGFloat = 8
    private let descFont = NSFont(name: "Avenir-Light", size: SmallFontSize) ?? NSFont.systemFont(ofSize: SmallFontSize)
    
    lazy var topBar: TopBar = {
        let bar = TopBar()
        return bar
    }()
    
    lazy var titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "support_title".localized())
        label.textColor = NSColor.appTextColor()
        label.font = NSFont.avenirMedium(size: MediumFontSize)
        return label
    }()
    
    lazy var closeButton: NSButton = {
        let image = NSImage(named: "btn-close")?.tint(color: .themeColor())
        let button = NSButton(image: image!, target: self, action: #selector(onClose))
        button.isBordered = false
        button.imageScaling = .scaleNone
        return button
    }()
    
    lazy var tableStackView: NSStackView = {
        let stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.spacing = TableStackViewSpacing
        stackView.setHuggingPriority(.defaultLow, for: .horizontal)
        return stackView
    }()
    
    lazy var descView: NSTextView = {
        let textView = NSTextView()
        textView.isEditable = false
        textView.backgroundColor = .clear
        textView.linkTextAttributes = self.descLinkAttributes()
        textView.textStorage?.setAttributedString(self.descText())
        return textView
    }()
    
    private func descText() -> NSAttributedString {
        let prefixStr = NSAttributedString(string: "uBlacklist for Safari is made possible by the ", attributes: self.descNormalAttributes())
        
        let ublacklistlink = URL(string: iorateHomePage)
        let ublacklistLinkStr = NSAttributedString(string: "uBlacklist", attributes: [NSAttributedString.Key.font: self.descFont, NSAttributedString.Key.link: ublacklistlink!])
        
        let otherStr = NSAttributedString(string: " open source project and other ", attributes: self.descNormalAttributes())
        
        let otherLicencePath = Bundle.main.path(forResource: "other-licence", ofType: "html")
        let otherlink = URL(fileURLWithPath: otherLicencePath!)
        let otherLinkStr = NSAttributedString(string: "open source software", attributes: [NSAttributedString.Key.font: self.descFont, NSAttributedString.Key.link: otherlink])
        
        let endStr = NSAttributedString(string: ".", attributes: self.descNormalAttributes())
        
        let finalStr = prefixStr.mutableCopy() as! NSMutableAttributedString
        finalStr.append(ublacklistLinkStr)
        finalStr.append(otherStr)
        finalStr.append(otherLinkStr)
        finalStr.append(endStr)
        
        return finalStr
    }
    
    private func descNormalAttributes() -> [NSAttributedString.Key : Any] {
        let normalAttr: [NSAttributedString.Key : Any] = [.font: descFont, .foregroundColor: NSColor(hex: "#999999")]
        return normalAttr
    }
    
    private func descLinkAttributes() -> [NSAttributedString.Key : Any] {
        let linkAttr: [NSAttributedString.Key : Any] = [.font: descFont, .foregroundColor: NSColor.themeColor(), .cursor: NSCursor.pointingHand]
        return linkAttr
    }
    
    override func loadView() {
        self.view = NSView()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.setupViews()
    }
}
