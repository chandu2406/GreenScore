class House < ActiveRecord::Base

	has_many :reviews
	def house_information
		"#{addl1} #{addl2} #{unit} #{city} #{state} #{country} #{zip}"
	end
end
