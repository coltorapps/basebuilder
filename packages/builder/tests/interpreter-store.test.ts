import { describe, expect, it, vi } from "vitest";

import { createBuilder, createEntity } from "../src";
import { createInterpreterStore } from "../src/interpreter-store";
import * as schemaExports from "../src/schema";

describe("interpreter store", () => {
  it("can be created", () => {
    const validateSchemaIntegrityMock = vi.spyOn(
      schemaExports,
      "validateSchemaIntegrity",
    );

    const schema = {
      entities: {},
      root: [],
    };

    const builder = createBuilder({
      entities: [],
    });

    const interpreterStore = createInterpreterStore({
      schema,
      builder,
    });

    expect(interpreterStore).toMatchSnapshot();

    expect(validateSchemaIntegrityMock).toHaveBeenCalledWith(schema, {
      builder,
    });
  });

  it("resets entities values when created", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
    });

    expect(interpreterStore.getData().entitiesValues).toMatchSnapshot();
  });

  it("doesn't reset entities values when created if configured to", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      initialEntitiesValuesWithDefaults: false,
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
        },
        root: ["51324b32-adc3-4d17-a90e-66b5453935bd"],
      },
      builder,
    });

    expect(interpreterStore.getData().entitiesValues).toMatchSnapshot();
  });

  it("can return the data", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
        },
        root: ["51324b32-adc3-4d17-a90e-66b5453935bd"],
      },
      builder,
    });

    expect(interpreterStore.getData()).toMatchSnapshot();
  });

  it("can be created with initial data", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
      initialData: {
        entitiesValues: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": undefined,
        },
        entitiesErrors: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "error",
        },
      },
    });

    expect(interpreterStore.getData()).toMatchSnapshot();
  });

  it("can set the data", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.setData({
      entitiesValues: {
        "51324b32-adc3-4d17-a90e-66b5453935bd": "new value",
      },
      entitiesErrors: {
        "51324b32-adc3-4d17-a90e-66b5453935bd": "new error",
      },
    });

    expect(() =>
      interpreterStore.setData({
        entitiesValues: {
          "2df173ee-6b88-4744-a74d-0f21d49166b3": "new value",
        },
        entitiesErrors: {},
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(() =>
      interpreterStore.setData({
        entitiesValues: {},
        entitiesErrors: {
          "2df173ee-6b88-4744-a74d-0f21d49166b3": "new error",
        },
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can set an entity value", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
      initialData: {
        entitiesValues: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text value",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select value",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.setEntityValue(
      "51324b32-adc3-4d17-a90e-66b5453935bd",
      "new value",
    );

    expect(() =>
      interpreterStore.setEntityValue(
        "2df173ee-6b88-4744-a74d-0f21d49166b3",
        "new value",
      ),
    ).toThrowErrorMatchingSnapshot();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can reset an entity value", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
      initialData: {
        entitiesValues: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text value",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select value",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.resetEntityValue("51324b32-adc3-4d17-a90e-66b5453935bd");

    expect(() =>
      interpreterStore.resetEntityValue("2df173ee-6b88-4744-a74d-0f21d49166b3"),
    ).toThrowErrorMatchingSnapshot();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can reset all entities values", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
        ],
      },
      builder,
      initialData: {
        entitiesValues: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text value",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select value",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.resetEntitiesValues();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can clear an entity value", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
      initialData: {
        entitiesValues: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text value",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select value",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.clearEntityValue("51324b32-adc3-4d17-a90e-66b5453935bd");

    expect(() =>
      interpreterStore.clearEntityValue("2df173ee-6b88-4744-a74d-0f21d49166b3"),
    ).toThrowErrorMatchingSnapshot();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can clear all entities values", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
        ],
      },
      builder,
      initialData: {
        entitiesValues: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text value",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select value",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.clearEntitiesValues();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can set an entity error", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
      initialData: {
        entitiesErrors: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text error",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select error",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.setEntityError(
      "51324b32-adc3-4d17-a90e-66b5453935bd",
      "new error",
    );

    expect(() =>
      interpreterStore.setEntityError(
        "2df173ee-6b88-4744-a74d-0f21d49166b3",
        "new error",
      ),
    ).toThrowErrorMatchingSnapshot();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can reset an entity error", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
      initialData: {
        entitiesErrors: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text error",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select error",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.resetEntityError("51324b32-adc3-4d17-a90e-66b5453935bd");

    expect(() =>
      interpreterStore.resetEntityError("2df173ee-6b88-4744-a74d-0f21d49166b3"),
    ).toThrowErrorMatchingSnapshot();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can reset all entities errors", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
        ],
      },
      builder,
      initialData: {
        entitiesErrors: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text error",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select error",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.resetEntitiesErrors();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });

  it("can set entities errors", () => {
    const builder = createBuilder({
      entities: [
        createEntity({
          name: "text",
          defaultValue() {
            return "default";
          },
          validate() {
            return "";
          },
        }),
        createEntity({
          name: "select",
          validate() {
            return "";
          },
          defaultValue() {
            return "default";
          },
        }),
        createEntity({
          name: "section",
        }),
      ],
    });

    const interpreterStore = createInterpreterStore({
      schema: {
        entities: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": {
            type: "text",
            inputs: {},
          },
          "6e0035c3-0d4c-445f-a42b-2d971225447c": {
            type: "select",
            inputs: {},
          },
          "2df173ee-6b88-4744-a74d-0f21d49166b3": {
            type: "section",
            inputs: {},
          },
        },
        root: [
          "51324b32-adc3-4d17-a90e-66b5453935bd",
          "6e0035c3-0d4c-445f-a42b-2d971225447c",
          "2df173ee-6b88-4744-a74d-0f21d49166b3",
        ],
      },
      builder,
      initialData: {
        entitiesErrors: {
          "51324b32-adc3-4d17-a90e-66b5453935bd": "text error",
          "6e0035c3-0d4c-445f-a42b-2d971225447c": "select error",
        },
      },
    });

    const listener = vi.fn();

    interpreterStore.subscribe(listener);

    interpreterStore.setEntitiesErrors({
      "51324b32-adc3-4d17-a90e-66b5453935bd": "new text error",
      "6e0035c3-0d4c-445f-a42b-2d971225447c": "new select error",
    });

    expect(() =>
      interpreterStore.setEntitiesErrors({
        "2df173ee-6b88-4744-a74d-0f21d49166b3": "new section error",
      }),
    ).toThrowErrorMatchingSnapshot();

    expect(interpreterStore.getData()).toMatchSnapshot();

    expect(listener).toMatchSnapshot();
  });
});