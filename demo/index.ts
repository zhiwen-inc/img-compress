import { compress } from "../src";

// 添加一个图片上传按钮
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.multiple = true;
document.body.appendChild(input);

const container = document.createElement('div');
document.body.appendChild(container);

input.onchange = async (): Promise<void> => {
    try {
        console.time('compress');

        if (!input.files) return;
        const blobs = await compress(input.files);
        console.timeEnd('compress');
        // 显示成功
        document.body.append("压缩成功");
        // 下载 blob
        for (let i = 0; i < blobs.length; i++) {
            const blob = blobs[i];
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed-${i}.webp`;
            a.textContent = `下载-${i + 1}`;
            container.appendChild(a);
        }
    } catch (error) {
        console.error('压缩失败', error);
    }
}

// 页面流畅性检测
let time = new Date().getTime();
const show = () => {
    const cur = new Date().getTime();
    const timeDiff = cur - time;
    if (timeDiff > 1000) {
        console.log('time:', timeDiff);
    }
    time = cur;
    requestAnimationFrame(show)
}
show();

