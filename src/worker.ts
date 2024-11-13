import { compressImg, type CompressOptions } from "./compress";

// 定义消息事件的数据类型
interface CompressMessage {
    file: File;
    options?: CompressOptions;
}

self.onmessage = (event: MessageEvent<CompressMessage>) => {
    const { file, options } = event.data;
    compressImg(file, options).then(result => {
        self.postMessage(result);
    });
};
