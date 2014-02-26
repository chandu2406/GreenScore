class CreateReviews < ActiveRecord::Migration
  def change
    create_table :reviews do |t|
      t.integer :house_id
      t.integer :factor_id
      t.integer :user_id
      t.text :note

      t.timestamps
    end
  end
end
