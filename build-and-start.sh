#!/bin/bash
cd /var/www/kibilov-frontend
npm run build
BUILD_ID=$(cat .next/BUILD_ID)
echo "BUILD_ID: $BUILD_ID"
python3 -c "
import json
bid=open('.next/BUILD_ID').read().strip()
m={'version':4,'routes':{'/':{'initialRevalidateSeconds':False,'srcRoute':'/','dataRoute':'/_next/data/'+bid+'/index.json','allowHeader':[]}},'dynamicRoutes':{},'notFoundRoutes':[],'preview':{'previewModeId':'process.env.__NEXT_PREVIEW_MODE_ID','previewModeSigningKey':'process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY','previewModeEncryptionKey':'process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY'}}
s=json.dumps(m)
open('.next/prerender-manifest.json','w').write(s)
open('.next/prerender-manifest.js','w').write('self.__PRERENDER_MANIFEST='+json.dumps(s))
print('manifest OK')
"
pm2 restart frontend
