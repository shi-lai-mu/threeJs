declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'makeit-captcha' {
  const makeitCaptcha: any
  export default makeitCaptcha
}

declare module 'spectorjs' {
  export const Spector: any
}


declare module '*.glsl' {
  const glsl: string
  export default glsl
}
