namespace :db do
  desc "Fill database with factors"
  task populate: :environment do
    Sunlight = Factor.create!(name: "Sunlight",
                         description: "")
    Lead = Factor.create!(name: "Lead",
                         description: "")
    Air = Factor.create!(name: "Air",
                         description: "")
    Radon = Factor.create!(name: "Radon",
                         description: "")
    Traffic = Factor.create!(name: "Traffic",
                         description: "")    
  end
end