/**
 * there is a size limit for canvas, the max size is 2^28, and the max length is 2^15 - 1
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas
 */
const maxArea = 2 ** 26;
/**
 * 8096
 */
const maxLen = 2 ** 13;

const format = 'image/webp';

export interface CompressOptions {
    /**
     * 限制图片大小，单位 Mb
     * @default 30
     */
    sizeLimit?: number;
    /**
     * 压缩质量
     * @default 0.7
     */
    quality?: number;
}

export async function compressImg(file: File, options?: CompressOptions): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    const area = width * height;
    let scale = 1;
    if (area > maxArea || width > maxLen || height > maxLen) {
        scale = Math.min(Math.sqrt(maxArea / area), maxLen / width, maxLen / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    ctx.drawImage(bitmap, 0, 0);

    const { quality = 0.8 } = options || {};
    const blob = await canvas.convertToBlob({ type: format, quality });
    return blob;
}