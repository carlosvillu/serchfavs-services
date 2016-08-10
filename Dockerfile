FROM node:wheezy

# https://github.com/npm/npm/issues/9863#issuecomment-209194124
RUN cd $(npm root -g)/npm \
 && npm install fs-extra \
 && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs\.move/ ./lib/utils/rename.js

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@3.7.5

ENV HOME=/home/app

COPY package.json $HOME/favorites-service/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/favorites-service
RUN npm install

USER root
COPY . $HOME/favorites-service
RUN chown -R app:app $HOME/*
USER app

CMD ["node", "index.js"]
