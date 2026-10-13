import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';
import path from 'path';

const basePath = process.env.VITE_BASE_PATH || '/CyberWise/';

export default defineConfig({
  base: basePath,
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'materi/*', dest: 'materi' },
        { src: 'quiz/*', dest: 'quiz' }
      ]
    }),
    {
      name: 'serve-static-folders-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : '';
          const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
          let relativeUrl = url;
          if (normalizedBase && relativeUrl.startsWith(normalizedBase)) {
            relativeUrl = relativeUrl.slice(normalizedBase.length);
          }
          if (relativeUrl.startsWith('/materi/') || relativeUrl.startsWith('/quiz/')) {
            const filePath = path.join(process.cwd(), relativeUrl.replace(/^\//, ''));
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              if (filePath.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
              } else if (filePath.endsWith('.md')) {
                res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
              }
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      }
    }
  ]
});
