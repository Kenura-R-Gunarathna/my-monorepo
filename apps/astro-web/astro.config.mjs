// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read workspace packages from this app's package.json
function getWorkspaceDependencies() {
  try {
    const pkgPath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };
    
    // Filter for @krag packages
    return Object.keys(deps).filter(name => name.startsWith('@krag/'));
  } catch (error) {
    console.warn('Could not read package.json:', error);
    return [];
  }
}

const workspacePackages = getWorkspaceDependencies();

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react()],

  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    
    server: {
      hmr: {
        overlay: true,
      },
      watch: {
        ignored: ['!**/node_modules/@krag/**']
      }
    },
    
    optimizeDeps: {
      // ✅ Array from package.json dependencies
      exclude: workspacePackages,
      include: ['react', 'react-dom', 'react/jsx-runtime']
    }
  }
});