json.array!(@houses) do |house|
  json.extract! house, :country, :state, :city, :addl1, :addl2, :unit, :zip
  json.url house_url(house, format: :json)
end
