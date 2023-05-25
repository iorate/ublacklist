//
//  AppSuggestViewCell.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Selina on 25/5/2023.
//

import UIKit
import SnapKit
import StoreKit

private let CornerRadius: CGFloat = 16
private let Padding: CGFloat = 16

class AppSuggestViewCell: UICollectionViewCell {
    public lazy var iconImageView: UIImageView = {
        let view = UIImageView()
        view.clipsToBounds = true
        view.layer.cornerRadius = CornerRadius
        return view
    }()
    
    public lazy var titleLabel: UILabel = {
        let view = UILabel()
        view.font = .systemFont(ofSize: 17, weight: .medium)
        view.textColor = .label
        view.textAlignment = .center
        view.numberOfLines = 0
        return view
    }()
    
    public lazy var descLabel: UILabel = {
        let view = UILabel()
        view.font = .systemFont(ofSize: 15, weight: .light)
        view.textColor = .secondaryLabel
        view.numberOfLines = 0
        view.textAlignment = .center
        return view
    }()
    
    public lazy var actionBtn: UIButton = {
        let btn = UIButton(type: .custom)
        btn.setTitleColor(.white, for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 17, weight: .medium)
        btn.clipsToBounds = true
        btn.layer.cornerRadius = CornerRadius
        
        btn.snp.makeConstraints { make in
            make.height.equalTo(50)
        }
        
        btn.addTarget(self, action: #selector(onActionBtnAction), for: .touchUpInside)
        
        return btn
    }()
    
    private var item: AppSuggestViewController.ItemInfo?
    private weak var refController: UIViewController?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setup() {
        contentView.backgroundColor = .clear
        
        contentView.addSubview(iconImageView)
        iconImageView.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(Padding)
            make.width.height.equalTo(80)
        }
        
        contentView.addSubview(titleLabel)
        titleLabel.snp.makeConstraints { make in
            make.left.equalTo(Padding)
            make.right.equalTo(-Padding)
            make.top.equalTo(iconImageView.snp.bottom).offset(Padding)
        }
        
        contentView.addSubview(descLabel)
        descLabel.snp.makeConstraints { make in
            make.left.equalTo(Padding)
            make.right.equalTo(-Padding)
            make.top.equalTo(titleLabel.snp.bottom).offset(Padding * 3)
        }
        
        contentView.addSubview(actionBtn)
        actionBtn.snp.makeConstraints { make in
            make.left.equalTo(Padding)
            make.right.equalTo(-Padding)
            make.bottom.equalTo(-Padding)
        }
    }
    
    func config(_ info: AppSuggestViewController.ItemInfo, controller: UIViewController) {
        self.item = info
        self.refController = controller
        
        iconImageView.image = info.icon
        titleLabel.text = info.title
        
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = 10
        let descAttr: [NSAttributedString.Key: Any] = [.font: descLabel.font!, .foregroundColor: descLabel.textColor!, .paragraphStyle: paragraphStyle]
        descLabel.attributedText = NSAttributedString(string: info.desc, attributes: descAttr)
        
        actionBtn.setBackgroundImage(imageByColor(info.themeColor), for: .normal)
        actionBtn.setTitle(info.btnTitle, for: .normal)
    }
    
    @objc private func onActionBtnAction() {
        if let url = item?.url, let urlObj = URL(string: url), UIApplication.shared.canOpenURL(urlObj) {
            UIApplication.shared.open(urlObj)
            return
        }
        
        if let appId = item?.appId {
            let storeVC = SKStoreProductViewController()
            let parameters = [SKStoreProductParameterProductIdentifier: appId]
            storeVC.loadProduct(withParameters: parameters)
            refController?.present(storeVC, animated: true)
        }
    }
}

extension AppSuggestViewCell {
    func imageByColor(_ color: UIColor) -> UIImage? {
        let size = CGSize(width: 1, height: 1)
        let rect = CGRect(origin: .zero, size: size)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        let context = UIGraphicsGetCurrentContext()
        context?.setFillColor(color.cgColor)
        context?.fill([rect])
        let img = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return img
    }
}
