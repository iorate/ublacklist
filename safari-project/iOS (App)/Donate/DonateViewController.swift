//
//  DonateViewController.swift
//  uBlacklist for Safari (iOS)
//
//  Created by Ava on 2024-11-10.
//

import UIKit
import RevenueCat
import SVProgressHUD

class DonateViewController: UIViewController {
    private var list: [StoreProduct] = []
    
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
        btn.tintColor = Color.themeColor()
        
        btn.addTarget(self, action: #selector(onDoneBtnAction), for: .touchUpInside)
        return btn
    }()
    
    public lazy var naviTitleLabel: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 17, weight: .medium)
        label.textColor = .label
        label.text = "donation".localized()
        return label
    }()
    
    private lazy var tableView: UITableView = {
        let view = UITableView(frame: .zero, style: .grouped)
        view.delegate = self
        view.dataSource = self
        view.backgroundColor = .clear
        return view
    }()
    
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
        modalPresentationStyle = .formSheet
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
#if DEBUG
        UserDefaults.standard.removeObject(forKey: DonatedKey)
#endif
        
        initViews()
        fetchData()
    }
    
    private func fetchData() {
        DispatchQueue.main.async {
            SVProgressHUD.show()
        }
        let donateArr = ["com.honeyluka.uBlacklist_for_Safari.product.donate_1", "com.honeyluka.uBlacklist_for_Safari.product.donate_2", "com.honeyluka.uBlacklist_for_Safari.product.donate_3"]
        Purchases.shared.getProducts(donateArr) { products in
            self.list = products.sorted(by: { p1, p2 in
                p1.productIdentifier < p2.productIdentifier
            })
            self.tableView.reloadData()
            
            DispatchQueue.main.async {
                SVProgressHUD.dismiss()
            }
        }
    }
    
    private func initViews() {
        view.backgroundColor = Color.bgColor()
        
        view.addSubview(naviBar)
        naviBar.snp.makeConstraints { make in
            make.left.top.right.equalToSuperview()
        }
        
        naviBar.addSubview(naviTitleLabel)
        naviTitleLabel.snp.makeConstraints { make in
            make.center.equalToSuperview()
        }
        
        naviBar.addSubview(doneBtn)
        doneBtn.snp.makeConstraints { make in
            make.left.equalTo(8)
            make.centerY.equalToSuperview()
        }
        
        view.addSubview(tableView)
        tableView.snp.makeConstraints { make in
            make.left.right.bottom.equalToSuperview()
            make.top.equalTo(naviBar.snp.bottom)
        }
    }
    
    @objc private func onDoneBtnAction() {
        presentingViewController?.dismiss(animated: true)
    }
}

extension DonateViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return list.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cellId = "cellId"
        var cell = tableView.dequeueReusableCell(withIdentifier: cellId)
        if cell == nil {
            cell = UITableViewCell(style: .value1, reuseIdentifier: cellId)
        }
        
        let product = list[indexPath.row]
        
        cell?.textLabel?.text = product.localizedTitle
        cell?.detailTextLabel?.text = product.localizedPriceString
        return cell!
    }
    
    
    func tableView(_ tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        return "donate_desc".localized()
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        SVProgressHUD.show()
        
        let product = list[indexPath.row]
        Purchases.shared.purchase(product: product) { transaction, info, error, userCancelled in
            if (error == nil) {
                UserDefaults.standard.set(true, forKey: DonatedKey)
                SVProgressHUD.showSuccess(withStatus: "donation_thanks".localized())
                NotificationCenter.default.post(name: DonatedNotification, object: nil)
            } else {
                SVProgressHUD.dismiss()
            }
        }
    }
}
