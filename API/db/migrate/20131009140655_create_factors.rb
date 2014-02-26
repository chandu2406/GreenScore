class CreateFactors < ActiveRecord::Migration
  def change
    create_table :factors do |t|
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
