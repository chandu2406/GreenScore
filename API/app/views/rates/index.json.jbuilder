json.array!(@rates) do |rate|
  json.extract! rate, :text_input, :integer_input, :start_range, :end_range, :float_input
  json.url rate_url(rate, format: :json)
end
