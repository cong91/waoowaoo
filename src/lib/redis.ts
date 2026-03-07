import { logInfo as _ulogInfo, logError as _ulogError } from '@/lib/logging/core'
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
const IS_BUILD_PHASE =
  process.env.NEXT_PHASE === 'phase-production-build'
  || process.env.npm_lifecycle_event === 'build'
  || process.env.npm_lifecycle_event === 'build:turbo'

function isRedisAuthError(message: string): boolean {
  const normalized = message.toLowerCase()
  return normalized.includes('noauth') || normalized.includes('authentication required')
}

export function shouldSkipRedisInBuild() {
  return IS_BUILD_PHASE
}

export function shouldSuppressRedisErrorInBuild(error: unknown) {
  if (!IS_BUILD_PHASE) return false
  const message = error instanceof Error ? error.message : String(error || '')
  return isRedisAuthError(message)
}

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
  client.on('connect', () => _ulogInfo(`[Redis:${scope}] connected ${REDIS_HOST}:${REDIS_PORT}`))
  client.on('error', (err) => {
    const message = err?.message || 'unknown redis error'
    if (IS_BUILD_PHASE && isRedisAuthError(message)) {
      _ulogInfo(`[Redis:${scope}] auth unavailable during build phase, skip noisy warning`)
      return
    }
    _ulogError(`[Redis:${scope}] error:`, message)
  })
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

const singleton = globalForRedis.__waoowaooRedis || {}
if (!globalForRedis.__waoowaooRedis) {
  globalForRedis.__waoowaooRedis = singleton
}

export const redis = singleton.app || (singleton.app = createAppRedis())
export const queueRedis = singleton.queue || (singleton.queue = createQueueRedis())

export function createSubscriber() {
  const client = new Redis({
    ...buildBaseConfig(),
    maxRetriesPerRequest: null,
  })
  onConnectLog('sub', client)
  return client
}
