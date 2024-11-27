import { type CompressOptions } from "./compress";
import MyWorker from "./worker?worker&inline";

class WorkerPool {
    size: number;
    workers?: Worker[];
    queue: { file: Blob; options?: CompressOptions; resolve: (value: Blob | PromiseLike<Blob>) => void }[];
    timer?: number;

    constructor(size: number) {
        this.size = size;
        this.queue = [];
    }

    init() {
        this.workers = new Array(this.size);
        for (let i = 0; i < this.size; i++) {
            this.workers[i] = new MyWorker();
        }
    }

    resetTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.terminateAllWorkers();
        }, 60000); // 1 minute
    }

    terminateAllWorkers() {
        this.workers?.forEach((worker) => {
            worker.terminate();
        });
        this.workers = undefined;
        this.timer = undefined;
    }

    async runCompress(file: Blob, options?: CompressOptions) {
        this.resetTimer();
        if (this.workers === undefined) {
            this.init();
        }
        const workers = this.workers!;
        if (!file.type.startsWith("image/")) {
            throw new Error("only image support");
        }
        const { fileSizeLimit: FileSizeLimit = 30 } = options || {};
        // 小于 30Mb 的图片不压缩
        if (file.size <= FileSizeLimit << 20) {
            return file;
        }
        const promise = new Promise<Blob>((resolve, reject) => {
            // 线程不够用，将任务放入队列
            if (workers.length <= 0) {
                this.queue.push({ file, options, resolve });
                return;
            }
            // 有线程可用
            const worker = workers.pop()!;
            worker.onmessage = (e) => {
                // 线程执行完毕，将线程放回线程池
                resolve(e.data);
                workers.push(worker);
                // 如果队列中还有任务，继续执行
                if (this.queue.length > 0) {
                    const { file, options, resolve } = this.queue.shift()!;
                    resolve(this.runCompress(file, options));
                }
            };
            worker.onerror = (error) => {
                reject(error);
                worker.terminate();
            };
            // TransferAble 对性能提升有限，而两边直接使用都是 blob, 所以不使用 TransferAble ArrayBuffer
            worker.postMessage([file, options]);
        });
        return promise;
    }
}

// @ts-ignore 获取硬件 内存大小 并发性（CPU 核心数）
const { deviceMemory = 8, hardwareConcurrency } = navigator;
const count = Math.min(hardwareConcurrency, deviceMemory, 8);

/**CompressEngine */
const CEngine = new WorkerPool(count);

export default CEngine;

export type { CompressOptions };
