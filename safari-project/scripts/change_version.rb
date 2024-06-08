require 'xcodeproj'
require 'json'

if ARGV.length != 2
    puts 'arguments error'
    return
end

version = ARGV[0]
build_number = ARGV[1]

project_file = '../uBlacklist for Safari.xcodeproj'

puts "Processing #{project_file} ..."

project = Xcodeproj::Project.open(project_file)

core_manifest_file_path = '../../dist/safari/manifest.json'

if File.exist?(core_manifest_file_path) == false
    puts 'uBlacklist-Core has not been generated yet'
    return
end

manifest = JSON.parse(File.read(core_manifest_file_path))
manifest['version'] = version
file = File.open(core_manifest_file_path, 'w')
file.write(JSON.pretty_generate(manifest))

project.targets.each do |target|
    target.build_configuration_list.set_setting('MARKETING_VERSION', version)
    target.build_configuration_list.set_setting('CURRENT_PROJECT_VERSION', build_number)
end

project.save

puts "current version: #{version}, current build number: #{build_number}"
