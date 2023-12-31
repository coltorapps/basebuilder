---
title: createAttribute
nextjs:
  metadata:
    title: createAttribute
    description: API Reference of createAttribute.
---

This function creates an attribute definition that can be subsequently referenced in multiple entities' definitions.

By an attribute definition, we simply mean an object with specific properties. The function itself serves primarily as a type safety helper and doesn't perform any underlying logic.

## Reference

### `createAttribute(options)`

Use the `createAttribute` function to create an attribute definition.

```typescript
import { createAttribute } from "basebuilder";

export const labelAttribute = createAttribute({
  name: "label",
  validate(value, context) {
    if (typeof value !== "string") {
      throw new Error("Must be a string");
    }

    return value;
  },
});
```

### Parameters

`createAttribute` accepts a single parameter, which should be an object containing the following properties:

- `name` {% badge content="string" /%}: The attribute's name.
- `validate` {% badge content="function" /%}: A validation function for checking attribute values during schema validation. It can be asynchronous, and any exceptions it raises will be automatically caught and provided to you during schema validation. The method receives two arguments: the attribute's value and the [context object](#context).

### Returns

The `createAttribute` function essentially forwards the provided `options` parameter as the returned object.

## Context

The `context` object is passed as an argument to the `validate` method within the `createAttribute` function, and it contains the following properties:

- `schema` {% badge content="object" /%}: The current generic schema, including all generic entities instances, against which the attribute is validated.
- `entity` {% badge content="object" /%}: The generic entity instance that owns the attribute.
