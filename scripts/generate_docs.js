const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'content');
const dest = path.join(__dirname, '..', 'docs');
const publicDir = path.join(__dirname, '..', 'public');

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

// copy public
fs.cpSync(publicDir, dest, { recursive: true });

// copy content & create albums.json
let albums = [];

if (fs.existsSync(src)) {
  const folders = fs.readdirSync(src, { withFileTypes: true }).filter(d=>d.isDirectory()).map(d=>d.name);

  fs.mkdirSync(path.join(dest, 'content'), { recursive: true });

  folders.forEach(folder => {
    const folderSrc = path.join(src, folder);
    const folderDest = path.join(dest, 'content', folder);
    fs.mkdirSync(folderDest, { recursive: true });

    const files = fs.readdirSync(folderSrc).filter(f=>{
      const ext = path.extname(f).toLowerCase();
      return ['.jpg','.jpeg','.png','.gif','.webp'].includes(ext);
    }).sort();

    files.forEach(f => {
      fs.copyFileSync(path.join(folderSrc, f), path.join(folderDest, f));
    });

    albums.push({
      title: folder,
      images: files.map(f=> `content/${folder}/${f}`)
    });
  });
}

fs.writeFileSync(path.join(dest,'albums.json'), JSON.stringify(albums,null,2));
console.log("Generated docs/");
