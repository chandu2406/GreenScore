json.array!(@reviews) do |review|
  json.extract! review, :house_id, :factor_id, :user_id, :note
  json.url review_url(review, format: :json)
end
