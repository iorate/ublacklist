//
//  MainViewController.swift
//  uBlacklist for Safari
//
//  Created by Selina on 29/1/2021.
//

import Cocoa
import SnapKit
import SafariServices.SFSafariApplication
import SafariServices.SFSafariExtensionManager

// Top Bar
private let AppIconWidth = 30

// Step StackView
private let StepStackViewSpacing: CGFloat = 20
private let StepStackViewMaxWidth = 570
private let StepItemViewHeight = 80
private let StepStackViewBottomInset = 20


// MARK: - View Layout
extension MainViewController {
    
    enum Step: Int, CaseIterable {
        case Enable = 1, Permission, Check
    }
    
    private func initView() {
        // Top Bar
        self.view.addSubview(self.topBar)
        self.topBar.snp.makeConstraints { (make) in
            make.left.top.right.equalToSuperview()
        }
        
        self.topBar.addSubview(self.iconImageView)
        self.iconImageView.snp.makeConstraints { (make) in
            make.left.equalTo(ItemInset)
            make.centerY.equalToSuperview()
            make.width.height.equalTo(AppIconWidth)
        }
        
        self.topBar.addSubview(self.nameLabel)
        self.nameLabel.snp.makeConstraints { (make) in
            make.left.equalTo(self.iconImageView.snp.right).offset(ItemInset)
            make.centerY.equalToSuperview()
        }
        
        self.topBar.addSubview(self.versionLabel)
        self.versionLabel.snp.makeConstraints { (make) in
            make.left.equalTo(self.nameLabel.snp.right).offset(5)
            make.centerY.equalToSuperview()
        }
        
        self.topBar.addSubview(self.infoButton)
        self.infoButton.snp.makeConstraints { (make) in
            make.right.equalToSuperview().offset(-ItemInset)
            make.centerY.equalToSuperview()
            make.width.height.equalTo(TopBarButtonWidth)
        }
        
        // Step View
        self.initStepView()
        self.view.addSubview(self.stepStackView)
        self.stepStackView.snp.makeConstraints { (make) in
            make.left.equalToSuperview().offset(ItemInset)
            make.right.equalToSuperview().offset(-ItemInset)
            make.top.equalTo(self.topBar.snp.bottom).offset(ItemInset)
            make.bottom.equalToSuperview().offset(-StepStackViewBottomInset)
            make.width.equalTo(StepStackViewMaxWidth)
        }
    }
    
    private func initStepView() {
        Step.allCases.forEach { (c) in
            let itemView = StepItemView()
            let numImage = NSImage(systemSymbolName: "\(c.rawValue).circle", accessibilityDescription: nil)
            itemView.numImageView.image = numImage
            
            var titleString, descString: String
            switch c {
            case .Enable:
                titleString = "step_enable_title".localized()
                descString = "step_enable_desc".localized()
                itemView.button.target = self
                itemView.button.action = #selector(openSafariExtensionPreferences)
            case .Permission:
                titleString = "step_permission_title".localized()
                descString = "step_permission_desc".localized()
                itemView.button.image = NSImage(systemSymbolName: "eye.circle", accessibilityDescription: nil)
                itemView.doneImageView.isHidden = true
                itemView.button.target = self
                itemView.button.action = #selector(openGrantPermissionGuide)
            case .Check:
                titleString = "step_check_title".localized()
                descString = "step_check_desc".localized()
                itemView.button.image = NSImage(systemSymbolName: "doc.text.magnifyingglass", accessibilityDescription: nil)
                itemView.doneImageView.isHidden = true
                itemView.button.target = self
                itemView.button.action = #selector(openCheckPage)
            }
            
            itemView.titleLabel.stringValue = titleString
            itemView.descLabel.stringValue = descString
            itemView.snp.makeConstraints { (make) in
                make.height.equalTo(StepItemViewHeight)
            }
            
            self.stepStackView.addArrangedSubview(itemView)
        }
    }
}

// MARK: - Action
extension MainViewController {
    
    private func initNotifications() {
        NotificationCenter.default.addObserver(self, selector: #selector(onActivate), name: NSNotification.Name(rawValue: AppActiveNotification), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(onResignActive), name: NSNotification.Name(rawValue: AppResignActiveNotification), object: nil)
    }
    
    @objc func onActivate() {
        self.stopTimer()
        self.refreshStepState()
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
        self.refreshStepState()
    }
    
    private func refreshStepState() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                return
            }

            DispatchQueue.main.async {
                self.reloadViews(enabled: state.isEnabled)
            }
        }
    }
    
    private func reloadViews(enabled: Bool) {
        Step.allCases.forEach { (c) in
            let itemView = self.itemView(forStep: c)
            
            switch c {
            case .Enable:
                itemView.button.isHidden = enabled
                itemView.doneImageView.isHidden = !enabled
            case .Permission:
                itemView.isHidden = !enabled
            case .Check:
                itemView.isHidden = !enabled
            }
        }
        
        let newSize = CGSize(width: self.view.bounds.size.width, height: self.view.fittingSize.height)
        self.view.window?.setContentSize(newSize)
    }
    
    private func itemView(forStep step: Step) -> StepItemView {
        let itemView = self.stepStackView.arrangedSubviews[step.rawValue - 1]
        return itemView as! StepItemView
    }
    
    @objc private func onInfoButtonClick() {

    }
    
    @objc private func openSafariExtensionPreferences() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: ExtensionBundleIdentifier) { error in
            guard error == nil else {
                return
            }
        }
    }
    
    @objc private func openGrantPermissionGuide() {
        let vc = PreviewViewController()
        let image = NSImage(named: "grant-permission-guide.gif")
        vc.previewImageView.image = image
        vc.titleLabel.stringValue = "permission_guide_title".localized()
        self.presentAsSheet(vc)
        
        if let url = URL(string: GoogleURL) {
            NSWorkspace.shared.open(inSafari: url)
        }
    }
    
    @objc private func openCheckPage() {
        if let url = URL(string: AppCheckURL) {
            NSWorkspace.shared.open(inSafari: url)
        }
    }
}

class MainViewController: NSViewController {
    
    lazy var topBar: TopBar = {
        let view = TopBar()
        return view
    }()
    
    lazy var iconImageView: NSImageView = {
        let image = NSImage(named: "AppIcon")!
        let imageView = NSImageView(image: image)
        return imageView
    }()
    
    lazy var nameLabel: NSTextField = {
        let label = NSTextField(labelWithString: AppName)
        label.font = NSFont.avenirHeavy(size: LargeFontSize)
        label.textColor = NSColor.appTextColor()
        return label
    }()
    
    lazy var versionLabel: NSTextField = {
        let versionString = "v\(Bundle.appVersion())"
        
        let label = NSTextField(labelWithString: versionString)
        label.font = NSFont.avenirLight(size: SmallFontSize)
        label.textColor = NSColor.appSecondaryTextColor()
        return label
    }()
    
    lazy var infoButton: NSButton = {
        let image = NSImage(systemSymbolName: "info.circle", accessibilityDescription: nil)
        
        let button = NSButton(image: image!, target: self, action: #selector(onInfoButtonClick))
        button.contentTintColor = NSColor.themeColor()
        button.isBordered = false
        button.imageScaling = .scaleProportionallyUpOrDown
        return button
    }()
    
    lazy var stepStackView: NSStackView = {
        let stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.spacing = StepStackViewSpacing
        stackView.setHuggingPriority(.defaultLow, for: .horizontal)
        return stackView
    }()
    
    var timer: Timer?
    
    override func loadView() {
        self.view = NSView()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.initView()
        self.initNotifications()
        self.reloadViews(enabled: false)
    }
}
