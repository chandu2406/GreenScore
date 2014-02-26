class AddageToUser < ActiveRecord::Migration
  def change

  	add_column :users, :age , :integer
  	add_column :users, :start_income , :integer
  	add_column :users, :end_income , :integer
  	add_column :users, :gender , :string
  	add_column :users, :education , :text
  	add_column :users, :race , :string

  end
end
