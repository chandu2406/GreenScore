class ComparisonController < ApplicationController
	before_filter :authenticate_user!
	def index
			@house_one = House.new
			@house_two = House.new
			@factors = Factor.all
	end

	def show
		@house_one = House.find(params[:house_one][:id])
		@house_two = House.find(params[:house_two][:id])
		#probably not usable for the comparison page
	end

	def create
		@house_one = House.find(params[:house_one][:id])
		@house_two = House.find(params[:house_two][:id])
		@factors = Factor.all
		#redirect_to comparison_index_path
		#need to add the check for invalid input
	end
end
