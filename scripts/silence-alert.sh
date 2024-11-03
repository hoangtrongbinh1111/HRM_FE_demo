#!/bin/bash

startAt=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
endAt=$(date -u -d "+15 minute" +"%Y-%m-%dT%H:%M:%SZ")

echo "startAt: $startAt"
echo "endAt: $endAt"

curl -X POST -H "Content-Type: application/json" \
    -d '{
          "matchers": [
            {
              "name": "alertname",
              "value": "ContainerAbsent",
              "isRegex": false
            },
            {
              "name": "name",
              "value": "hrm_fe",
              "isRegex": false
            }
          ],
          "startsAt": "'"$startAt"'",
          "endsAt": "'"$endAt"'",
          "createdBy": "HRM_FE/silence-alert.sh",
          "comment": "Silencing ContainerAbsent for building"
        }' \
    http://192.168.2.247:10603/api/v2/silences
