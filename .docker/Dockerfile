FROM node:18 as base
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
COPY ./config /usr/src/app/config
RUN npm install --global npm@latest


FROM base as dev

RUN npm install
RUN npm install --global add nodemon


FROM base as ci
RUN npm install
COPY . /usr/app


FROM base as production
RUN npm install
COPY . .
