import { describe, expectTypeOf, it } from "vitest";

import { createBuilder, createEntity } from "../src";

describe("builder", () => {
  it("can be created with minimal options", () => {
    const builder = createBuilder({ entities: [] });

    expectTypeOf(builder).toEqualTypeOf<{
      entities: readonly [];
      entityId: {
        generate: () => string;
        validate: (id: string) => void;
      };
      childrenAllowed: {
        [x: string]: never;
      };
      parentRequired: [];
    }>();
  });

  it("can be created with entities", () => {
    const builder = createBuilder({
      entities: [createEntity({ name: "test" })],
      childrenAllowed: {
        test: true,
      },
      parentRequired: ["test"],
    });

    type EntityContext = {
      inputs: {
        [x: string]: unknown;
      };
      values: {
        [x: string]: unknown;
      };
    };

    expectTypeOf(builder).toEqualTypeOf<{
      entities: readonly [
        {
          name: "test";
          inputs: readonly {
            name: string;
            validate: (value: unknown) => unknown;
            defaultValue: () => unknown;
          }[];
          isValueAllowed: boolean;
          validate: (value: unknown, context: EntityContext) => unknown;
          defaultValue: (context: EntityContext) => unknown;
          shouldBeProcessed: (context: EntityContext) => boolean;
        },
      ];
      entityId: {
        generate: () => string;
        validate: (id: string) => void;
      };
      childrenAllowed: {
        readonly test: true;
      };
      parentRequired: readonly ["test"];
    }>();
  });
});