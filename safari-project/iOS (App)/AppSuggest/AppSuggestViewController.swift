//
//  AppSuggestViewController.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Selina on 25/5/2023.
//

import UIKit
import SnapKit

public extension AppSuggestViewController {
    struct ItemInfo {
        let icon: UIImage?
        let title: String
        let desc: String
        let btnTitle: String
        let url: String?
        let appId: String?
        let themeColor: UIColor
    }
}

public class AppSuggestViewController: UIViewController {
    public var backgroundColor: UIColor = .systemBackground
    public var themeColor: UIColor = .orange
    public var padding: CGFloat = 12
    public var infos: [ItemInfo] = []
    
    public lazy var naviBar: UIView = {
        let view = UIView()
        view.snp.makeConstraints { make in
            make.height.equalTo(50)
        }
        return view
    }()
    
    public lazy var doneBtn: UIButton = {
        let btn = UIButton(type: .system)
        btn.setTitle("Done", for: .normal)
        btn.titleLabel?.font = .systemFont(ofSize: 16, weight: .medium)
        btn.tintColor = themeColor
        
        btn.addTarget(self, action: #selector(onDoneBtnAction), for: .touchUpInside)
        return btn
    }()
    
    public lazy var naviTitleLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 17, weight: .medium)
        label.textColor = .label
        return label
    }()
    
    public lazy var headerContainerView: UIView = {
        let view = UIView()
        view.backgroundColor = .systemYellow.withAlphaComponent(0.4)
        return view
    }()
    
    public lazy var headerDescLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 15, weight: .light)
        label.textColor = .secondaryLabel
        label.numberOfLines = 0
        label.setContentHuggingPriority(.required, for: .vertical)
        label.setContentCompressionResistancePriority(.required, for: .vertical)
        return label
    }()
    
    public lazy var collectionViewLayout: UICollectionViewFlowLayout = {
        let layout = UICollectionViewFlowLayout()
        layout.scrollDirection = .horizontal
        layout.minimumLineSpacing = 0
        layout.minimumInteritemSpacing = 0
        return layout
    }()
    
    public lazy var collectionView: UICollectionView = {
        let view = UICollectionView(frame: .zero, collectionViewLayout: collectionViewLayout)
        view.backgroundColor = .clear
        view.contentInsetAdjustmentBehavior = .never
        view.dataSource = self
        view.delegate = self
        view.alwaysBounceHorizontal = true
        view.isPagingEnabled = true
        view.showsHorizontalScrollIndicator = false
        view.register(AppSuggestViewCell.self, forCellWithReuseIdentifier: "AppSuggestViewCell")
        return view
    }()
    
    public lazy var pageControl: UIPageControl = {
        let view = UIPageControl()
        view.isUserInteractionEnabled = false
        return view
    }()
    
    public override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
        modalPresentationStyle = .formSheet
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    public override func viewDidLoad() {
        super.viewDidLoad()
        initViews()
    }
    
    private func initViews() {
        view.backgroundColor = backgroundColor
        
        view.addSubview(naviBar)
        naviBar.snp.makeConstraints { make in
            make.left.right.top.equalToSuperview()
        }
        
        naviBar.addSubview(doneBtn)
        doneBtn.snp.makeConstraints { make in
            make.left.equalTo(padding)
            make.centerY.equalToSuperview()
        }
        
        naviBar.addSubview(naviTitleLabel)
        naviTitleLabel.snp.makeConstraints { make in
            make.center.equalToSuperview()
        }
        
        view.addSubview(headerContainerView)
        headerContainerView.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.top.equalTo(naviBar.snp.bottom)
        }
        
        headerContainerView.addSubview(headerDescLabel)
        headerDescLabel.snp.makeConstraints { make in
            make.left.equalTo(20)
            make.right.equalTo(-20)
            make.top.equalTo(padding)
            make.bottom.equalTo(-padding)
        }
        
        view.addSubview(collectionView)
        collectionView.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom).offset(-40)
            make.top.equalTo(headerContainerView.snp.bottom).offset(padding)
        }
        
        view.addSubview(pageControl)
        pageControl.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom).offset(-20)
        }
        
        pageControl.numberOfPages = infos.count
    }
}

extension AppSuggestViewController {
    @objc private func onDoneBtnAction() {
        dismiss(animated: true)
    }
}

extension AppSuggestViewController: UICollectionViewDelegateFlowLayout, UICollectionViewDataSource {
    public func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return infos.count
    }
    
    public func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let info = infos[indexPath.item]
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "AppSuggestViewCell", for: indexPath) as! AppSuggestViewCell
        cell.config(info, controller: self)
        return cell
    }
    
    public func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return collectionView.frame.size
    }
    
    public func scrollViewDidEndDragging(_ scrollView: UIScrollView, willDecelerate decelerate: Bool) {
        if !decelerate {
            refreshPageControl()
        }
    }
    
    public func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
        refreshPageControl()
    }
    
    private func refreshPageControl() {
        let offsetX = collectionView.contentOffset.x
        let length = collectionView.bounds.width
        let index = Int(offsetX / length)
        pageControl.currentPage = index
    }
}
