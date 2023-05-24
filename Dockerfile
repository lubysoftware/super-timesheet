FROM node:18

RUN mkdir -p /var/www/web

WORKDIR /var/www/web

COPY . .

RUN yarn add next react react-dom && \ 
    yarn install && \
    yarn build

CMD ["yarn", "start"]