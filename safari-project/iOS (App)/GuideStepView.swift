//
//  GuideStepView.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Selina on 17/9/2021.
//

import Foundation
import UIKit
import SnapKit

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
        return btn
    }()
    
    init(imageName: String, title: String = "", desc: String = "") {
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
            make.height.equalToSuperview().multipliedBy(0.3)
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
        
        guideImageView.image = UIImage(named: imageName)
        titleLabel.text = title
        descLabel.text = desc
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
