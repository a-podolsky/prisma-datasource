import { PrismaClient } from '@prisma/client';
import { DataSource } from 'apollo-datasource';
import { KeyValueCache } from 'apollo-server-caching';
import * as crypto from 'crypto';
import { MiddlewareParams, CacheQuery } from "./types";

export class PrismaDataSource extends DataSource {
  public prisma: PrismaClient;
  context: Object | undefined;
  cache: KeyValueCache | undefined;
  ttlDefault: number;
  isInitialized: boolean = false;

  constructor(prismaClient: PrismaClient, defaultCacheTtl: number = 10) {
    super();
    this.ttlDefault = defaultCacheTtl;
    this.prisma = prismaClient;
  }

  async initialize(config: { context: Object | undefined; cache: KeyValueCache | undefined; }) {
    this.context = config.context;
    this.cache = config.cache;

    if (!this.isInitialized && this.cache) {
      let result;
      this.prisma.$use(async (params: MiddlewareParams, next: <T>(params: MiddlewareParams) => Promise<T>) => {
        const { cache, ...query }: { cache: CacheQuery | undefined, query: unknown } = params.args;
        delete params.args.cache;

        if ( cache !== undefined) {
          const queryHash = this.createHash({
            [params.model]: {
              [params.action]: query,
            }
          });
          const cachedData = await this.getCache(queryHash);

          if (cachedData) {
            return JSON.parse(cachedData);
          }
          result = await next(params);
          this.cache?.set(queryHash, JSON.stringify(result), { ttl: cache.ttl ?? this.ttlDefault });
        } else {
          result = await next(params);
        }

        return result;
      });
    }
  }

  createHash(query: any): string {
    return crypto.createHash('sha1').update(JSON.stringify(query)).digest('base64');
  }

  async getCache(key: string) {
    return this.cache?.get(key);
  }
}
