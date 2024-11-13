import { type CompressOptions } from './compress';
import MyWorker from './worker?worker';

export async function compress(files: FileList | File[], options?: CompressOptions): Promise<Blob[]> {
    const promises: Promise<Blob>[] = new Array();
    for (const file of files) {
        const promise = new Promise<Blob>((resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                throw new Error('只支持图片压缩');
            }
            // 小于 30Mb 的图片不压缩
            if (file.size <= 30 << 20) {
                resolve(file);
                return;
            }
            const worker = new MyWorker;
            worker.onmessage = (event) => {
                resolve(event.data);
                worker.terminate();
            };
            worker.onerror = (error) => {
                reject(error);
                worker.terminate();
            };
            worker.postMessage({ file, options });
        });
        promises.push(promise);
    }
    return Promise.all(promises);
}