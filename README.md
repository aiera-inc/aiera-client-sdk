# Aiera Client SDK

The client SDK contains tools to interact with Aiera's backend APIs as well as widgets that can be embedded in other web
applications to embed Aiera's functionality. The widgets are developed to be platform agnostic using a messaging system
to allow for platform-specific implementations for FDC3 contexts, notifications, etc. The widgets are exposed as React
components which are exported alongside a number of custom hooks and utilities to interact with Aiera's APIs.

An Aiera account is needed to access any of the functionality.

This repo is currently used internally for building out Aiera widgets for external systems and is documented/maintained
as such. However, we've open sourced it to allow for others to embed this functionality as well. If these external use
cases become more common we will provide additional documentation, tutorials and other materials to help developers
embed Aiera widgets into their applications.

Documentation for this repo can be found [here](https://aiera-inc.github.io/aiera-client-sdk/docs/index.html).

### Getting started for developers

#### Documentation

https://aiera-inc.github.io/aiera-client-sdk/docs/index.html

#### Demos

[Event List](https://aiera-inc.github.io/aiera-client-sdk/demo/EventList.html)
[News](https://aiera-inc.github.io/aiera-client-sdk/demo/NewsList.html)
[Recordings](https://aiera-inc.github.io/aiera-client-sdk/demo/RecordingList.html)

#### Prerequisites

- node v16+

#### Installation

```
> git clone git@github.com:aiera-inc/aiera-client-sdk.git
> cd aiera-client-sdk
> npm install
> npm start
> # open browser to localhost:8000/demo/EventList.html
```

#### Deploying

To release the latest code for the embedded modules in S3 (e.g. s3://aiera-public-assets/aiera-sdk/), first source the
`.env` file matching the environment to which you want to deploy. If deploying to dev (e.g. /aiera-sdk/dev/0.0.55),
run `source development.env` in the command line. Alternatively, for prod, run `source production.env`.

***IMPORTANT***: *if you don't source the correct `.env` file before running the publish command, you could end up
pointing **production** code to a **local**/**dev** `aiera-pubic-api`.*

Before publishing to S3, confirm you have the correct `aiera-public-api` url. In the command line,
run `echo $AIERA_SDK_API_URL`. Then, run `npm run publish-web-dev` or `npm run publish-web-prod` depending on the environment to which you'd like
to deploy.

#### Testing

`console.log` and `console.debug` messages are stubbed by default to prevent flooding the command line. If you need to
add `console.log` (or the like) to debug your tests, you could edit `.jest/jest-setup.js` to allow certain log levels to
propagate to your stack trace.
