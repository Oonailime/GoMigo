const fs = require('fs');
const path = require('path');

const root = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const sourceDir = path.join(root, 'node_modules', 'effect');
const targetDir = path.join(root, 'node_modules', '@prisma', 'config', 'node_modules', 'effect');

if (!fs.existsSync(sourceDir) || !fs.existsSync(path.dirname(targetDir))) {
  process.exit(0);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
