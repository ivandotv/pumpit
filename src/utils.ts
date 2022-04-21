export function get(
  key: string,
  options?: {
    optional?: boolean
  }
): any {
  return () => {
    return {
      key,
      options
    }
  }
}

export function normalizeGet(
  key: string | (() => { key: string; options?: { optional?: boolean } })
): { key: string; options?: { optional?: boolean } } {
  if (typeof key === 'string') {
    return { key }
  }
  const ex = key()

  return {
    key: ex.key,
    options: ex.options
  }
}

export class Cache<T = any> {
  protected cache: Map<string, T> = new Map()

  set(key: string, value: T): boolean {
    const dataHit = this.cache.get(key)

    if (!dataHit) {
      this.cache.set(key, value)

      return true
    }

    return false
  }

  get(key: string): T | undefined {
    return this.cache.get(key)
  }
}
