[![Server Node.js CI](https://github.com/COP4331-Large-Project/server/actions/workflows/CI-server.yml/badge.svg)](https://github.com/COP4331-Large-Project/server/actions/workflows/CI-server.yml)
[![DeepSource](https://deepsource.io/gh/COP4331-Large-Project/client.svg/?label=active+issues&show_trend=true)](https://deepsource.io/gh/COP4331-Large-Project/client/?ref=repository-badge)

## Before you start...

#### 1. [Install Node.js](https://nodejs.org/en/download/) **Version 14.x or higher!**
#### 2. [Install MongoDB](https://docs.mongodb.com/manual/installation/)

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs all the node package dependencies.

### `npm install --only-dev`

Installs all the of developer dependencies.

### `npm start`

Starts and runs the node server using nodemon.

### `npm test`

Starts and runs the unit test suite and shows results.

## Configuring Services with Environment Variables

In order to use our services you'll need to create a `.env` in the root folder.
Once created you'll populate it with secrets given to you by the repo maintainers:

`.env`:
```shell
# MongoDB
MONGO_URI=YOUR MONGO URI

# AWS
AWS_ACCESS_KEY_ID=YOUR AWS ACCESS KEY ID
AWS_SECRET_ACCESS_KEY=YOUR AWS SECRET ACCESS KEY
```
