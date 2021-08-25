# certificates.orders.web.ch.gov.uk
Certificate ordering web service integrating with the CH orders service

## Contents

- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Running the server](#running-the-server)
- [Static assets](#static-assets)
- [Compiling the application](#compiling-the-application)
- [Linting](#linting)
- [Testing](#testing)
- [Feature Flags](#feature-flags)

### Quick start

If you are familiar with NodeJS development and already have it installed, simply run the `init` make task

    make init

Carry out a build by running

    make build
    
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

[ESLint](https://eslint.org/) is used to perform static analysis on code using a [StandardJS](https://standardjs.com/) ruleset as its base.

    npm run lint

You can also autofix minor linting errors by running `npm run lint:fix`

### Testing

Tests can be found in the directory [src/test](./src/test). The framework used is [Jest](https://jestjs.io) along with [Supertest](https://github.com/visionmedia/supertest) to dispatch handlers that can have assertions made against the responses. Execute the following to run the tests;

    npm t

### Feature Flags

Use the following environment variables to enable / disable dynamic certificate ordering features.

|Variable|Description|Value|
|---|---|---|
|DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED|Limited Partnership certificates | true &#x7c; false |
|DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED|Limited Liability Partnership certificates | true &#x7c; false |


