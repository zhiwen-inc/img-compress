import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
    if (mode === 'lib') {
        return {
            build: {
                lib: {
                    entry: 'src/index.ts',
                    name: 'index',
                    formats: ['es'],
                    fileName: `index`
                },
            },
            plugins: [dts({ rollupTypes: true })]
        };
    }
    // dev
    return {};
});
