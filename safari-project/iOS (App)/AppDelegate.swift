//
//  AppDelegate.swift
//  iOS (App)
//
//  Created by Selina on 16/9/2021.
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.backgroundColor = .black
        
        let vc = MainViewController()
        window?.rootViewController = vc
        window?.makeKeyAndVisible()
        
        return true
    }
}
