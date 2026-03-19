const { rmSync, existsSync } = require('fs');
const path = require('path');

// Deleta o cache do Vite para forçar re-scan completo
const cacheDirs = [
  path.join(process.cwd(), 'node_modules/.vite'),
  '/vercel/share/v0-next-shadcn/node_modules/.vite',
  path.join(process.cwd(), '../v0-next-shadcn/node_modules/.vite'),
];

for (const dir of cacheDirs) {
  if (existsSync(dir)) {
    try {
      rmSync(dir, { recursive: true, force: true });
      console.log('[v0] Cache deletado:', dir);
    } catch(e) {
      console.log('[v0] Erro ao deletar', dir, e.message);
    }
  } else {
    console.log('[v0] Não existe:', dir);
  }
}
console.log('[v0] Done');
