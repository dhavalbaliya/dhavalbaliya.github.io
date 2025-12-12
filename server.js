const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const CONTENT_DIR = path.join(__dirname, 'content');

app.use('/content', express.static(CONTENT_DIR));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/albums', (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_DIR)) return res.json([]);

    const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory()).map(e => e.name);

    const albums = folders.map(folder => {
      const folderPath = path.join(CONTENT_DIR, folder);
      let files = fs.readdirSync(folderPath).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg','.jpeg','.png','.gif','.webp'].includes(ext);
      }).sort();

      return {
        title: folder,
        images: files.map(f => `/content/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`)
      };
    });

    res.json(albums);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read content" });
  }
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

app.listen(PORT, ()=> console.log("Gallery server running on port " + PORT));
