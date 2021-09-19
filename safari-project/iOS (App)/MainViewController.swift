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
private let GuideContentBottomInset: CGFloat = 40

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
        scrollView.delegate = self
        return scrollView
    }()
    
    private lazy var pageControl: UIPageControl = {
        let control = UIPageControl()
        control.isUserInteractionEnabled = false
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
            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom).offset(-GuideContentBottomInset)
        }
        
        guideContentView.addSubview(guideScrollView)
        guideScrollView.snp.makeConstraints { make in
            make.left.right.top.bottom.equalToSuperview()
        }
        
        view.addSubview(pageControl)
        pageControl.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(guideContentView.snp.bottom)
        }
    }
    
    private func initGuides() {
        var stepViews: [UIView] = []
        
        // first guide
        let firstGuideView = FirstGuideView.create()
        stepViews.append(firstGuideView)
        
        DispatchQueue.main.async {
            firstGuideView.startLogoAnimation()
        }
        
        // middle guides
        for index in 1...8 {
            var imgName = "ios-guide-step-\(index)"
            if UIDevice.isPad() {
                imgName = "ios-guide-step-pad-\(index)"
            }
            
            let title = "guide_title_step_\(index)".localized()
            let desc = "guide_desc_step_\(index)".localized()
            let stepView = GuideStepView(imageName: imgName, title: title, desc: desc)
            stepViews.append(stepView)
            
            // extra settings
            if index == 5 {
                stepView.button.isHidden = false
                stepView.button.setTitle("guide_button_step_5".localized(), for: .normal)
                stepView.button.addTarget(self, action: #selector(onOpenGoogleButtonClick), for: .touchUpInside)
                
                if UIDevice.isPad() {
                    stepView.descLabel.text = "guide_desc_step_pad_5".localized()
                }
            }
        }
        
        // last guide
        let lastGuideView = LastGuideView.create()
        lastGuideView.button.addTarget(self, action: #selector(onOpenHomepageButtonClick), for: .touchUpInside)
        stepViews.append(lastGuideView)
        
        // config
        for (index, stepView) in stepViews.enumerated() {
            guideScrollView.addSubview(stepView)
            stepView.snp.makeConstraints { make in
                make.width.equalTo(guideContentView)
                make.height.equalTo(guideContentView)
                make.top.bottom.equalToSuperview()
                
                if index == 0 {
                    make.left.equalToSuperview()
                } else if index == stepViews.count - 1 {
                    make.left.equalTo(stepViews[index - 1].snp.right)
                    make.right.equalToSuperview()
                } else {
                    make.left.equalTo(stepViews[index - 1].snp.right)
                }
            }
        }
                
        pageControl.numberOfPages = stepViews.count
    }
    
    @objc func onOpenGoogleButtonClick() {
        if let url = URL(string: GoogleURL) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
    }
    
    @objc func onOpenHomepageButtonClick() {
        if let url = URL(string: iorateHomePage) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
    }
}

extension MainViewController: UIScrollViewDelegate {
    
    func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
        refreshPageControl()
    }
    
    func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
        if decelerate == false {
            refreshPageControl()
        }
    }
    
    private func refreshPageControl() {
        let x = guideScrollView.contentOffset.x
        let width = guideScrollView.bounds.width
        let index = Int(x / width)
        pageControl.currentPage = index
    }
}
