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

export async function compressImg(file: File, options?: CompressOptions): Promise<Blob> {
    // const { type: originType, size: originSize } = file;
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    let { quality = 0.9, lenSizeLimit = 8192, fileSizeLimit = 30, useWebp = true } = options || {};
    /**计算图片解码后的理论大小 */
    // const deComposedSize  = width * height * 4;
    /**计算原本的压缩比 */
    // const originCompressRate = originSize / deComposedSize;
    // const isQualityOptimized = originCompressRate < 0.5;

    // let isTypeOptimized = false;
    // let isSizeOptimized = false;
    /**如果原本的压缩比小于 0.5，说明图片已经被压缩过，不再通过降低质量压缩，而是类型 和 尺寸 */
    // if (isQualityOptimized) {
    //     isTypeOptimized = true;
    //     isSizeOptimized = true;
    // }
    /**计算还需压缩多少 */
    // const remainSize = originSize / (fileSizeLimit << 20);

    let type = useWebp ? "image/webp" : "image/jpeg";
    /**max size 最大文件体积 */
    const mSize = fileSizeLimit << 20;
    const area = width * height;

    /**max len 最大尺寸 */
    const mLen = Math.min(lenSizeLimit, MaxLen);
    let scale = 1;
    if (area > MaxArea || width > lenSizeLimit || height > lenSizeLimit) {
        scale = Math.min(Math.sqrt(MaxArea / area), mLen / width, mLen / height);
    }

    let blob: Blob;
    do {
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d")!;
        ctx.scale(scale, scale);
        ctx.drawImage(bitmap, 0, 0);
        blob = await canvas.convertToBlob({ type, quality });
        // bold size 越大，质量越差
        scale *= Math.sqrt(mSize / blob.size);
    } while (blob.size > mSize && quality > 0.1);
    return blob;
}
