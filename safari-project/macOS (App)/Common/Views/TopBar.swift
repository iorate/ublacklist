//
//  TopBar.swift
//  uBlacklist for Safari
//
//  Created by Selina on 4/2/2021.
//

import Cocoa

class TopBar: NSView {
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        self.snp.makeConstraints { (make) in
            make.height.equalTo(TopBarHeight)
        }
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
}
