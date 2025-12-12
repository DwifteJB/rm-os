# docker file to build vite app and serve with nodejs server (put the vite files in server as ./dist)
# then yarn run to start the server (and everything should be good!)
FROM alpine:latest

# install dependencies
RUN apk add --no-cache nodejs npm git openssl
RUN npm install -g yarn

# set working directory
WORKDIR /app
COPY . .

ENV VITE_WEB_URL="os.robbiem.dev"

# for frontend
RUN yarn install
RUN yarn build

# move to server directory
WORKDIR /app/server
RUN yarn install

# expose port
EXPOSE 3000
# start server
CMD ["yarn", "start"]
