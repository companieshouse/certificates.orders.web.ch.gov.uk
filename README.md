# Web Starter NodeJS

### Overview

The aim of this template is to give you a head start in setting up a new web application for Companies House.

The template uses [Express](https://expressjs.com), [TypeScript](https://typescriptlang.org) and the [GovUK Frontend](https://github.com/alphagov/govuk-frontend) toolkit to set up a simple example of a web application that runs on NodeJS.

**You can create a new project from this template by clicking the [Use this template](https://github.com/companieshouse/node-web-starter/generate) button.**

## Contents

- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Running the server](#running-the-server)
- [Static assets](#static-assets)
- [Compiling the application](#compiling-the-application)
- [Linting](#linting)
- [Testing](#testing)

### Quick start

If you are familiar with NodeJS development and already have it installed, simply run the `init` make task

    make init
    
And then start the application
    
    npm start
    
Then go to [http://localhost:3000](http://localhost:3000).

### Prerequisites

You are going to need a few things to begin. Firstly, NodeJS. There are a few ways to install it.

- [Official installer](https://nodejs.org/en/)
- [Node Version Manager](https://github.com/nvm-sh/nvm)
- [Homebrew](https://formulae.brew.sh/formula/node)

Node version manager allows you to install multiple versions side by side on the host machine.

Once you have that installed, you will need to install the dependencies (locally) and [GulpJS](https://gulpjs.com) (globally). This task runner is used to compile the [Sass](https://sass-lang.com) used in the GovUK Frontend.

    npm i
    npm install gulp-cli -g
    
### Running the server

There are two ways to run the server in development. You run it in normal mode;

    npm start
    
Or, automatically reload the server once you make changes to source code;

    npm start:watch

### Static assets

Sass is used to compile the css from GovUK Frontend. The `static` gulp task will build the necessary files and output them to the [dist](./dist) folder.

    gulp static
    
During development, static assets are served from this folder using the url prefix `/static`.

### Compiling the application

TypeScript compiles down the JavaScript code that eventually gets run via NodeJS. The `build` npm task will write the JavaScript to the [dist](./dist) folder.

    npm run build
    
**It is this code that gets run in production.**

### Linting

[TSLint](https://palantir.github.io/tslint/) is used to perform static analysis on code style.

    npm run lint

### Testing

Tests can be found in the directory [src/test](./src/test). The framework used is [Jest](https://jestjs.io) along with [Supertest](https://github.com/visionmedia/supertest) to dispatch handlers that can have assertions made against the responses. Execute the following to run the tests;

    npm t
