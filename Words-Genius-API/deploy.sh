dictionary() {
  gcloud functions deploy dictionary \
    --project words-genius \
    --region europe-west3 \
    --entry-point GetDictionaryData \
    --runtime go113 \
    --timeout 10s \
    --memory 128mb \
    --trigger-http \
    --security-level secure-always \
    --allow-unauthenticated
}

translation() {
  gcloud functions deploy translation \
    --project words-genius \
    --region europe-west3 \
    --entry-point Translate \
    --runtime go113 \
    --timeout 10s \
    --memory 128mb \
    --trigger-http \
    --env-vars-file .env.yml \
    --security-level secure-always \
    --allow-unauthenticated
}

"$@"