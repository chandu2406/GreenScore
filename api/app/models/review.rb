class Review < ActiveRecord::Base

	belongs_to :factor
	belongs_to :house
	belongs_to :user
	has_many :rates



end
