import { compress,CompressOptions  } from "../src";
import {Pane} from 'tweakpane';

const pane = new Pane();

const defaultConfig: CompressOptions = {
    useWebp: true,
    quality: 0.90,
    fileSizeLimit: 30,
    lenSizeLimit: 8192
}

// 添加一个图片上传按钮
const input = document.createElement("input");
input.type = "file";
input.accept = "image/*";
input.multiple = true;


pane.addBinding(defaultConfig, 'useWebp', { label: 'useWebp' });
pane.addBinding(defaultConfig, 'quality', { label: 'quality', min: 0, max: 1 });
pane.addBinding(defaultConfig, 'fileSizeLimit', { label: 'fileSizeLimit', min: 1, max: 100 });
pane.addBinding(defaultConfig, 'lenSizeLimit', { label: 'lenSizeLimit', min: 1000, max: 16383 });
pane.addButton({ title: 'upload for compress' }).on('click', () => {
    input.click();
})



const container = document.createElement("div");
container.style.display = "flex";
document.body.appendChild(container);

input.onchange = async (): Promise<void> => {
    try {
        console.time("compress");
        if (!input.files) return;
        const blobs = await compress(input.files, defaultConfig);
        console.timeEnd("compress");
        // 下载 blob
        for (let i = 0; i < blobs.length; i++) {
            const blob = blobs[i];
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `compressed-${i + 1}.${blob.type.split("/")[1]}`;
            a.textContent = `download`;
            const div = document.createElement("div");
            const img = document.createElement("img");
            img.src = url;
            img.style.maxWidth = "100px";
            img.style.maxHeight = "100px";
            div.appendChild(img);
            div.appendChild(a);
            container.appendChild(div);
        }
    } catch (error) {
        console.error("压缩失败", error);
    }
};

// 页面流畅性检测
let time = new Date().getTime();
const show = () => {
    const cur = new Date().getTime();
    const timeDiff = cur - time;
    if (timeDiff > 1000) {
        console.log("time:", timeDiff);
    }
    time = cur;
    requestAnimationFrame(show);
};
show();
