const types = {
  value: 'value',
  class: 'class',
  constructor: 'constructor'
} as const

type AvailableTypes = keyof typeof types

export class Pumpa {
  protected data: Map<
    string,
    Map<string | symbol, { value: any; type: AvailableTypes }>
  >

  protected defaultTag = Symbol()

  constructor() {
    //todo - move outside of constructor
    this.data = new Map()
  }

  protected addData(
    key: string,
    value: any,
    info: { type: AvailableTypes; tag?: string }
  ): void {
    const tag = info.tag || this.defaultTag

    const dataHit = this.data.get(key)

    if (dataHit) {
      //check for tag
      if (dataHit.get(tag)) {
        throw new Error(
          `Key: ${key} ${
            info?.tag ? `with tag: ${info.tag}` : ''
          } already exists`
        )
      } else {
        dataHit.set(tag, { ...info, value })
      }
    } else {
      //create value with default tag
      this.data.set(key, new Map().set(tag, { ...info, value }))
    }
  }

  bindValue(key: string, value: any, options?: { tag?: string }): this {
    this.addData(key, value, { ...options, type: types.value })

    return this
  }

  //TODO  maybeResolve -> which doesn't throw
  resolve<T>(key: string, options?: { tag?: string }): T {
    const tag = options?.tag ? options.tag : this.defaultTag
    const data = this.data.get(key)
    let resolvedValue
    if (data) {
      resolvedValue = data.get(tag)
    }
    if (!resolvedValue) {
      throw new Error(
        `Key: ${key} ${
          options?.tag ? `with tag: ${options.tag}` : ''
        } not found`
      )
    }

    const { type, value } = resolvedValue

    if (type === types.value) {
      // resolve immediately
      return value
    } else if (type === types.class) {
      //resolve class dependencies
    }
  }

  protected resolveDeps(keys: string[]): any[] {
    //TODO - throw if it canot be resolved
    const args = []
    for (const key of keys) {
      const value = this.data.get(key)
      if (value) {
        args.push(value.get(this.defaultTag)?.value)
      } else {
        //throw cannot resolve value
        throw new Error('cannot resolve value')
      }
    }

    return args
  }

  //   has(key: string, options?: { tag?: string })

  createInstance<T>(clazz: new (...args: any[]) => T): T {
    // @ts-expect-error  https://stackoverflow.com/a/65847601/1489487
    const deps: any[] = clazz.inject
    if (!deps) {
      throw new Error('no inject') // or warn
    }

    // otherwise resolve
    const resolvedDeps = this.resolveDeps(deps)

    return new clazz(...resolvedDeps)
  }
}
