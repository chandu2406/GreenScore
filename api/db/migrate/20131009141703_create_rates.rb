class CreateRates < ActiveRecord::Migration
  def change
    create_table :rates do |t|
      t.text :text_input
      t.integer :integer_input
      t.integer :start_range
      t.integer :end_range
      t.float :float_input

      t.timestamps
    end
  end
end
