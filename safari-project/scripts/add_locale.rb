require 'xcodeproj'
require 'fileutils'

if ARGV.length != 2
    puts 'arguments error'
    return
end

from = ARGV[0]
to = ARGV[1]

def group_new_reference project, subpath, to_locale
    intl_group = project.main_group.find_subpath(subpath)

    if intl_group.find_subpath("#{to_locale}")
        puts "#{to_locale} reference has already exist"
        return
    end

    ref = intl_group.new_reference("#{to_locale}.lproj/Localizable.strings")
    ref.name = to_locale
    ref.include_in_index = nil
    project.save

    puts "Successfully added #{to_locale}.lproj/Localizable.strings reference"
end

# copy localizable file
osx_from_dir = "../macOS (App)/Common/Intl/#{from}.lproj"
osx_to_dir = "../macOS (App)/Common/Intl/#{to}.lproj"
FileUtils.copy_entry(osx_from_dir, osx_to_dir)

ios_from_dir = "../iOS (App)/Common/Intl/#{from}.lproj"
ios_to_dir = "../iOS (App)/Common/Intl/#{to}.lproj"
FileUtils.copy_entry(ios_from_dir, ios_to_dir)

project_file = '../uBlacklist for Safari.xcodeproj'

puts "Processing #{project_file} ..."

project = Xcodeproj::Project.open(project_file)

group_new_reference(project, 'macOS (App)/Common/Intl/Localizable.strings', to)
group_new_reference(project, 'iOS (App)/Common/Intl/Localizable.strings', to)

puts "Complete."