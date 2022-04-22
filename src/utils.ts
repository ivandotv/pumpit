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
