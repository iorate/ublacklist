require 'xcodeproj'
require 'fileutils'

if ARGV.length != 2
    puts 'arguments error'
    return
end

from = ARGV[0]
to = ARGV[1]

# copy localizable file
from_dir = "../uBlacklist for Safari/Common/Intl/#{from}.lproj"
to_dir = "../uBlacklist for Safari/Common/Intl/#{to}.lproj"
FileUtils.copy_entry(from_dir, to_dir)

project_file = '../uBlacklist for Safari.xcodeproj'

puts "Processing #{project_file} ..."

project = Xcodeproj::Project.open(project_file)

intl_group = project.main_group.find_subpath('uBlacklist for Safari/Common/Intl/Localizable.strings')

if intl_group.find_subpath("#{to}")
    puts "#{to} reference has already exist"
    return
end

ref = intl_group.new_reference("#{to}.lproj/Localizable.strings")
ref.name = "#{to}"
ref.include_in_index = nil
project.save