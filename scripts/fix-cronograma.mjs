import { readFileSync, writeFileSync } from 'fs';

const target = '/vercel/share/v0-next-shadcn/src/components/CronogramaPage.tsx';
const lines = readFileSync(target, 'utf-8').split('\n');
console.log('[v0] Total lines before fix:', lines.length);

// Find second occurrence of "function fmtDate" (start of duplicate block)
let first = -1, second = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^function fmtDate/.test(lines[i].trim())) {
    if (first === -1) first = i;
    else { second = i; break; }
  }
}
console.log('[v0] First fmtDate:', first + 1, '| Second fmtDate:', second + 1);

if (second === -1) {
  console.log('[v0] No duplicate found.');
  process.exit(0);
}

// Cut everything from the line before the duplicate block (skip blank lines before it)
let cutAt = second;
while (cutAt > 0 && lines[cutAt - 1].trim() === '') cutAt--;

const fixed = lines.slice(0, cutAt).join('\n') + '\n';
writeFileSync(target, fixed, 'utf-8');
console.log('[v0] Done. Lines after fix:', fixed.split('\n').length);
