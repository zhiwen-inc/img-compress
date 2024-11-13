import { compress } from "../src";
import { setupCounter } from "./counter";
// 添加一个图片上传按钮
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.multiple = true;
input.onchange = async (): Promise<void> => {
    console.log(input.files);
    if (!input.files) return;

    try {
        console.time('compress');
        const blobs = await compress(input.files);
        console.timeEnd('compress');
        // 显示成功
        document.body.append("压缩成功");
        // 下载 blob
        for (const blob of blobs) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed.webp';
            a.textContent = '下载';
            document.body.appendChild(a);
        }
    } catch (error) {
        console.error('压缩失败', error);
    }
}

document.body.appendChild(input);

// 添加一个基础计数按钮
const button = document.createElement('button');
setupCounter(button)
document.body.appendChild(button);