#!/usr/bin/env node
/**
 * BASEMAP GENERATOR
 * Downloads and stitches map tiles to create a high-resolution static basemap.
 * 
 * Usage: node scripts/generate-basemap.mjs
 * 
 * Dependencies: 
 *   npm install sharp (for image stitching)
 * 
 * Output: public/maps/koreatown.png
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'maps');
const TILES_DIR = path.join(OUTPUT_DIR, 'tiles');

// Koreatown bounds (extended)
const BOUNDS = {
  west: -118.3389,
  south: 34.0272,
  east: -118.2629,
  north: 34.0952
};

// Zoom level (16 = high detail, 17 = very high detail)
const ZOOM = 16;

// Tile size
const TILE_SIZE = 256;

// Tile server (Carto Light - free, high quality, clean design)
const TILE_URL = (z, x, y) => 
  `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}@2x.png`;

// Convert lat/lng to tile coordinates
function lngToTile(lng, zoom) {
  return Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
}

function latToTile(lat, zoom) {
  const latRad = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom));
}

// Convert tile coordinates back to lat/lng (for bounds calculation)
function tileToLng(x, zoom) {
  return x / Math.pow(2, zoom) * 360 - 180;
}

function tileToLat(y, zoom) {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

// Download a single tile
function downloadTile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, { rejectUnauthorized: false }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('🗺️  Generating Koreatown basemap...\n');
  
  // Calculate tile range
  const minTileX = lngToTile(BOUNDS.west, ZOOM);
  const maxTileX = lngToTile(BOUNDS.east, ZOOM);
  const minTileY = latToTile(BOUNDS.north, ZOOM); // Note: Y is inverted
  const maxTileY = latToTile(BOUNDS.south, ZOOM);
  
  const tilesX = maxTileX - minTileX + 1;
  const tilesY = maxTileY - minTileY + 1;
  const totalTiles = tilesX * tilesY;
  
  console.log(`Bounds: ${BOUNDS.west}, ${BOUNDS.south} to ${BOUNDS.east}, ${BOUNDS.north}`);
  console.log(`Zoom level: ${ZOOM}`);
  console.log(`Tile range: X=${minTileX}-${maxTileX}, Y=${minTileY}-${maxTileY}`);
  console.log(`Grid: ${tilesX} x ${tilesY} = ${totalTiles} tiles`);
  console.log(`Output size: ${tilesX * TILE_SIZE * 2}px x ${tilesY * TILE_SIZE * 2}px (@2x)\n`);
  
  // Calculate actual bounds of the tile grid
  const actualBounds = {
    west: tileToLng(minTileX, ZOOM),
    east: tileToLng(maxTileX + 1, ZOOM),
    north: tileToLat(minTileY, ZOOM),
    south: tileToLat(maxTileY + 1, ZOOM)
  };
  
  console.log('Actual tile bounds:');
  console.log(`  West:  ${actualBounds.west}`);
  console.log(`  East:  ${actualBounds.east}`);
  console.log(`  North: ${actualBounds.north}`);
  console.log(`  South: ${actualBounds.south}\n`);
  
  // Create directories
  fs.mkdirSync(TILES_DIR, { recursive: true });
  
  // Download all tiles
  console.log('Downloading tiles...');
  const tiles = [];
  let downloaded = 0;
  
  for (let y = minTileY; y <= maxTileY; y++) {
    for (let x = minTileX; x <= maxTileX; x++) {
      const url = TILE_URL(ZOOM, x, y);
      const filename = `tile_${ZOOM}_${x}_${y}.png`;
      const filepath = path.join(TILES_DIR, filename);
      
      tiles.push({ x, y, filepath, gridX: x - minTileX, gridY: y - minTileY });
      
      try {
        await downloadTile(url, filepath);
        downloaded++;
        process.stdout.write(`\r  Downloaded ${downloaded}/${totalTiles} tiles`);
      } catch (err) {
        console.error(`\n  Failed: ${filename} - ${err.message}`);
      }
    }
  }
  
  console.log('\n\nTiles downloaded to:', TILES_DIR);
  
  // Output config for the static map
  const config = {
    imageUrl: '/maps/koreatown.png',
    imageWidth: tilesX * TILE_SIZE * 2,
    imageHeight: tilesY * TILE_SIZE * 2,
    bounds: actualBounds,
    zoom: ZOOM,
    attribution: '© OpenStreetMap contributors, © CARTO'
  };
  
  console.log('\n📝 Static map config (copy to lib/geo/koreatownStaticMap.ts):');
  console.log(JSON.stringify(config, null, 2));
  
  console.log('\n⚠️  Next steps:');
  console.log('1. Install sharp: npm install sharp');
  console.log('2. Run stitching: node scripts/stitch-tiles.mjs');
  console.log('   Or manually stitch with ImageMagick:');
  console.log(`   montage ${TILES_DIR}/tile_${ZOOM}_*.png -tile ${tilesX}x${tilesY} -geometry +0+0 ${OUTPUT_DIR}/koreatown.png`);
}

main().catch(console.error);


