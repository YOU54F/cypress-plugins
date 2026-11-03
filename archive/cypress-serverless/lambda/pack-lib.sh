mkdir lib

# copy Xvfb and Cypress binaries' shared library dependencies into lib
ldd /usr/bin/Xvfb | cut -d' ' -f 3 | tr -d '\r' | xargs -I{} cp -R -L {} ./lib/
ldd /root/.cache/Cypress/3.1.5/Cypress/Cypress | cut -d' ' -f 3 | tr -d '\r' \
  | xargs -I{} cp -R -L {} ./lib/

# a few more dependencies we know we need
cp -L -R /usr/share/X11/xkb ./lib/
cp /app/default.xkm ./lib/
cp -L -R /root/.cache/Cypress/3.1.5/Cypress/* ./lib/

# we need some node prune up in here
# gotta get lib under 512mb!
curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh \
  | bash -s -- -b /usr/local/bin
node-prune lib/resources/app/packages/server
node-prune lib/resources/app/packages/https-proxy
node-prune lib/resources/app/packages/electron
