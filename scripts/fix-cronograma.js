const { readFileSync, writeFileSync } = require('fs');

const src = '/vercel/share/v0-project/src/components/CronogramaPage.tsx';
const dst = '/vercel/share/v0-next-shadcn/src/components/CronogramaPage.tsx';

const content = readFileSync(src, 'utf8');
writeFileSync(dst, content, 'utf8');

const lines = content.split('\n').length;
console.log(`Copiado! ${lines} linhas escritas em ${dst}`);
