import { type Attribute, type AttributesValues } from "./attribute";
import { type Builder } from "./builder";
import { type Schema, type SchemaEntityWithId } from "./schema";

type EntityContext<TAttributes extends ReadonlyArray<Attribute>> = {
  entity: {
    id: string;
    attributes: AttributesValues<TAttributes>;
  };
  entitiesValues: Record<string, unknown>;
};

export type AttributesExtensions<TEntity extends Entity = Entity> = {
  [K in TEntity["attributes"][number]["name"]]?: {
    validate?: (
      value: unknown,
      context: {
        schema: Schema;
        entity: SchemaEntityWithId<Builder<[TEntity]>>;
        validate: (
          value: unknown,
        ) => ReturnType<
          Extract<TEntity["attributes"][number], { name: K }>["validate"]
        >;
      },
    ) =>
      | AttributesValues<TEntity["attributes"]>[K]
      | Promise<AttributesValues<TEntity["attributes"]>[K]>;
  };
};

export type Entity<
  TName extends string = string,
  TAttributes extends ReadonlyArray<Attribute> = ReadonlyArray<Attribute>,
  TValue = unknown,
  TParentRequired extends boolean = boolean,
  TChildrenAllowed extends boolean = boolean,
> = {
  name: TName;
  attributes: TAttributes;
  valueAllowed: boolean;
  childrenAllowed: TChildrenAllowed;
  parentRequired: TParentRequired;
  attributesExtensions?: AttributesExtensions<Entity<TName, TAttributes>>;
  validate: (value: unknown, context: EntityContext<TAttributes>) => TValue;
  defaultValue: (
    context: EntityContext<TAttributes>,
  ) => Awaited<TValue> | undefined;
  shouldBeProcessed: (context: EntityContext<TAttributes>) => boolean;
};

type OptionalEntityArgs =
  | "attributes"
  | "validate"
  | "defaultValue"
  | "shouldBeProcessed"
  | "childrenAllowed"
  | "parentRequired"
  | "valueAllowed";

export function createEntity<
  const TName extends string,
  const TAttributes extends ReadonlyArray<Attribute>,
  TValue,
  const TChildrenAllowed extends boolean = false,
  const TParentRequired extends boolean = false,
>(
  options: Omit<
    Entity<TName, TAttributes, TValue, TParentRequired, TChildrenAllowed>,
    OptionalEntityArgs
  > &
    Partial<
      Pick<
        Entity<TName, TAttributes, TValue, TParentRequired, TChildrenAllowed>,
        OptionalEntityArgs
      >
    >,
): Entity<TName, TAttributes, TValue, TParentRequired, TChildrenAllowed> {
  const fallbackAttributes = [] as ReadonlyArray<unknown> as TAttributes;

  function fallbackValidator(value: unknown): TValue {
    if (typeof value !== "undefined") {
      throw new Error(
        `Values for entities of type '${options.name}' are not allowed.`,
      );
    }

    return undefined as TValue;
  }

  function fallbackDefaultValue(): undefined {
    return undefined;
  }

  function fallbackShouldBeProcessed(): boolean {
    return true;
  }

  return {
    ...options,
    childrenAllowed: options.childrenAllowed ?? (false as TChildrenAllowed),
    parentRequired: options.parentRequired ?? (false as TParentRequired),
    attributes: options.attributes ?? fallbackAttributes,
    valueAllowed: typeof options.validate === "function",
    validate: options.validate ?? fallbackValidator,
    defaultValue: options.defaultValue ?? fallbackDefaultValue,
    shouldBeProcessed: options.shouldBeProcessed ?? fallbackShouldBeProcessed,
  };
}
