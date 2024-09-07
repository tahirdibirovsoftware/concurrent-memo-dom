import type { Plugin } from 'vite';
import { resolve } from 'path';
import fs from 'fs/promises';

export default function concurrentMemoDOMPlugin(): Plugin {
    return {
        name: 'vite-plugin-concurrent-memo-dom',

        config(config) {
            return {
                optimizeDeps: {
                    exclude: [...(config.optimizeDeps?.exclude || []), 'concurrent-memo-dom']
                }
            };
        },

        async resolveId(source, importer) {
            if (source === 'concurrent-memo-dom/worker') {
                const workerPath = resolve(__dirname, 'worker.js');
                return this.resolve(workerPath, importer);
            }
            return null;
        },

        async load(id) {
            if (id.endsWith('concurrent-memo-dom/worker.js')) {
                try {
                    const workerContent = await fs.readFile(id, 'utf-8');
                    return workerContent;
                } catch (error) {
                    this.error(`Failed to load worker file: ${error}`);
                }
            }
            return null;
        }
    };
}