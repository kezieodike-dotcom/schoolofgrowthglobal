import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve('index.html'), 'utf8');
const expectedUrl = 'https://schoolofgrowthglobal.vercel.app/';
const expectedImage = `${expectedUrl}meta/og-home.png`;

function hasTagAttribute(attribute: string, value: string): boolean {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<[^>]+${attribute}=["']${escapedValue}["'][^>]*>`, 's').test(html);
}

const requiredAttributes = [
  ['name', 'description'],
  ['rel', 'canonical'],
  ['property', 'og:type'],
  ['property', 'og:title'],
  ['property', 'og:url'],
  ['property', 'og:image'],
  ['name', 'twitter:card'],
  ['name', 'twitter:image'],
];

for (const [attribute, value] of requiredAttributes) {
  if (!hasTagAttribute(attribute, value)) {
    throw new Error(`Missing social meta attribute: ${attribute}="${value}"`);
  }
}

for (const expected of [expectedUrl, expectedImage, 'summary_large_image']) {
  if (!html.includes(expected)) {
    throw new Error(`Missing expected social metadata value: ${expected}`);
  }
}

if (!existsSync(resolve('public/meta/og-home.png'))) {
  throw new Error('Hero screenshot meta image should exist at public/meta/og-home.png');
}
