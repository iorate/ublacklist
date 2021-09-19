//
//  PreviewViewController.swift
//  uBlacklist for Safari
//
//  Created by Selina on 4/2/2021.
//

import Cocoa

private let PreviewMaxWidth = 450

class PreviewViewController: NSViewController {
    
    lazy var topBar: TopBar = {
        let view = TopBar()
        return view
    }()
    
    lazy var closeButton: NSButton = {
        let image = NSImage(named: "btn-close")?.tint(color: .themeColor())
        let button = NSButton(image: image!, target: self, action: #selector(onClose))
        button.isBordered = false
        button.imageScaling = .scaleNone
        return button
    }()
    
    lazy var titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "")
        label.font = NSFont.avenirMedium(size: MediumFontSize)
        label.textColor = NSColor.appTextColor()
        return label
    }()
    
    lazy var previewImageView: NSImageView = {
        let imageView = NSImageView()
        imageView.animates = true
        return imageView
    }()
    
    override func loadView() {
        self.view = NSView()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.setupViews()
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
        
        // Content
        self.view.addSubview(self.previewImageView)
        self.previewImageView.snp.makeConstraints { (make) in
            make.left.equalTo(ItemInset)
            make.top.equalTo(self.topBar.snp.bottom)
            make.right.equalTo(-ItemInset)
            make.bottom.equalTo(-ItemInset)
        }
        
        self.view.snp.makeConstraints { (make) in
            make.width.equalTo(PreviewMaxWidth)
        }
    }
    
    @objc private func onClose() {
        self.presentingViewController?.dismiss(self)
    }
}
