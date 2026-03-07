import { logDebug as _ulogDebug, logError as _ulogError } from '@/lib/logging/core'
import Redis from 'ioredis'

type RedisSingleton = {
  app?: Redis
  queue?: Redis
}

const globalForRedis = globalThis as typeof globalThis & {
  __waoowaooRedis?: RedisSingleton
}

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_PORT = Number.parseInt(process.env.REDIS_PORT || '6379', 10) || 6379
const REDIS_USERNAME = process.env.REDIS_USERNAME
const REDIS_PASSWORD = process.env.REDIS_PASSWORD
const REDIS_TLS = process.env.REDIS_TLS === 'true'
const IS_TEST_ENV = process.env.NODE_ENV === 'test'

function buildBaseConfig() {
  return {
    host: REDIS_HOST,
    port: REDIS_PORT,
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    tls: REDIS_TLS ? {} : undefined,
    enableReadyCheck: true,
    lazyConnect: IS_TEST_ENV,
    retryStrategy(times: number) {
      // Exponential backoff capped at 30s.
      return Math.min(2 ** Math.min(times, 10) * 100, 30_000)
    },
  }
}

function onConnectLog(scope: string, client: Redis) {
  client.on('connect', () => _ulogDebug(`[Redis:${scope}] connected ${REDIS_HOST}:${REDIS_PORT}`))
  client.on('error', (err) => _ulogError(`[Redis:${scope}] error:`, err.message))
}

function createAppRedis() {
  const client = new Redis({
    ...buildBaseConfig(),
    maxRetriesPerRequest: 2,
  })
  onConnectLog('app', client)
  return client
}

function createQueueRedis() {
  const client = new Redis({
    ...buildBaseConfig(),
    // BullMQ requires null to avoid command retry side effects.
    maxRetriesPerRequest: null,
  })
  onConnectLog('queue', client)
  return client
}

type MinimalRedisClient = Pick<
  Redis,
  'on' | 'publish' | 'subscribe' | 'unsubscribe' | 'quit' | 'disconnect'
>

function createNoopRedis(scope: 'app' | 'queue' | 'sub'): Redis {
  const noopClient: MinimalRedisClient = {
    on() {
      return noopClient as Redis
    },
    async publish() {
      return 0
    },
    async subscribe() {
      return 0
    },
    async unsubscribe() {
      return 0
    },
    async quit() {
      return 'OK'
    },
    disconnect() {
      return undefined as unknown as Redis
    },
  }

  _ulogInfo(`[Redis:${scope}] build phase detected, using noop client`)
  return noopClient as Redis
}

const singleton = globalForRedis.__waoowaooRedis || {}
if (!globalForRedis.__waoowaooRedis) {
  globalForRedis.__waoowaooRedis = singleton
}

export const redis = singleton.app || (singleton.app = IS_BUILD_PHASE ? createNoopRedis('app') : createAppRedis())
export const queueRedis = singleton.queue
  || (singleton.queue = IS_BUILD_PHASE ? createNoopRedis('queue') : createQueueRedis())

export function createSubscriber() {
  if (IS_BUILD_PHASE) {
    return createNoopRedis('sub')
  }
  const client = new Redis({
    ...buildBaseConfig(),
    maxRetriesPerRequest: null,
  })
  onConnectLog('sub', client)
  return client
}
