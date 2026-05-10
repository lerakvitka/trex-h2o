const { packager } = require('@electron/packager');
const { ZipArchive } = require('archiver');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'release');

const COMMON = {
  dir: ROOT,
  out: OUT,
  name: 'T-Rex H2O',
  appVersion: require(path.join(ROOT, 'package.json')).version,
  overwrite: true,
  asar: true,
  ignore: [
    /^\/\.vite($|\/)/,
    /^\/_design($|\/)/,
    /^\/release($|\/)/,
    /^\/scripts($|\/)/,
    /^\/src($|\/)/,
    /^\/node_modules\/(@vitejs|archiver|@electron\/packager|electron-builder|electron|vite|wait-on|concurrently|cross-env)/,
    /\.map$/,
    /^\/index\.html$/,
    /^\/vite\.config\.js$/,
    /^\/\.gitignore$/,
    /^\/t-rex\d+\.png$/,
  ],
};

function zipDir(srcDir, outZip) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outZip);
    const archive = new ZipArchive({ zlib: { level: 9 } });
    output.on('close', () => resolve(outZip));
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(srcDir, path.basename(srcDir));
    archive.finalize();
  });
}

async function buildTarget(opts, label) {
  console.log(`\n=== Packaging ${label} ===`);
  const paths = await packager({ ...COMMON, ...opts });
  for (const p of paths) {
    const zipPath = p + '.zip';
    console.log(`zipping ${path.basename(p)} -> ${path.basename(zipPath)}`);
    await zipDir(p, zipPath);
    const stat = fs.statSync(zipPath);
    console.log(`  ${zipPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
  }
}

(async () => {
  const target = process.argv[2] || 'all';
  if (target === 'all' || target === 'win') {
    await buildTarget({ platform: 'win32', arch: 'x64' }, 'Windows x64');
  }
  if (target === 'all' || target === 'linux') {
    await buildTarget({ platform: 'linux', arch: 'x64' }, 'Linux x64');
  }
  if (target === 'all' || target === 'mac') {
    await buildTarget({ platform: 'darwin', arch: 'x64' }, 'macOS Intel');
    await buildTarget({ platform: 'darwin', arch: 'arm64' }, 'macOS Apple Silicon');
  }
  console.log('\nDone. Output in:', OUT);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
