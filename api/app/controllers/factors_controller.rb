class FactorsController < ApplicationController
  before_filter :authenticate_user!
  before_action :set_factor, only: [:show, :edit, :update, :destroy]

  # GET /factors
  # GET /factors.json
  def index
    @factors = Factor.all
  end

  # GET /factors/1
  # GET /factors/1.json
  def show
  end

  # GET /factors/new
  def new
    @factor = Factor.new
  end

  # GET /factors/1/edit
  def edit
  end

  # POST /factors
  # POST /factors.json
  def create
    @factor = Factor.new(factor_params)

    respond_to do |format|
      if @factor.save
        format.html { redirect_to @factor, notice: 'Factor was successfully created.' }
        format.json { render action: 'show', status: :created, location: @factor }
      else
        format.html { render action: 'new' }
        format.json { render json: @factor.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /factors/1
  # PATCH/PUT /factors/1.json
  def update
    respond_to do |format|
      if @factor.update(factor_params)
        format.html { redirect_to @factor, notice: 'Factor was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @factor.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /factors/1
  # DELETE /factors/1.json
  def destroy
    @factor.destroy
    respond_to do |format|
      format.html { redirect_to factors_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_factor
      @factor = Factor.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def factor_params
      params.require(:factor).permit(:name, :description)
    end
end
