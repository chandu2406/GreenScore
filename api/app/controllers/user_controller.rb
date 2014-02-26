class UserController < ApplicationController

	def login
		render :status => 200, :json => {:token=> current_user.authentication_token}
	end

	def signup
		render json: true
	end


end
