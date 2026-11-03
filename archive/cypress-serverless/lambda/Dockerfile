from lambci/lambda:build-nodejs8.10

WORKDIR /app 

RUN yum -y install wget

# https://gist.github.com/dimkir/f4afde77366ff041b66d2252b45a13db
COPY eltool.sh .
RUN ./eltool.sh dev-tools 
RUN ./eltool.sh dist-deps
RUN ./eltool.sh centos-deps
RUN ./eltool.sh gconf-compile gconf-install 
RUN ./eltool.sh pixbuf-compile pixbuf-install
RUN ./eltool.sh gtk-compile
RUN ./eltool.sh gtk-install 
RUN ./eltool.sh xvfb-install 

# provides libasound...from:
# github.com/cypress-io/cypress-docker-images/blob/15c5bf875454a289e20587b192c4e4322787956c/base/centos7/Dockerfile#L1
RUN yum install -y alsa-lib*

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY cypress.json .
COPY cypress ./cypress

COPY link.sh .
RUN ./link.sh

# https://unix.stackexchange.com/a/315172 LMAO
COPY xkb-compile.sh .
RUN ./xkb-compile.sh

COPY pack-lib.sh .
RUN ./pack-lib.sh

COPY patch.sh .
RUN ./patch.sh

# tar it up
RUN GZIP=-9 tar cvzf lib.tar.gz ./lib
