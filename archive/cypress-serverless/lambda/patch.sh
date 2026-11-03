# https://unix.stackexchange.com/a/315172
# you gotta see it to believe it
echo 'patching Xvfb binary, yolo...'
position=$(strings -t d /usr/bin/Xvfb | grep xkbcomp | grep xkm | cut -d' ' -f1)
# this string is padded so that it matches the same length of the string above
echo -n 'R="%X%X%d%X%X%X%X%X%X" /bin/cp /tmp/lib/default.xkm /tmp/%s.xkm    ' | dd bs=1 of=/usr/bin/Xvfb seek="$position" conv=notrunc

echo 'and electron (via cypress)...'
position=$(strings -t d /app/lib/Cypress | grep '/dev\/shm\/' | cut -d' ' -f1)
echo -n '/tmp/shm/' | dd bs=1 of=/app/lib/Cypress seek="$position" conv=notrunc

position=$(strings -t d /app/lib/Cypress | grep '/dev\/shm' -m 1 | cut -d' ' -f1)
echo -n '/tmp/shm' | dd bs=1 of=/app/lib/Cypress seek="$position" conv=notrunc
