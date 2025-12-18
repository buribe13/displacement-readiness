#!/usr/bin/env node
/**
 * TILE STITCHER
 * Combines downloaded map tiles into a single high-resolution image.
 * 
 * Usage: node scripts/stitch-tiles.mjs
 * 
 * Requires: sharp (npm install sharp)
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TILES_DIR = path.join(__dirname, '..', 'public', 'maps', 'tiles');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'maps');

// Configuration from the download script
const CONFIG = {
  zoom: 16,
  tileSize: 512, // @2x tiles
  minTileX: 11225,
  maxTileX: 11238,
  minTileY: 26158,
  maxTileY: 26173
};

const tilesX = CONFIG.maxTileX - CONFIG.minTileX + 1; // 14
const tilesY = CONFIG.maxTileY - CONFIG.minTileY + 1; // 16
const outputWidth = tilesX * CONFIG.tileSize; // 7168
const outputHeight = tilesY * CONFIG.tileSize; // 8192

async function main() {
  console.log('🧩 Stitching tiles into basemap...\n');
  console.log(`Grid: ${tilesX} x ${tilesY} tiles`);
  console.log(`Output: ${outputWidth} x ${outputHeight} pixels\n`);

  // Build composite operations
  const composites = [];
  
  for (let y = CONFIG.minTileY; y <= CONFIG.maxTileY; y++) {
    for (let x = CONFIG.minTileX; x <= CONFIG.maxTileX; x++) {
      const filename = `tile_${CONFIG.zoom}_${x}_${y}.png`;
      const filepath = path.join(TILES_DIR, filename);
      
      if (!fs.existsSync(filepath)) {
        console.warn(`Missing tile: ${filename}`);
        continue;
      }
      
      const gridX = x - CONFIG.minTileX;
      const gridY = y - CONFIG.minTileY;
      
      composites.push({
        input: filepath,
        left: gridX * CONFIG.tileSize,
        top: gridY * CONFIG.tileSize
      });
    }
  }
  
  console.log(`Compositing ${composites.length} tiles...`);
  
  // Create the stitched image
  const outputPath = path.join(OUTPUT_DIR, 'koreatown.png');
  
  await sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  
  console.log(`\n✅ Basemap created: ${outputPath}`);
  
  // Also create a webp version for smaller file size
  const webpPath = path.join(OUTPUT_DIR, 'koreatown.webp');
  await sharp(outputPath)
    .webp({ quality: 90 })
    .toFile(webpPath);
  
  console.log(`✅ WebP version: ${webpPath}`);
  
  // Get file sizes
  const pngStats = fs.statSync(outputPath);
  const webpStats = fs.statSync(webpPath);
  console.log(`\n📊 File sizes:`);
  console.log(`   PNG:  ${(pngStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   WebP: ${(webpStats.size / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n🗑️  You can now delete the tiles directory:');
  console.log(`   rm -rf "${TILES_DIR}"`);
}

main().catch(console.error);

