# uBlacklist for Safari 
The app is a wrapper of [uBlacklist](https://github.com/iorate/uBlacklist) for Safari.

For more information about uBlacklist usage, please visit the [uBlacklist home page](https://github.com/iorate/uBlacklist).

## How to use

### 1. Fetch the code
```
git clone https://github.com/HoneyLuka/uBlacklist.git

cd uBlacklist

git checkout safari-port
```

### 2. Build uBlacklist
To build uBlacklist, [Node.js](https://nodejs.org/en/) and [Yarn](https://classic.yarnpkg.com/en/) are required.
```
yarn

yarn build safari production
```

### 3. Build uBlacklist for Safari project
To build this project, [Cocoapods](https://cocoapods.org) is required.
```
cd safari-project

pod install
```

### 4. Change project version (Optional)
```
cd scripts

ruby change_version.rb #{version} #{build_number}

# Example: ruby change_version.rb 5.1.0 12
```

### Note
**If the plugin is not found in Safari when you run it, you may need to turn on 'Allow Unsigned Extensions' in Safari.**

## Locale

### Option 1: Use script
To add locale with script, [Xcodeproj](https://github.com/CocoaPods/Xcodeproj) is required. It is a part of [Cocoapods](https://cocoapods.org).
```
cd scripts

ruby add_locale.rb #{based_locale} #{target_locale}

# Example: ruby add_locale.rb en ja
```

Then translate ```Localizable.strings``` at ```safari-project/iOS (App)/Common/Intl/#{target_locale}.lproj``` and ```safari-project/macOS (App)/Common/Intl/#{target_locale}.lproj```

### Option 2: Use Xcode

...

## License

The app is licensed under [MIT License](LICENSE).