FROM node:alpine
COPY . /app
WORKDIR /app
ENTRYPOINT ["./build.sh"]