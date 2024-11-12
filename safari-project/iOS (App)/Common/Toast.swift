//
//  Toast.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Ava on 2024-11-12.
//

import UIKit
import SVProgressHUD

class Toast {
    class func setup() {
        SVProgressHUD.setDefaultStyle(.dark)
        SVProgressHUD.setDefaultMaskType(.clear)
    }
    
    class func showLoading(_ text: String? = nil, userInteraction: Bool = false) {
        SVProgressHUD.setDefaultMaskType(userInteraction ? .none : .clear)
        SVProgressHUD.show(withStatus: text)
    }
    
    class func showSuccess(_ text: String? = nil) {
        SVProgressHUD.setDefaultMaskType(.none)
        SVProgressHUD.showSuccess(withStatus: text)
    }
    
    class func showError(_ text: String? = nil) {
        SVProgressHUD.setDefaultMaskType(.none)
        SVProgressHUD.showError(withStatus: text)
    }
    
    class func showInfo(_ text: String? = nil) {
        SVProgressHUD.setDefaultMaskType(.none)
        SVProgressHUD.showInfo(withStatus: text)
    }
    
    class func hide() {
        SVProgressHUD.dismiss()
    }
}
