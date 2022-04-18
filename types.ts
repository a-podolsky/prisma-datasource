export type PrismaQueryAction =
    | 'findUnique'
    | 'findFirst'
    | 'findMany'
    | 'findRaw'
    | 'aggregate'
    | 'aggregateRaw'
    | 'count'
    | 'groupBy';

export type PrismaMutationAction =
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRawUnsafe';

export type MiddlewareParams = {
  model: string;
  action: PrismaQueryAction | PrismaMutationAction;
  args: any;
  dataPath: string[];
  runInTransaction: boolean;
};

export type CacheQuery = {
  ttl: number,
}
