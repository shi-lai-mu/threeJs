import { Texture, TextureLoader } from "three"


/**
 * 加载图片
 * @param taskLine 图片链接对象
 */
export const loaderTextureTask = <T = any, S = { [M in keyof T]: Texture }>(taskLine: T): S => {
    const loaderLine: Record<string, Texture> = {}
    Object.keys(taskLine).forEach(taskKey => {
        loaderLine[taskKey] = new TextureLoader().load((taskLine as unknown as Record<string, string>)[taskKey])
    })
    return loaderLine as unknown as S
}
