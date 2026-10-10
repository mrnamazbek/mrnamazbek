import { cp, mkdir, readdir } from 'node:fs/promises';

// Keep existing scheduled content exports as the single source of truth.
// Copy only published media/data; legacy browser scripts are no longer shipped.
await mkdir('public/assets', { recursive: true });
for (const entry of await readdir('assets', { withFileTypes: true })) {
  if (entry.name.startsWith('.') || entry.name === 'mock_repos.json') continue;
  if (entry.isDirectory() || /\.(json|svg|png|jpg|jpeg|webp|pdf)$/i.test(entry.name)) {
    if (/^(avatar|avatart)\.(jpeg|jpg)$|avatar-prepped\.png/.test(entry.name)) continue;
    await cp(`assets/${entry.name}`, `public/assets/${entry.name}`, { recursive: true });
  }
}

// Spline geometry decoders are self-hosted so the robot needs no CDN requests.
await mkdir('public/assets/3d/runtime', { recursive: true });
for (const entry of await readdir('node_modules/@splinetool/runtime/build')) {
  if (entry.endsWith('.wasm')) {
    await cp(`node_modules/@splinetool/runtime/build/${entry}`, `public/assets/3d/runtime/${entry}`);
  }
}
