json.array!(@factors) do |factor|
  json.extract! factor, :name, :description
  json.url factor_url(factor, format: :json)
end
