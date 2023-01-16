# Simple CRUD API with in-memory database
Node.js CRUD application written in TypeScript. 

## Requirements
1. 18 LTS version of Node.js

## Installation

1. Clone repository and switch to branch `develop`;
2. Run command `npm i` to install all dependencies.
3. Rename `.env.example` file to `.env` and set server port like `PORT=4000`

## Building

1. `npm run make` to compile TypeScript to JavaScript. Result will be placed into `./dist` folder.
2. `npm run build` to make bundled JavaScript file. Result will be placed into `./bundle` folder. This one make internal call of `npm run make`.

## Running modes

1. For development mode run command `npm run start:dev`.
2. For production mode run command `npm run start:prod`. This command run single process server.
3. For multi-treading server mode run command `npm run start:multi`.
4. All modes can be stopped by pressing `Ctrl+C`.

## Test cases

1. For **Jest** tests type command: `npm run test`. This tests must be run with **disabled** server.
2. For **Postman** tests you need to do:
 - Run server - `npm run start:multi`.
 - Run test with command: `npm run test:multi`.
 
  For testing purposes, server responses are contain **Etag** header with process pid. Using this headers are allow to identificate a process which make the response.
