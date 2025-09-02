(npm run build) -and ((cp ./src/manifest.json ./build/) -or (cp build/static/js/main.*.js ./build/main.js))

npm start debug

node mock/server.js