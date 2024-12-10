/**
 * there is a size limit for canvas, the max size is 2^28, and the max length is 2^15 - 1
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas
 */
const MaxArea = 1 << 28;
/**
 * there is a size limit for canvas, the max size is 2^28, and the max length is 2^15 - 1
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas
 */
const MaxLen = (1 << 15) - 1;

export interface CompressOptions {
    /**
     * 限制图片体积大小限制，单位 Mb
     * @default 30
     */
    fileSizeLimit?: number;

    /**
     * 图片尺寸限制，单位 px，不应超过浏览器上限 32767
     * @default 8196
     */
    lenSizeLimit?: number;

    /**
     * 像素限制
     * @default 268,435,456
     */
    pixelSizeLimit?: number;

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
export async function compressImg(originBlob: Blob, options?: CompressOptions): Promise<Blob> {
    const { type: originType, size: originSize } = originBlob;
    const { quality = 0.9, lenSizeLimit = 1 << 13, pixelSizeLimit = 1 << 26, fileSizeLimit = 30, useWebp = true } = options || {};

    const bitmap = await createImageBitmap(originBlob);
    // originBlob = null as any;
    const { width, height } = bitmap;

    const needCompress = originSize > fileSizeLimit << 20 || width * height > pixelSizeLimit || width > lenSizeLimit || height > lenSizeLimit;
    if (!needCompress) return originBlob;

    const type = useWebp ? "image/webp" : "image/jpeg";
    /**max size 最大文件体积 */
    const mSize = fileSizeLimit << 20;
    const area = width * height;

    /**max len 最大尺寸 */
    const mLen = Math.min(lenSizeLimit, MaxLen);

    const mArea = Math.min(pixelSizeLimit, MaxArea);
    // jpg 直接缩放尺寸
    let scale = originType === "image/jpeg" ? Math.sqrt(mSize / originSize) : 1;
    if (area * scale * scale > mArea || width * scale > mLen || height * scale > mLen) {
        scale = Math.min(Math.sqrt(mArea / area), mLen / width, mLen / height);
    }

    let blob: Blob | null = null;
    do {
        const w = Math.floor(width * scale);
        const h = Math.floor(height * scale);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", {
            willReadFrequently: false,
            alpha: type === "image/webp",
        })!;
        // 会略微降低一点性能
        // ctx.imageSmoothingQuality = "high";
        ctx.scale(scale, scale);
        ctx.drawImage(bitmap, 0, 0);
        try {
            blob = await canvas.convertToBlob({ type, quality });
        } catch (e) {
            console.warn("error", e);
            blob = { size: mSize << 2 } as Blob;
        }
        scale *= Math.sqrt(mSize / blob.size);
        // bold size 越大，质量越差
    } while (blob.size > mSize);

    // 释放 bitmap 对象
    bitmap.close();
    // 释放 canvas 对象
    canvas.width = 0;
    canvas.height = 0;
    return blob;
}
