import { type Builder, type BuilderEntities } from "./builder";
import { createDataManager } from "./data-manager";
import { type InputsValues } from "./input";
import { validateSchema } from "./store-validation";
import { type Subscribe } from "./subscription-manager";
import { type OptionalPropsIfUndefined } from "./utils";

export type StoreEntity<TBuilder extends BaseBuilder = BaseBuilder> = {
  [K in TBuilder["entities"][number]["name"]]: {
    type: K;
    inputs: OptionalPropsIfUndefined<
      InputsValues<Extract<TBuilder["entities"][number], { name: K }>["inputs"]>
    >;
  };
}[TBuilder["entities"][number]["name"]];

type EntityMutationFields = {
  index?: number;
  parentId?: string;
};

type NewEntity<TBuilder extends BaseBuilder> = StoreEntity<TBuilder> &
  EntityMutationFields;

export type ComputedStoreEntity<TBuilder extends BaseBuilder> =
  StoreEntity<TBuilder> & { id: string; parentId?: string };

export interface StoreData<TBuilder extends BaseBuilder> {
  entities: Map<string, StoreEntity<TBuilder>>;
  root: Set<string>;
}

export interface Store<TBuilder extends BaseBuilder> {
  builder: TBuilder;
  getData(): StoreData<TBuilder>;
  subscribe: Subscribe<StoreData<TBuilder>>;
  addEntity(entity: NewEntity<TBuilder>): void;
  getSchema(): Schema<TBuilder>;
}

export type BaseBuilder = Builder<
  BuilderEntities,
  Record<string, true | ReadonlyArray<string> | undefined>,
  ReadonlyArray<string>
>;

export interface Schema<TBuilder extends BaseBuilder = BaseBuilder> {
  entities: Record<string, StoreEntity<TBuilder>>;
  root: string[];
}

function transformStoreDataToSchema<TBuilder extends BaseBuilder>(
  data: StoreData<TBuilder>,
): Schema<TBuilder> {
  return {
    root: Array.from(data.root),
    entities: Object.fromEntries(data.entities),
  };
}

export function createStore<TBuilder extends BaseBuilder>(
  builder: TBuilder,
  schema: Schema<TBuilder>,
): Store<TBuilder> {
  const validatedSchema = validateSchema(schema, builder);

  const { getData, setData, subscribe } = createDataManager<
    StoreData<TBuilder>
  >({
    entities: new Map(Object.entries(validatedSchema.entities)),
    root: new Set(validatedSchema.root),
  });

  return {
    builder,
    getData,
    subscribe,
    getSchema() {
      return validateSchema(transformStoreDataToSchema(getData()), builder);
    },
    addEntity(newEntity) {
      setData((data) => {
        const newData = {
          ...data,
          entities: new Map(data.entities).set(
            builder.entityId.generate(),
            newEntity,
          ),
        };

        validateSchema(transformStoreDataToSchema(newData), builder);

        return newData;
      });
    },
  };
}
