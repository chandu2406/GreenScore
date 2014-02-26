class AddReviewIdToRate < ActiveRecord::Migration
  def change
    add_column :rates, :review_id, :integer
  end
end
