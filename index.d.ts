export declare function compress(files: FileList | File[], options?: CompressOptions): Promise<Blob[]>;

declare interface CompressOptions {
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

export { }
