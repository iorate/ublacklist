//
//  TableViewCell.swift
//  uBlacklist for Safari
//
//  Created by Selina on 5/2/2021.
//

import Cocoa

class TableViewCell: NSView {
    
    private let TableViewCellCornerRadius: CGFloat = 12
    private let TableViewCellHeight = 50
    
    lazy var titleLabel: NSTextField = {
        let label = NSTextField(labelWithString: "")
        label.textColor = NSColor.appTextColor()
        label.font = NSFont.avenirMedium(size: MediumFontSize)
        return label
    }()
    
    lazy var rightStackView: NSStackView = {
        let stackView = NSStackView()
        stackView.orientation = .horizontal
        return stackView
    }()
    
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        self.setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
    
    private func setupViews() {
        self.wantsLayer = true
        self.layer?.backgroundColor = NSColor.secondaryBgColor().cgColor
        self.layer?.cornerRadius = TableViewCellCornerRadius
        
        self.addSubview(self.titleLabel)
        self.titleLabel.snp.makeConstraints { (make) in
            make.left.equalTo(ItemInset)
            make.centerY.equalToSuperview()
        }
        
        self.addSubview(self.rightStackView)
        self.rightStackView.snp.makeConstraints { (make) in
            make.right.equalTo(-ItemInset)
            make.centerY.equalToSuperview()
        }
        
        self.snp.makeConstraints { (make) in
            make.height.equalTo(TableViewCellHeight)
        }
    }
}
