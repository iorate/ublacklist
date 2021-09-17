//
//  MainViewController.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Selina on 17/9/2021.
//

import UIKit
import SnapKit

private let TopBarHeight: CGFloat = 60
private let IconSize: CGFloat = 38

class MainViewController: UIViewController {
    
    private lazy var topBar: UIView = {
        let view = UIView()
        view.backgroundColor = .clear
        view.snp.makeConstraints { make in
            make.height.equalTo(TopBarHeight)
        }
        return view
    }()
    
    private lazy var iconImageView: UIImageView = {
        let img = UIImage(named: "AppIcon60x60")
        let imageView = UIImageView(image: img)
        imageView.snp.makeConstraints { make in
            make.size.equalTo(IconSize)
        }
        imageView.clipsToBounds = true
        imageView.layer.cornerRadius = 8
        
        return imageView
    }()
    
    private lazy var titleLabel: UILabel = {
        let label = UILabel()
        label.textColor = .white
        label.font = Font.avenirHeavy(size: LargeFontSize)
        label.text = "uBlacklist"
        return label
    }()
    
    private lazy var versionLabel: UILabel = {
        let versionString = "v\(Bundle.appVersion())"
        
        let label = UILabel()
        label.font = Font.avenirLight(size: SmallFontSize)
        label.textColor = Color.appSecondaryTextColor()
        label.text = versionString
        return label
    }()
    
    private lazy var guideContentView: UIView = {
        let view = UIView()
        view.backgroundColor = .clear
        return view
    }()
    
    private lazy var guideScrollView: UIScrollView = {
        let scrollView = UIScrollView()
        scrollView.backgroundColor = .clear
        scrollView.showsHorizontalScrollIndicator = false
        scrollView.isPagingEnabled = true
        return scrollView
    }()
    
    private lazy var pageControl: UIPageControl = {
        let control = UIPageControl()
        return control
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initViews()
        initGuides()
    }
    
    private func initViews() {
        view.backgroundColor = Color.bgColor()
        
        view.addSubview(topBar)
        topBar.snp.makeConstraints { make in
            make.top.equalTo(view.safeAreaLayoutGuide.snp.top)
            make.centerX.equalToSuperview()
        }
        
        topBar.addSubview(iconImageView)
        iconImageView.snp.makeConstraints { make in
            make.left.centerY.equalToSuperview()
        }
        
        topBar.addSubview(titleLabel)
        titleLabel.snp.makeConstraints { make in
            make.left.equalTo(iconImageView.snp.right).offset(ItemInset)
            make.centerY.equalTo(iconImageView)
        }
        
        topBar.addSubview(versionLabel)
        versionLabel.snp.makeConstraints { make in
            make.left.equalTo(titleLabel.snp.right).offset(5)
            make.centerY.equalTo(titleLabel)
            make.right.equalToSuperview()
        }
        
        view.addSubview(guideContentView)
        guideContentView.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.top.equalTo(topBar.snp.bottom)
            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom)
        }
        
        guideContentView.addSubview(guideScrollView)
        guideScrollView.snp.makeConstraints { make in
            make.left.right.top.bottom.equalToSuperview()
        }
        
        view.addSubview(pageControl)
        pageControl.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.bottom.equalTo(guideContentView.snp.bottom)
        }
    }
    
    private func initGuides() {
        var stepViews: [GuideStepView] = []
        
        for index in 1...8 {
            let imgName = "ios-guide-step-\(index)"
            let title = "guide_title_step_\(index)".localized()
            let desc = "guide_desc_step_\(index)".localized()
            let stepView = GuideStepView(imageName: imgName, title: title, desc: desc)
            
            guideScrollView.addSubview(stepView)
            stepView.snp.makeConstraints { make in
                make.width.equalTo(guideContentView)
                make.height.equalTo(guideContentView)
                make.top.bottom.equalToSuperview()
                
                if stepViews.count != 0 {
                    let previousView = stepViews.last!
                    make.left.equalTo(previousView.snp.right)
                } else {
                    // first
                    make.left.equalToSuperview()
                }
            }
            
            stepViews.append(stepView)
        }
        
        stepViews.last!.snp.makeConstraints { make in
            make.right.equalToSuperview()
        }
        
        pageControl.numberOfPages = stepViews.count
    }
}
