#!/bin/bash

API="http://localhost:4741"
URL_PATH="/pokeLists"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "poke_list": {
      "poke_num": "'"${POKENUM}"'",
      "name": "'"${NAME}"'",
      "img": {
        "silhouette": "'"${SILHOUETTE}"'",
        "visible": "'"${VISIBLE}"'"
      }
    }
  }'

echo
