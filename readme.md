# img compress

- use web worker
- use webp format
- limit file size
- limit img width and height

## how to use

### Installation

```ts
import { compress } from "img-compress";

const inputElement = document.querySelector('input[type="file"]');
inputElement.addEventListener("change", async (event) => {
  const files = event.target.files;
  const options = {
    FileSizeLimit: 30, // in MB
    // other options...
  };
  try {
    const compressedFiles = await compress(files, options);
    // handle compressed files
  } catch (error) {
    console.error("Compression error:", error);
  }
});
```
