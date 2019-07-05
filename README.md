# bytecoin-js [![npm version](https://img.shields.io/npm/v/@bcndev/bytecoin.svg)](https://www.npmjs.com/package/@bcndev/bytecoin)

## Development

```
$ npm install
```

```
$ npm run build
$ npm run test
```

## Usage

With npm/webpack:

```
$ npm install @bcndev/bytecoin
```

```js
import {checkAddress} from "@bcndev/bytecoin";
```

With plain HTML/JS (via [bytecoin.js](./dist/bytecoin.js)):

```html
<script src="dist/bytecoin.js"/>
<script>
  alert(bcn.checkAddress("21UQFLdH7WvPZEd8HNwXncHtDwFvv4GRqaN3R4cWyuw2TRZxRtRPb7FFTxfcwwQsqYSD2EqhgVCLsGdRdejAoHFHAHJrxxo"));
</script>
```
