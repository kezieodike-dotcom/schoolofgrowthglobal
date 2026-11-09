import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.webmanifest'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('the manifest keeps the black installed-app theme and browser links use a light theme', () => {
  assert.equal(manifest.background_color, '#000000');
  assert.equal(manifest.theme_color, '#000000');
  assert.match(html, /<meta name="theme-color" content="#f4f7fb"/);
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

function inlineScript(id: string) {
  const script = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  assert.ok(script, `Missing ${id} script`);
  return script[1];
}

test('only standalone and iOS Home Screen launches mount the logo before React', () => {
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /<template id="app-launch-template">\s*<div id="app-launch-screen" role="status"/);
  assert.match(html, /#app-launch-screen\s*\{[^}]*background:\s*#000000;[^}]*display:\s*grid;[^}]*place-items:\s*center;/s);
  assert.match(html, /id="app-launch-screen"[^>]*>\s*<img[^>]*src="\/icons\/sgg-launch-512-v1.png"/);
  assert.doesNotMatch(html, /<link[^>]*rel="preload"[^>]*sgg-launch/);
  assert.doesNotMatch(html, /driving towards excellence/i);

  for (const { mode, ios, show } of [
    { mode: 'browser', ios: false, show: false },
    { mode: 'fullscreen', ios: false, show: false },
    { mode: 'standalone', ios: false, show: true },
    { mode: 'browser', ios: true, show: true },
  ]) {
    const theme = { content: '#f4f7fb' };
    const mounted: string[] = [];
    runInNewContext(inlineScript('app-launch-check'), {
      window: { matchMedia: (query: string) => ({ matches: query === `(display-mode: ${mode})` }) },
      navigator: { standalone: ios },
      document: {
        querySelector: () => theme,
        getElementById: (id: string) => id === 'root'
          ? { append: (node: string) => mounted.push(node) }
          : { content: { cloneNode: () => 'logo screen' } },
      },
    });
    assert.deepEqual(mounted, show ? ['logo screen'] : []);
    assert.equal(theme.content, show ? '#000000' : '#f4f7fb');
  }
});

test('the HTML retains an install event fired before React starts and clears it when installed', () => {
  const window = new EventTarget() as EventTarget & { sggInstallPrompt?: Event | null; sggAppInstalled?: boolean };
  runInNewContext(inlineScript('pwa-install-bootstrap'), { window });
  const event = new Event('beforeinstallprompt', { cancelable: true });
  window.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(window.sggInstallPrompt, event);
  window.dispatchEvent(new Event('appinstalled'));
  assert.equal(window.sggInstallPrompt, null);
  assert.equal(window.sggAppInstalled, true);
});
