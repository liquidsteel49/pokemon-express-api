#!/bin/bash

API="http://localhost:4741"
URL_PATH="/profile"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "profile": {
      "name": "'"${NAME}"'",
      "fav_poke_id": "'"${FAV_POKE_ID}"'",
      "owner": "'"${OWNER}"'"
    }
  }'

echo
