//
//  AppExtensions.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Selina on 18/9/2021.
//

import Foundation
import UIKit

extension UIDevice {
    class func isPad() -> Bool {
        return UIDevice.current.userInterfaceIdiom == .pad
    }
}
