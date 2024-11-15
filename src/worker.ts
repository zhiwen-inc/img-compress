import { compressImg } from "./compress";

// compressImg 的参数
export type CompressMessage = Parameters<typeof compressImg>;

self.onmessage = (event: MessageEvent<CompressMessage>) => {
    const [file, options] = event.data;
    compressImg(file, options).then(result => {
        self.postMessage(result);
    });
};

export interface MyWorkerType extends Worker {
    postMessage(message: CompressMessage, transfer?: Transferable[]): void;
    postMessage(message: CompressMessage, options?: StructuredSerializeOptions): void;
    postMessage(message: CompressMessage, transfer?: Transferable[] | StructuredSerializeOptions): void;
}
