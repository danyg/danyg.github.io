---
layout: post
title: How to migrate to typescript little by little
---

Still not sure how to title this blog entry, **How to come back to Javascript once you embraced Typescript** was the main motivator of it, also it will fit the **How to Javascript to Typescript** or also **How to have type checks on javascript using Typescript checker on VSCode**

## Disclaimer

The following solution was the solution I achieved in the code I found in the little time I had available to do these improvements, I'm pretty much sure for this would be better to implement an enum but still to be investigated how many code I would need to change for that. At this moment there is no agreement to move to typescript, and the project is big enough to need types and start knowing what are the available properties of the objects we handle here an there.
Still haven't start conversation about moving to typescript with the team, but I would rather show them with something already working that they are familiar with to leverage the conversations :D

## Configure your project

jsconfig.json

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "checkJs": true,
    "baseUrl": "src",
    "target": "es6",
    "moduleResolution": "node"
  },
  "exclude": ["node_modules", "bower_components"]
}
```

## How to work with your own d.ts

```typescript
// in your js file
/** @typedef {import('types/product').Product} Product */

// /types/product.d.ts
export type Product = {
  name: string;
  id: string;
};
```

## How to Constants / easy enums

Some file that uses the enums

```typescript
import { STOCK_STATUS } from "/config/constants";

class SomeClass {
  /** @param {StockAvailability} stock */
  someValidationWithStock(stock) {
    if (stock === STOCK_STATUS.IN_STOCK) {
      // do something...
    }
  }
}
```

types/product.d.ts

```typescript
// ...

export type StockAvailability =
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "LOW_IN_STOCK"
  | "PRE_ORDER_ALLOWED";

// ...
```

config/constants.js

```typescript
/** @typedef {import('types/product').StockAvailability} StockAvailability */

/** @type {{[key: string]: StockAvailability}} */
export const STOCK_STATUS = {
  OUT_OF_STOCK: "OUT_OF_STOCK",
  IN_STOCK: "IN_STOCK",
  LOW_IN_STOCK: "LOW_IN_STOCK",
  PRE_ORDER_ALLOWED: "PRE_ORDER_ALLOWED"
};
```

With the previous example, you lose the option of having intellisense of the inner keys but you have no typescript error, either in this piece of code neither using the properties of this object as `StockAvailability`

The following example you'll have intellisense for the keys, and typescript check will complain that string cannot be converted to StockAvailability but I think is the best concession.

```typescript
/** @typedef {import('types/product').StockAvailability} StockAvailability */

export const STOCK_STATUS = {
  /** @type {StockAvailability} */
  OUT_OF_STOCK: "OUT_OF_STOCK",

  /** @type {StockAvailability} */
  IN_STOCK: "IN_STOCK",

  /** @type {StockAvailability} */
  LOW_IN_STOCK: "LOW_IN_STOCK",

  /** @type {StockAvailability} */
  PRE_ORDER_ALLOWED: "PRE_ORDER_ALLOWED"
};
```
