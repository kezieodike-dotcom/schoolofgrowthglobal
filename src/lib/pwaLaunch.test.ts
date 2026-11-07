import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.webmanifest'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('installed-app splash and browser chrome use the same solid black background', () => {
  assert.equal(manifest.background_color, '#000000');
  assert.equal(manifest.theme_color, '#000000');
  assert.match(html, /<meta name="theme-color" content="#000000"/);
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.display, 'standalone');
});

function pngDimensions(src: string) {
  const png = fs.readFileSync(path.join(root, 'public', src));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  return `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`;
}

test('install icons have real square dimensions and a separate maskable export', () => {
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((icon: { sizes: string; purpose: string }) => icon.sizes === `${size}x${size}` && icon.purpose === 'any');
    assert.ok(icon, `Missing ${size}px install icon`);
    assert.equal(icon.type, 'image/png');
    assert.equal(pngDimensions(icon.src), icon.sizes);
  }
  const maskable = manifest.icons.find((icon: { purpose: string }) => icon.purpose === 'maskable');
  assert.ok(maskable);
  assert.equal(pngDimensions(maskable.src), '512x512');
  assert.notEqual(maskable.src, manifest.icons.find((icon: { sizes: string; purpose: string }) => icon.sizes === '512x512' && icon.purpose === 'any').src);
  const touchIcon = html.match(/<link rel="apple-touch-icon" sizes="180x180" href="([^"]+)"/);
  assert.ok(touchIcon);
  assert.equal(pngDimensions(touchIcon[1]), '180x180');
});

test('before React mounts, a centred gold logo appears on black without a tile or tagline', () => {
  assert.match(html, /<div id="root">\s*<div id="app-launch-screen" role="status" aria-label="Loading School of Growth Global">/);
  assert.match(html, /#app-launch-screen\s*\{[^}]*background:\s*#000000;[^}]*display:\s*grid;[^}]*place-items:\s*center;/s);
  assert.match(html, /id="app-launch-screen"[^>]*>\s*<img[^>]*src="\/icons\/sgg-launch-512-v1.png"/);
  assert.doesNotMatch(html, /driving towards excellence/i);
  assert.match(html, /apple-mobile-web-app-status-bar-style" content="black"/);
});
