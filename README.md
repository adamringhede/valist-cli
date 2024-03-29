# Valist CLI
https://www.valist.dev

Manage the hosting of your applications with simple commands.

Run your deployment configuration locally to ensure that it works as intended. 

### Install
```sh
npm i -g valist
```

### Example configuration
See more examples in the *samples* folder.

**valist-conf.json**
```json
{
  "static": {
    "build": "./Dockerfile",
    "dist": "/app/dist",
    "cmd": ["npm", "run", "build"]
  }
}
```

**valist.Dockerfile**
```dockerfile
FROM node:alpine
COPY . /app
WORKDIR /app
```

### Run your app locally
Standing in your project's root directory, run the following command.
```sh
valist local
```


## About Valist

### Hosting for agile web development

Short feedback cycles produces more successful projects significantly faster. Get visibility in your app's development by automatically deploying previews as your code changes.

https://www.valist.dev

### Using Valist

#### 1. Connect your repository

Deploy your website automatically by connecting your GIT repository in GitHub, Bitbucket or Gitlab.

#### 2. Configure your build

Run the way you need your application to run by including a Dockerfile to run your own web server or build your static web app.

#### 3. Deploy every pull request

A staging environment for each pull request with a public URL, automatically updated on each push.
