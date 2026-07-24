import { defineConfig } from 'vite';
import { resolve } from 'path';

// 插件：将共享 chunk 内联到每个入口文件
function inlineSharedCode() {
    return {
        name: 'inline-shared-code',
        apply: 'build',
        enforce: 'post',
        generateBundle(_options, bundle) {
            // 找到入口文件和共享 chunk
            const entries = [];
            let sharedChunk = null;

            for (const [fileName, chunk] of Object.entries(bundle)) {
                if (chunk.type === 'chunk') {
                    if (chunk.isEntry) {
                        entries.push({ fileName, chunk });
                    } else if (!sharedChunk) {
                        sharedChunk = chunk;
                    }
                }
            }

            if (!sharedChunk || entries.length === 0) return;

            const sharedCode = sharedChunk.code;

            for (const { fileName, chunk } of entries) {
                // 匹配 import { ... } from "./common-xxxx.js";
                const importRegex = /^import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];\s*$/m;
                const match = chunk.code.match(importRegex);
                if (match) {
                    chunk.code = chunk.code.replace(match[0], '');
                }
                // 将共享代码前置
                chunk.code = sharedCode + '\n' + chunk.code;
            }

            // 删除共享 chunk
            delete bundle[sharedChunk.fileName];
        },
    };
}

export default defineConfig({
    plugins: [inlineSharedCode()],
    build: {
        lib: {
            entry: {
                'clash-overwrite': resolve(__dirname, 'src/clash-overwrite.js'),
                'clash-overwrite-simple': resolve(__dirname, 'src/clash-overwrite-simple.js'),
            },
            formats: ['es'],
            fileName: (format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
            external: [],
            output: {
                format: 'es',
            },
        },
        minify: false,
        sourcemap: false,
    },
});
