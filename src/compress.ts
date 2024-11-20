/**
 * there is a size limit for canvas, the max size is 2^28, and the max length is 2^15 - 1
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas
 */
const MaxArea = 2 ** 28;
/**
 * there is a size limit for canvas, the max size is 2^28, and the max length is 2^15 - 1
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas
 */
const MaxLen = 2 ** 15;

export interface CompressOptions {
    /**
     * 限制图片体积大小限制，单位 Mb
     * @default 30
     */
    fileSizeLimit?: number;

    /**
     * 图片尺寸限制，单位 px
     * @default 8192
     */
    lenSizeLimit?: number;

    /**
     * 压缩质量
     * @default 0.8
     */
    quality?: number;

    /**
     * 是否使用 webp 格式
     */
    useWebp?: boolean;
}

export async function compressImg(file: File, options?: CompressOptions): Promise<Blob> {
    const { type } = file;
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    let { quality = 0.8, lenSizeLimit = 8192, fileSizeLimit: FileSizeLimit = 30, useWebp = true } = options || {};
    const format = useWebp ? 'image/webp' : type;
    /**max size 最大文件体积 */
    const mSize = FileSizeLimit << 20;
    const area = width * height;

    /**max len 最大尺寸 */
    const mLen = Math.min(lenSizeLimit, MaxLen);
    let scale = 1;
    if (area > MaxArea || width > lenSizeLimit || height > lenSizeLimit) {
        scale = Math.min(Math.sqrt(MaxArea / area), mLen / width, mLen / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    ctx.drawImage(bitmap, 0, 0);

    let blob: Blob;
    do {
        blob = await canvas.convertToBlob({ type: format, quality });
        // bold size 越大，质量越差
        quality *= (mSize / blob.size - 0.1);
    }
    while (blob.size > mSize && quality > 0.1);
    return blob;
}