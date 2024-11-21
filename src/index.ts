import { type CompressOptions } from './compress';
import MyWorker from './worker?worker&inline';
import type { MyWorkerType } from './worker';

export async function compress(files: FileList | File[], options?: CompressOptions): Promise<Blob[]> {
    const promises: Promise<Blob>[] = new Array();
    for (const file of files) {
        const promise = new Promise<Blob>(async (resolve, reject) => {
            if (!file.type.startsWith('image/')) {
                throw new Error('只支持图片压缩');
            }
            const { fileSizeLimit: FileSizeLimit = 30 } = options || {};
            // 小于 30Mb 的图片不压缩
            if (file.size <= FileSizeLimit << 20) {
                resolve(file);
                return;
            }
            const worker: MyWorkerType = new MyWorker;
            worker.onmessage = (event) => {
                resolve(event.data);
                worker.terminate();
            };
            worker.onerror = (error) => {
                reject(error);
                worker.terminate();
            };

            // file 不是 Transferable 对象，传递成本较高，但如果使用 transferable arraybuffer, 因为增加了 file -> ArrayBuffer -> file 的转换，时间成本更高，好处是减少了 gc
            worker.postMessage([file, options]);
        });
        promises.push(promise);
    }
    return Promise.all(promises);
}