import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// ...existing code...

export default defineConfig(({ mode }) => {
    if (mode === 'lib') {
        return {
            build: {
                lib: {
                    entry: 'src/index.ts',
                    name: 'index',
                    fileName: (format) => `index.${format}.js`
                },
            },
            plugins: [dts({ rollupTypes: true })]
        };
    } else {
        return {
            build: {
                outDir: 'demo-dist',
                rollupOptions: {
                    input: 'demo/index.html'
                }
            }
        };
    }
});
