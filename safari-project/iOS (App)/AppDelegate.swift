//
//  AppDelegate.swift
//  iOS (App)
//
//  Created by Selina on 16/9/2021.
//

import UIKit
import RevenueCat
import SVProgressHUD

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        setup()
        
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.backgroundColor = .black
        
        let vc = MainViewController()
        window?.rootViewController = vc
        window?.makeKeyAndVisible()
        
        
        
        return true
    }
    
    private func setup() {
        Purchases.logLevel = .debug
        Purchases.configure(withAPIKey: "appl_zwafgAwCGPMseUkwglZJakzTFRS")
        
        SVProgressHUD.setDefaultStyle(.dark)
        SVProgressHUD.setDefaultMaskType(.clear)
    }
}
