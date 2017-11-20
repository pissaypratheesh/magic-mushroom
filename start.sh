#!/bin/sh
app=pwa
curDir="$(pwd)"

mkdir -p "/mnt/vol2/dh-wap-data/node-logs/logs/"

numOfInstance=2
errLogPath=/mnt/vol2/dh-wap-data/node-logs/logs
if [[ $NODE_ENV == "production" ]]; then
    numOfInstance=max
fi
pm2 kill
pm2 start $curDir/dist/src/tools/srcServer.js  --merge-logs -f -n $app -i $numOfInstance -e $errLogPath/pm2-$app-err.log -o $errLogPath/pm2-$app-out.log
echo started $app port:$port and env:$NODE_ENV and logging at $errLogPath
exit 0
