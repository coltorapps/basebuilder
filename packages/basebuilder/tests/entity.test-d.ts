import { describe, expectTypeOf, it } from "vitest";
import { z } from "zod";

import { createAttribute, type Attribute } from "../src/attribute";
import {
  createEntity,
  type AttributesExtensions,
  type Entity,
} from "../src/entity";

describe("entity", () => {
  it("can be created", () => {
    const entity = createEntity({
      name: "text",
    });

    expectTypeOf(entity).toMatchTypeOf<{
      name: "text";
    }>();
  });

  it("can be created with validator", () => {
    const entity = createEntity({
      name: "text",
      validate(value) {
        return z.string().parse(value);
      },
    });

    type EntityContext = {
      entity: {
        id: string;
        attributes: {
          [x: string]: unknown;
        };
        children?: Array<string>;
        parentId?: string;
      };
      entitiesValues: {
        [x: string]: unknown;
      };
    };

    expectTypeOf(entity).toEqualTypeOf<{
      name: "text";
      attributes: readonly Attribute[];
      valueAllowed: boolean;
      childrenAllowed: false;
      parentRequired: false;
      attributesExtensions: AttributesExtensions<
        Entity<"text", readonly Attribute[], unknown, boolean, boolean>
      >;
      validate: (value: unknown, context: EntityContext) => string;
      defaultValue: (context: EntityContext) => string | undefined;
      shouldBeProcessed: (context: EntityContext) => boolean;
    }>();
  });

  it("can be created with attributes", () => {
    const entity = createEntity({
      name: "text",
      validate(value) {
        return z.string().parse(value);
      },
      childrenAllowed: true,
      parentRequired: true,
      attributes: [
        createAttribute({
          name: "label",
          validate(value) {
            return z.string().parse(value);
          },
        }),
        createAttribute({
          name: "defaultValue",
          validate(value) {
            return z.string().optional().parse(value);
          },
        }),
      ],
      defaultValue({ entity }) {
        return entity.attributes.defaultValue;
      },
    });

    type EntityContext = {
      entity: {
        id: string;
        attributes: { label: string; defaultValue: string | undefined };
        children?: Array<string>;
        parentId?: string;
      };
      entitiesValues: Record<string, unknown>;
    };

    expectTypeOf(entity).toEqualTypeOf<{
      name: "text";
      attributes: readonly [
        Attribute<"label", string>,
        Attribute<"defaultValue", string | undefined>,
      ];
      attributesExtensions: AttributesExtensions<
        Entity<
          "text",
          readonly [
            Attribute<"label", string>,
            Attribute<"defaultValue", string | undefined>,
          ],
          unknown,
          boolean,
          boolean
        >
      >;
      valueAllowed: boolean;
      childrenAllowed: true;
      parentRequired: true;
      validate: (value: unknown, context: EntityContext) => string;
      defaultValue: (context: EntityContext) => string | undefined;
      shouldBeProcessed: (context: EntityContext) => boolean;
    }>();
  });
});
