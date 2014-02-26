class HouseController < ApplicationController
	before_filter :authenticate_user!
	before_action :set_house, only: [:show, :edit, :update, :destroy]

  # GET /factors
  # GET /factors.json
  def index
    @house = House.all
  end

  # GET /factors/1
  # GET /factors/1.json
  def show
  end

  # GET /factors/new
  def new
    @house = House.new
  end

  # GET /factors/1/edit
  def edit
  end

  # POST /factors
  # POST /factors.json
  def create
    @house = House.new(house_params)

    respond_to do |format|
      if @house.save
        format.html { redirect_to @house, notice: 'Factor was successfully created.' }
        format.json { render action: 'show', status: :created, location: @house }
      else
        format.html { render action: 'new' }
        format.json { render json: @house.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /factors/1
  # PATCH/PUT /factors/1.json
  def update
    respond_to do |format|
      if @house.update(factor_params)
        format.html { redirect_to @house, notice: 'Factor was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @house.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /factors/1
  # DELETE /factors/1.json
  def destroy
    @house.destroy
    respond_to do |format|
      format.html { redirect_to house_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_house
      @house = House.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def house_params
      params.require(:house).permit(:country, :city , :state , :addl1, :addl2 , :unit , :zip)
    end




end
