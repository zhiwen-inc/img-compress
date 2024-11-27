/**
 * there is a size limit for canvas, the max size is 2^28, and the max length is 2^15 - 1
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas
 */
const MaxArea = 2 ** 28;
/**
 * there is a size limit for canvas, the max size is 2^28, and the max length is 2^15 - 1
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas
 */
const MaxLen = 2 ** 15 - 1;

export interface CompressOptions {
    /**
     * 限制图片体积大小限制，单位 Mb
     * @default 30
     */
    fileSizeLimit?: number;

    /**
     * 图片尺寸限制，单位 px，不应超过浏览器上限 16383
     * @default 8192
     */
    lenSizeLimit?: number;

    /**
     * 压缩质量
     * @default 0.9
     */
    quality?: number;

    /**
     * 是否使用 webp 格式
     * @default true
     */
    useWebp?: boolean;
}

const canvas = new OffscreenCanvas(1, 1);
export async function compressImg(file: Blob, options?: CompressOptions): Promise<Blob> {
    const { type: originType, size: originSize } = file;
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    let { quality = 0.9, lenSizeLimit = 8192, fileSizeLimit = 30, useWebp = true } = options || {};

    let type = useWebp ? "image/webp" : "image/jpeg";
    /**max size 最大文件体积 */
    const mSize = fileSizeLimit << 20;
    const area = width * height;

    /**max len 最大尺寸 */
    const mLen = Math.min(lenSizeLimit, MaxLen);
    // jpg 直接缩放尺寸
    let scale = originType === "image/jpeg" ? Math.sqrt(mSize / originSize) : 1;
    if (area * scale * scale > MaxArea || width * scale > mLen || height * scale > mLen) {
        scale = Math.min(Math.sqrt(MaxArea / area), mLen / width, mLen / height);
    }

    let blob: Blob;
    do {
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.scale(scale, scale);
        ctx.drawImage(bitmap, 0, 0);
        blob = await canvas.convertToBlob({ type, quality });
        // bold size 越大，质量越差
        scale *= Math.sqrt(mSize / blob.size);
    } while (blob.size > mSize);
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
    return blob;
}
