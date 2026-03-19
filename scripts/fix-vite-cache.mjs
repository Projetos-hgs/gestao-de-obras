/**
 * Este script copia o CronogramaPage.tsx correto de v0-project para v0-next-shadcn,
 * corrigindo o problema de declarações duplicadas que bloqueiam o Vite.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import path from 'path';

const src  = '/vercel/share/v0-project/src/components/CronogramaPage.tsx';
const dest = '/vercel/share/v0-next-shadcn/src/components/CronogramaPage.tsx';

if (!existsSync(src)) {
  console.error('[v0] Arquivo fonte não encontrado:', src);
  process.exit(1);
}

const content = readFileSync(src, 'utf8');
const lines   = content.split('\n');

// Verifica duplicatas antes de copiar
const exportMatches = lines.filter(l => /^export function CronogramaPage/.test(l));
console.log('[v0] Arquivo fonte tem', lines.length, 'linhas e', exportMatches.length, 'export(s) de CronogramaPage');

if (exportMatches.length > 1) {
  console.error('[v0] ERRO: arquivo fonte ainda tem duplicatas! Abortando.');
  process.exit(1);
}

if (!existsSync(dest)) {
  console.log('[v0] Destino não existe:', dest, '— verificando caminhos alternativos...');
  const alts = [
    '/vercel/share/v0-next-shadcn/src/components/CronogramaPage.tsx',
  ];
  for (const alt of alts) {
    console.log('[v0] Tentando:', alt, '— existe:', existsSync(alt));
  }
  process.exit(0);
}

const destContent = readFileSync(dest, 'utf8');
const destLines   = destContent.split('\n');
const destExports = destLines.filter(l => /^export function CronogramaPage/.test(l));

console.log('[v0] Arquivo destino tem', destLines.length, 'linhas e', destExports.length, 'export(s)');

if (destExports.length > 1) {
  console.log('[v0] Destino tem duplicatas — copiando versão limpa...');
  copyFileSync(src, dest);
  const after = readFileSync(dest, 'utf8').split('\n');
  console.log('[v0] Após cópia: destino tem', after.length, 'linhas');
  console.log('[v0] Sucesso! Duplicatas removidas do arquivo do Vite.');
} else {
  console.log('[v0] Destino já está correto. Nenhuma ação necessária.');
}
