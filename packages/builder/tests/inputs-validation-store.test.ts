import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createBuilder,
  createEntity,
  createInput,
  createSchemaStore,
} from "../src";
import { createInputsValidationStore } from "../src/inputs-validation-store";

describe("inputs validation store", () => {
  it("can be created", () => {
    const builder = createBuilder({
      entities: [],
    });

    const schemaStore = createSchemaStore({ builder });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    expect(inputsValidationStore).toMatchSnapshot();
  });

  it("can set the data", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return z.string().parse(value);
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "text",
            inputs: {
              label: "test",
            },
          },
        },
        root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    inputsValidationStore.setData({
      entitiesInputsErrors: new Map(
        Object.entries({
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            label: "some error",
          },
        }),
      ),
    });

    expect(() =>
      inputsValidationStore.setData({
        entitiesInputsErrors: new Map(
          Object.entries({
            invalid: {
              label: "some error",
            },
          }),
        ),
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can set raw data", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return z.string().parse(value);
              },
            }),
          ],
        }),
      ],
    });

    const schema = {
      entities: {
        "6e0035c3-0d4c-445f-a42b-2d971225447c": {
          type: "text",
          inputs: {
            label: "test",
          },
        },
      },
      root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
    } as const;

    const schemaStore = createSchemaStore({
      builder,
      data: schema,
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    inputsValidationStore.setRawData({
      entitiesInputsErrors: {
        "6e0035c3-0d4c-445f-a42b-2d971225447c": {
          label: "some error",
        },
      },
    });

    expect(() =>
      inputsValidationStore.setRawData({
        entitiesInputsErrors: {
          invalid: {
            label: "some error",
          },
        },
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can be created with initial errors", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return z.string().parse(value);
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {
              label: "test label",
            },
          },
        },
        root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
      },
    });

    expect(
      createInputsValidationStore({
        builder,
        schemaStore,
        data: {
          entitiesInputsErrors: {
            "6e0035c3-0d4c-445f-a42b-2d971225447c": {
              label: new Error(),
            },
          },
        },
      }).getData(),
    ).toMatchSnapshot();

    expect(() =>
      createInputsValidationStore({
        builder,
        schemaStore,
        data: {
          entitiesInputsErrors: {
            invalid: {},
          },
        },
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      createInputsValidationStore({
        builder,
        schemaStore,
        data: {
          entitiesInputsErrors: {
            "6e0035c3-0d4c-445f-a42b-2d971225447c": {
              // @ts-expect-error Intentional wrong data type
              invalid: new Error(),
            },
          },
        },
      }),
    ).toThrowErrorMatchingSnapshot();
  });

  it("can validate a single entity input", async () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return z.string().parse(value);
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {
              // @ts-expect-error Intentional wrong data type
              label: 1,
            },
          },
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "test",
            // @ts-expect-error Intentional wrong data type
            inputs: {},
          },
        },
        root: [
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "51324b32-adc3-4d17-a90e-66b5453935bd",
        ],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    await expect(
      inputsValidationStore.validateEntityInput(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        "label",
      ),
    ).resolves.toEqual(undefined);

    await expect(
      inputsValidationStore.validateEntityInput(
        "51324b32-adc3-4d17-a90e-66b5453935bd",
        "label",
      ),
    ).resolves.toEqual(undefined);

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    await expect(
      inputsValidationStore.validateEntityInput("invalid", "label"),
    ).rejects.toThrowErrorMatchingSnapshot();

    await expect(
      inputsValidationStore.validateEntityInput(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        // @ts-expect-error Intentional wrong data type
        "invalid",
      ),
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can validate a all inputs of a single entity", async () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return z.string().parse(value);
              },
            }),
            createInput({
              name: "maxLength",
              validate(value) {
                return z.number().parse(value);
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {
              // @ts-expect-error Intentional wrong data type
              label: 1,
              // @ts-expect-error Intentional wrong data type
              maxLength: "1",
            },
          },
        },
        root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    await inputsValidationStore.validateEntityInputs(
      "6e0035c3-0d4c-445f-a42b-2d971225447c",
    );

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    await expect(
      inputsValidationStore.validateEntityInputs("invalid"),
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can validate a all inputs of all entities", async () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return z.string().parse(value);
              },
            }),
            createInput({
              name: "maxLength",
              validate(value) {
                return z.number().parse(value);
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {
              // @ts-expect-error Intentional wrong data type
              label: 1,
              maxLength: 1,
            },
          },
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "test",
            inputs: {
              label: "test",
              // @ts-expect-error Intentional wrong data type
              maxLength: "1",
            },
          },
        },
        root: [
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "51324b32-adc3-4d17-a90e-66b5453935bd",
        ],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    await inputsValidationStore.validateEntitiesInputs();

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can set a single entity input error", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return value;
              },
            }),
            createInput({
              name: "title",
              validate(value) {
                return value;
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {},
          },
        },
        root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    expect(
      inputsValidationStore.setEntityInputError(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        "label",
        "Some error",
      ),
    ).toEqual(undefined);

    expect(
      inputsValidationStore.setEntityInputError(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        "title",
        "Title error",
      ),
    ).toEqual(undefined);

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(() =>
      inputsValidationStore.setEntityInputError("invalid", "title", "error"),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      inputsValidationStore.setEntityInputError(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        // @ts-expect-error Intentional wrong data type
        "invalid",
        "error",
      ),
    ).toThrowErrorMatchingSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can set multiple input errors for a single entity", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return value;
              },
            }),
            createInput({
              name: "title",
              validate(value) {
                return value;
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {},
          },
        },
        root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    expect(
      inputsValidationStore.setEntityInputsErrors(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        {
          label: "some error",
          title: "another error",
        },
      ),
    ).toEqual(undefined);

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(() =>
      inputsValidationStore.setEntityInputError("invalid", "title", "error"),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      inputsValidationStore.setEntityInputsErrors(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        {
          // @ts-expect-error Intentional wrong data type
          invalid: "some error",
        },
      ),
    ).toThrowErrorMatchingSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can reset a single entity input error", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "select",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return value;
              },
            }),
            createInput({
              name: "title",
              validate(value) {
                return value;
              },
            }),
          ],
        }),
        createEntity({
          name: "text",
          inputs: [
            createInput({
              name: "maxLength",
              validate(value) {
                return value;
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
        },
        root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    inputsValidationStore.setEntityInputsErrors(
      "6e0035c3-0d4c-445f-a42b-2d971225447c",
      {
        label: "label error",
        title: "title error",
      },
    );

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(
      inputsValidationStore.resetEntityInputError(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        "label",
      ),
    ).toEqual(undefined);

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(() =>
      inputsValidationStore.resetEntityInputError("invalid", "title"),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      inputsValidationStore.resetEntityInputError(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
        // @ts-expect-error Intentional wrong data type
        "invalid",
      ),
    ).toThrowErrorMatchingSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can reset all inputs errors for a single entity", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return value;
              },
            }),
            createInput({
              name: "title",
              validate(value) {
                return value;
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {},
          },
        },
        root: ["6e0035c3-0d4c-445f-a42b-2d971225447c"],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    inputsValidationStore.setEntityInputsErrors(
      "6e0035c3-0d4c-445f-a42b-2d971225447c",
      {
        label: "label error",
        title: "title error",
      },
    );

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(
      inputsValidationStore.resetEntityInputsErrors(
        "6e0035c3-0d4c-445f-a42b-2d971225447c",
      ),
    ).toEqual(undefined);

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(() =>
      inputsValidationStore.resetEntityInputsErrors("invalid"),
    ).toThrowErrorMatchingSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can reset all inputs errors for all entities", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "test",
          inputs: [
            createInput({
              name: "label",
              validate(value) {
                return value;
              },
            }),
            createInput({
              name: "title",
              validate(value) {
                return value;
              },
            }),
          ],
        }),
      ],
    });

    const schemaStore = createSchemaStore({
      builder,
      data: {
        entities: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "test",
            inputs: {},
          },
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "test",
            inputs: {},
          },
        },
        root: [
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "51324b32-adc3-4d17-a90e-66b5453935bd",
        ],
      },
    });

    const inputsValidationStore = createInputsValidationStore({
      builder,
      schemaStore,
      data: {
        entitiesInputsErrors: {
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            label: "label error",
          },
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            title: "title error",
          },
        },
      },
    });

    const listener = vi.fn();

    const listenerWrapper = (...args: unknown[]): unknown => listener(args[1]);

    inputsValidationStore.subscribe(listenerWrapper);

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(inputsValidationStore.resetEntitiesInputsErrors()).toEqual(
      undefined,
    );

    expect(inputsValidationStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });
});
