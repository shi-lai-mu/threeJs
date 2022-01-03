import { Texture, TextureLoader } from "three"


/**
 * 加载图片
 * @param taskLine 图片链接对象
 */
export const loaderTextureTask = <T, S = { [M in keyof T]: Texture }>(taskLine: T & Record<string, string>): S => {
    const loaderLine: Record<string, Texture> = {}
    Object.keys(taskLine).forEach(taskKey => {
        loaderLine[taskKey] = new TextureLoader().load((taskLine)[taskKey])
    })
    return loaderLine as unknown as S
}
