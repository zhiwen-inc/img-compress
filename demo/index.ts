import { compress } from "../src";


// 添加一个图片上传按钮
const input = document.createElement('input');
input.style.position = 'absolute';
input.style.top = '300px';
input.type = 'file';
input.accept = 'image/*';
input.multiple = true;
document.body.appendChild(input);

input.onchange = async (): Promise<void> => {
    try {
        console.time('compress');

        if (!input.files) return;
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

