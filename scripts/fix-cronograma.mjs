import { readFileSync, writeFileSync } from 'fs';

const src  = '/vercel/share/v0-project/src/components/CronogramaPage.tsx';
const dest = '/vercel/share/v0-next-shadcn/src/components/CronogramaPage.tsx';

const content = readFileSync(src, 'utf-8');
writeFileSync(dest, content, 'utf-8');

const lines = content.split('\n').length;
console.log(`Copiado: ${lines} linhas de ${src} -> ${dest}`);
