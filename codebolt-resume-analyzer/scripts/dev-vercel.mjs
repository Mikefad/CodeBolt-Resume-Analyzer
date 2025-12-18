#!/usr/bin/env node
/**
 * Custom dev command used by `vercel dev`.
 * Vercel provides PORT via env var (and expects the app to listen there).
 * The default script used POSIX shell features that fail on Windows,
 * so we spawn Vite manually in a cross-platform way.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const port = process.env.PORT || '5173';

// Resolve the Vite binary from node_modules. On Windows the file ends with .cmd.
const viteBin =
  process.platform === 'win32'
    ? path.join(projectRoot, 'node_modules', '.bin', 'vite.cmd')
    : path.join(projectRoot, 'node_modules', '.bin', 'vite');

const child = spawn(viteBin, ['--host', '0.0.0.0', '--port', port], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
