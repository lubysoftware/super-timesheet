curl -s --header "X-Vault-Token: $1" \
  --request GET \
  $2/v1/$3 | jq -r '.data.data' > temp.json

jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' temp.json | tee .env
