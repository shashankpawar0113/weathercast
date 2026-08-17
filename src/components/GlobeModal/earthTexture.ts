/**
 * High-Resolution Procedural Earth Texture Generator for Three.js
 * Renders an Equirectangular 2048x1024 Map with Oceans, Coastlines, Continents,
 * Latitude/Longitude Grids, and Ambient City Lights.
 */
import * as THREE from 'three';

// Simplified high-precision continental boundary polygon paths (Equirectangular normalized -180..180, -90..90)
const CONTINENT_POLYGONS: Array<Array<[number, number]>> = [
  // North America
  [
    [-168, 65], [-160, 71], [-140, 70], [-130, 69], [-120, 76], [-100, 70],
    [-80, 74], [-65, 66], [-60, 50], [-70, 42], [-75, 35], [-80, 25],
    [-82, 23], [-89, 21], [-97, 26], [-105, 20], [-100, 18], [-90, 15],
    [-83, 9], [-77, 8], [-80, 14], [-88, 16], [-97, 18], [-105, 22],
    [-115, 30], [-120, 34], [-124, 40], [-125, 50], [-135, 58], [-150, 60],
    [-160, 56], [-168, 65]
  ],
  // South America
  [
    [-77, 8], [-72, 12], [-60, 9], [-50, -1], [-35, -5], [-35, -10],
    [-38, -13], [-42, -22], [-48, -28], [-53, -34], [-65, -45], [-70, -53],
    [-75, -50], [-73, -40], [-71, -30], [-76, -18], [-81, -5], [-77, 8]
  ],
  // Europe
  [
    [-10, 36], [0, 43], [5, 43], [15, 40], [25, 37], [30, 42],
    [35, 47], [40, 50], [45, 55], [50, 60], [60, 68], [50, 70],
    [30, 71], [20, 70], [10, 60], [5, 54], [0, 48], [-5, 48],
    [-9, 43], [-10, 36]
  ],
  // Scandinavia & UK
  [
    [5, 58], [15, 56], [25, 60], [30, 70], [18, 71], [10, 64], [5, 58]
  ],
  [
    [-6, 50], [2, 51], [0, 58], [-5, 58], [-6, 50]
  ],
  // Africa
  [
    [-17, 30], [-5, 36], [10, 37], [25, 32], [32, 31], [35, 25],
    [43, 12], [51, 12], [45, 0], [40, -10], [35, -25], [26, -34],
    [18, -34], [12, -18], [9, -5], [4, 5], [-15, 11], [-17, 21],
    [-17, 30]
  ],
  // Asia
  [
    [35, 47], [50, 40], [60, 35], [70, 25], [75, 15], [80, 8],
    [85, 20], [90, 22], [100, 15], [105, 10], [110, 20], [120, 25],
    [125, 32], [130, 42], [140, 48], [145, 55], [170, 65], [180, 68],
    [150, 72], [120, 76], [90, 76], [60, 72], [50, 60], [40, 50],
    [35, 47]
  ],
  // India & Southeast Asia
  [
    [68, 24], [73, 19], [77, 8], [80, 13], [87, 22], [80, 27], [68, 24]
  ],
  [
    [98, 8], [103, 1], [108, 12], [102, 14], [98, 8]
  ],
  // Australia & New Zealand
  [
    [114, -22], [125, -15], [135, -12], [142, -11], [149, -20],
    [153, -28], [150, -37], [140, -38], [130, -32], [115, -34],
    [114, -22]
  ],
  [
    [168, -45], [175, -40], [178, -35], [172, -41], [168, -45]
  ],
  // Japan
  [
    [130, 32], [135, 35], [141, 42], [145, 44], [140, 36], [130, 32]
  ],
  // Greenland
  [
    [-55, 60], [-40, 60], [-25, 70], [-20, 80], [-45, 83], [-60, 76], [-55, 60]
  ]
];

// Major city lights coordinates (lon, lat, intensity)
const METRO_LIGHTS: Array<[number, number, number]> = [
  // India
  [72.87, 19.07, 1.0], [77.21, 28.61, 1.0], [80.27, 13.08, 0.8], [88.36, 22.57, 0.8], [77.59, 12.97, 0.9],
  // East Asia
  [139.69, 35.68, 1.0], [135.50, 34.69, 0.9], [126.97, 37.56, 1.0], [121.47, 31.23, 1.0], [116.40, 39.90, 1.0], [114.16, 22.31, 0.9],
  // Southeast Asia
  [103.81, 1.35, 1.0], [100.50, 13.75, 0.9], [106.84, -6.20, 0.9], [120.98, 14.59, 0.8],
  // Middle East
  [55.27, 25.20, 1.0], [51.53, 25.28, 0.8], [46.67, 24.71, 0.8], [35.21, 31.76, 0.7],
  // Europe
  [-0.12, 51.50, 1.0], [2.35, 48.85, 1.0], [13.40, 52.52, 0.9], [4.90, 52.36, 0.8], [12.49, 41.90, 0.9], [-3.70, 40.41, 0.9], [37.61, 55.75, 0.9],
  // North America
  [-74.00, 40.71, 1.0], [-118.24, 34.05, 1.0], [-87.62, 41.87, 0.9], [-95.36, 29.76, 0.8], [-122.41, 37.77, 0.9], [-79.38, 43.65, 0.9], [-99.13, 19.43, 0.9],
  // South America
  [-46.63, -23.55, 0.9], [-43.17, -22.90, 0.9], [-58.38, -34.60, 0.9], [-70.66, -33.44, 0.8], [-77.04, -12.04, 0.8],
  // Australia & Africa
  [151.20, -33.86, 0.9], [144.96, -37.81, 0.9], [31.23, 30.04, 0.9], [18.42, -33.92, 0.8], [28.04, -26.20, 0.8]
];

export function createEarthCanvasTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Oceanic Gradient Background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#040814');
  oceanGrad.addColorStop(0.5, '#071126');
  oceanGrad.addColorStop(1, '#040814');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper coordinate mapper
  const lonToX = (lon: number) => ((lon + 180) / 360) * width;
  const latToY = (lat: number) => ((90 - lat) / 180) * height;

  // 2. Latitude & Longitude Coordinate Graticule Grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;

  // Parallels
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = latToY(lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Meridians
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = lonToX(lon);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator Highlight
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, latToY(0));
  ctx.lineTo(width, latToY(0));
  ctx.stroke();

  // 3. Draw Continents & Landmasses
  for (const poly of CONTINENT_POLYGONS) {
    if (poly.length < 3) continue;

    // Land Base Fill
    ctx.beginPath();
    ctx.moveTo(lonToX(poly[0][0]), latToY(poly[0][1]));
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(lonToX(poly[i][0]), latToY(poly[i][1]));
    }
    ctx.closePath();

    ctx.fillStyle = '#0f2438';
    ctx.fill();

    // Glowing Neon Coastline Rim
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow

    // Inner Land Gradient/Contour
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fill();
  }

  // 4. Draw Atmospheric City Lights
  for (const [lon, lat, intensity] of METRO_LIGHTS) {
    const x = lonToX(lon);
    const y = latToY(lat);

    const rad = ctx.createRadialGradient(x, y, 0, x, y, 12 * intensity);
    rad.addColorStop(0, `rgba(254, 240, 138, ${0.9 * intensity})`);
    rad.addColorStop(0.4, `rgba(245, 158, 11, ${0.5 * intensity})`);
    rad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(x, y, 12 * intensity, 0, Math.PI * 2);
    ctx.fill();

    // Sharp center core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function createCloudCanvasTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  // Procedural wispy clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 20 + Math.random() * 60;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(0.6, 'rgba(200, 230, 255, 0.1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
