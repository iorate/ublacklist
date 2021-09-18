//
//  GuideStepView.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Selina on 17/9/2021.
//

import Foundation
import UIKit
import SnapKit

private let GuideContentPercentSmall: CGFloat = 0.3
private let GuideContentPercentLarge: CGFloat = 0.36

class GuideStepView: UIView {
    
    lazy var guideImageView: UIImageView = {
        let view = UIImageView()
        view.clipsToBounds = true
        view.contentMode = .scaleAspectFit
        view.backgroundColor = .secondaryBgColor()
        return view
    }()
    
    lazy var bottomContentView: UIView = {
        let view = UIView()
        view.backgroundColor = .clear
        return view
    }()
    
    lazy var titleLabel: UILabel = {
        let label = UILabel()
        label.textColor = .white
        label.font = Font.avenirHeavy(size: LargeFontSize)
        label.numberOfLines = 0
        label.snp.contentHuggingVerticalPriority = 1000
        label.snp.contentCompressionResistanceVerticalPriority = 1000
        return label
    }()
    
    lazy var descLabel: UILabel = {
        let label = UILabel()
        label.textColor = .white
        label.font = Font.avenirMedium(size: MediumFontSize)
        label.numberOfLines = 0
        label.adjustsFontSizeToFitWidth = true
        label.minimumScaleFactor = 0.5
        return label
    }()
    
    lazy var button: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitleColor(UIColor.themeColor(), for: .normal)
        btn.titleLabel?.font = Font.avenirMedium(size: MediumFontSize)
        return btn
    }()
    
    init(imageName: String = "", title: String = "", desc: String = "") {
        super.init(frame: .zero)
        backgroundColor = .clear
        
        addSubview(guideImageView)
        guideImageView.snp.makeConstraints { make in
            make.left.top.right.equalToSuperview()
        }
        
        addSubview(bottomContentView)
        bottomContentView.snp.makeConstraints { make in
            make.left.right.bottom.equalToSuperview()
            make.top.equalTo(guideImageView.snp.bottom)
            make.height.equalToSuperview().multipliedBy(GuideContentPercentLarge)
        }
        
        bottomContentView.addSubview(titleLabel)
        titleLabel.snp.makeConstraints { make in
            make.left.top.equalTo(ItemInset)
            make.right.equalTo(-ItemInset)
        }
        
        bottomContentView.addSubview(descLabel)
        descLabel.snp.makeConstraints { make in
            make.left.equalTo(ItemInset)
            make.right.equalTo(-ItemInset)
            make.top.equalTo(titleLabel.snp.bottom).offset(ItemInset/2)
            make.bottom.lessThanOrEqualTo(0)
        }
        
        bottomContentView.addSubview(button)
        button.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.bottom.equalToSuperview().offset(-ItemInset)
        }
        
        button.isHidden = true
        
        if imageName.count > 0 {
            guideImageView.image = UIImage(named: imageName)
        }
        titleLabel.text = title
        descLabel.text = desc
        
        refreshSizeClass()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        
        guard let previous = previousTraitCollection else { return }
        if traitCollection.horizontalSizeClass != previous.horizontalSizeClass {
            refreshSizeClass()
        }
    }
    
    func refreshSizeClass() {
        titleLabel.textAlignment = traitCollection.horizontalSizeClass == .regular ? .center : .left
        descLabel.textAlignment = traitCollection.horizontalSizeClass == .regular ? .center : .left
        
        bottomContentView.snp.remakeConstraints { make in
            var percent = GuideContentPercentLarge
            if UIDevice.isPad(), traitCollection.horizontalSizeClass == .regular {
                percent = GuideContentPercentSmall
            }
            
            make.height.equalToSuperview().multipliedBy(percent)
            make.left.right.bottom.equalToSuperview()
            make.top.equalTo(guideImageView.snp.bottom)
        }
    }
}

class FirstGuideView: GuideStepView {
    
    lazy var bgLayer: CAGradientLayer = {
        let layer = CAGradientLayer()
        layer.startPoint = .zero
        layer.endPoint = CGPoint(x: 1, y: 1)
        layer.colors = [UIColor(hex: "#8f68cf").cgColor, UIColor(hex: "#155799").cgColor]
        return layer
    }()
    
    lazy var logoImageView: UIImageView = {
        let logo = UIImage(named: "icon-app")
        let imageView = UIImageView(image: logo)
        imageView.clipsToBounds = true
        imageView.layer.cornerRadius = 20
        return imageView
    }()
    
    class func create() -> FirstGuideView {
        let view = FirstGuideView(imageName: "", title: "guide_title_step_0".localized(), desc: "guide_desc_step_0".localized())
        return view
    }
    
    override init(imageName: String = "", title: String = "", desc: String = "") {
        super.init(imageName: imageName, title: title, desc: desc)
        guideImageView.isHidden = true
        
        layer.addSublayer(bgLayer)
        
        addSubview(logoImageView)
        logoImageView.snp.makeConstraints { make in
            make.center.equalTo(guideImageView)
            make.height.equalTo(logoImageView.snp.width)
            make.width.equalTo(guideImageView).multipliedBy(0.35).priority(999)
            make.width.lessThanOrEqualTo(250)
        }
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        bgLayer.frame = guideImageView.bounds
    }
    
    private func prepareForAnimation() {
        logoImageView.alpha = 0
        logoImageView.transform = CGAffineTransform(scaleX: 2, y: 2)
    }
    
    func startLogoAnimation() {
        prepareForAnimation()
        UIView.animate(withDuration: 1.5, delay: 0.5, options: [.curveEaseInOut]) {
            self.logoImageView.alpha = 1
            self.logoImageView.transform = .identity
        } completion: { complete in
            
        }

    }
}

class LastGuideView: FirstGuideView {
    
    override init(imageName: String = "", title: String = "", desc: String = "") {
        super.init(imageName: imageName, title: title, desc: desc)
        
        button.isHidden = false
        button.setTitle("guide_button_step_done".localized(), for: .normal)
    }
    
    override class func create() -> LastGuideView {
        let view = LastGuideView(imageName: "", title: "guide_title_step_done".localized(), desc: "guide_desc_step_done".localized())
        return view
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
