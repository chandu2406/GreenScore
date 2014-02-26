class CreateHouses < ActiveRecord::Migration
  def change
    create_table :houses do |t|
      t.string :country
      t.string :state
      t.string :city
      t.text :addl1
      t.text :addl2
      t.string :unit
      t.integer :zip

      t.timestamps
    end
  end
end
