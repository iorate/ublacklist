//
//  InfoViewController.swift
//  uBlacklist for Safari
//
//  Created by Selina on 5/2/2021.
//

import Cocoa

class InfoViewController: NSViewController {
    private let TableStackViewSpacing: CGFloat = 5
    
    lazy var topBar: TopBar = {
        let bar = TopBar()
        return bar
    }()
    
    lazy var titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "")
        label.textColor = NSColor.appTextColor()
        label.font = NSFont.avenirMedium(size: MediumFontSize)
        return label
    }()
    
    lazy var tableStackView: NSStackView = {
        let stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.spacing = TableStackViewSpacing
        return stackView
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.setupViews()
    }
    
    private func setupViews() {
        self.view.addSubview(self.topBar)
        self.topBar.snp.makeConstraints { (make) in
            
        }
    }
}
