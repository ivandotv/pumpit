/**
 * Demo function for template repository
 *
 * @remarks
 * Read more about TSDoc at: {@link https://github.com/microsoft/tsdoc}
 *
 * @param name - Demo name
 * @returns Nothing!
 *
 * @beta
 */
export function demo(): void {
  if (__DEV__) {
    console.log('this should only log in development build')
  }
  console.log(__VERSION__)
}
demo()
