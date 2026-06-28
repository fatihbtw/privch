import { mkdirSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { exec } from 'child_process';
import { join } from 'path';

const packer = 'npm',
    packerCommand = 'npm run',
    frontEndDist = join(process.cwd(), 'front', 'dist'),
    frontEndCompiledAssets = join(frontEndDist, 'assets'),
    frontEndAssets = join(process.cwd(), 'front', 'assets'),
    outPath = join(process.cwd(), 'public'),
    outPathAssets = join(outPath, 'assets');

console.log(`Using ${packer} as package manager`);

if (!existsSync(outPathAssets)) {
    console.log(`Creating folder ${outPathAssets}`);
    mkdirSync(outPathAssets);
}

console.log(`Moving contents of ${frontEndCompiledAssets} to ${outPathAssets}`);
for (let file of readdirSync(frontEndCompiledAssets)) {
    copyFileSync(join(frontEndCompiledAssets, file), join(outPathAssets, file));
}

console.log(`Moving contents of ${frontEndAssets} to ${outPathAssets}`);
for (let file of readdirSync(frontEndAssets)) {
    copyFileSync(join(frontEndAssets, file), join(outPathAssets, file));
}

console.log(`Moving ${frontEndDist}/index.html to ${outPath}/index.html`);
copyFileSync(join(frontEndDist, 'index.html'), join(outPath, 'index.html'));

console.log(`Building css with ${packerCommand} build:css`);
exec(`${packerCommand} build:css`);

console.log(`Building typescript with ${packerCommand} build:ts`);
exec(`${packerCommand} build:ts`);

console.log(`Done! Now you can execute with ${packerCommand} start`);
