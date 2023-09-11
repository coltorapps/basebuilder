import { type Builder, type BuilderEntities } from "./builder";

export function getEntitiesNamesExcept<
  const TEntities extends BuilderEntities,
  const TExcludeName extends ReadonlyArray<TEntities[number]["name"]>,
>(
  entities: TEntities,
  excludeName: TExcludeName,
): ReadonlyArray<Exclude<TEntities[number]["name"], TExcludeName[number]>> {
  const filteredEntities = entities.filter(function (entity): entity is {
    name: Exclude<TEntities[number]["name"], TExcludeName[number]>;
    inputs: [];
    meta: NonNullable<unknown>;
    isValueAllowed: boolean;
    validate: () => unknown;
    defaultValue: () => unknown;
    shouldBeProcessed: () => boolean;
  } {
    return !excludeName.includes(entity.name);
  });

  if (filteredEntities.length === entities.length) {
    throw new Error(`No such entity "${excludeName}".`);
  }

  return filteredEntities.map((entity) => entity.name);
}

export function insertIntoSetAtIndex<T>(
  set: Set<T>,
  value: T,
  index?: number,
): Set<T> {
  const result = Array.from(set);

  result.splice(index ?? set.size, 0, value);

  return new Set(result);
}

export function getEntityDefinition(
  entityType: string,
  builder: Builder,
): Builder["entities"][number] | undefined {
  return builder.entities.find(
    (builderEntity) => builderEntity.name === entityType,
  );
}

type UndefinedKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

type NonUndefinedKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K;
}[keyof T];

export type OptionalPropsIfUndefined<T> = {
  [K in UndefinedKeys<T>]?: T[K];
} & {
  [K in NonUndefinedKeys<T>]: T[K];
};
