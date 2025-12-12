/* Full carousel + lightbox + autoplay */
(async function(){
  async function fetchAlbums(){
    // First try static albums.json (for GitHub Pages), fallback to API
    try {
      const r = await fetch('/albums.json');
      if (r.ok) return r.json();
    } catch(e){}
    try {
      const r2 = await fetch('/api/albums');
      if (r2.ok) return r2.json();
    } catch(e){}
    return [];
  }

  const albums = await fetchAlbums();
  const container = document.getElementById('albums');

  if (!albums || albums.length === 0){
    container.innerHTML = '<div class="empty">No albums found. Add folders with images inside <code>content/</code>.</div>';
    return;
  }

  // Lightbox elements
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let autoPlayInterval = 3500;

  albums.forEach((album, ai) => {
    const el = document.createElement('section');
    el.className = 'album';

    const title = document.createElement('h2');
    title.textContent = album.title;
    el.appendChild(title);

    const controls = document.createElement('div');
    controls.className = 'controls';

    el.appendChild(controls);

    const carousel = document.createElement('div');
    carousel.className = 'carousel';

    const prev = document.createElement('button');
    prev.className = 'btn prev';
    prev.innerText = '◀';

    const next = document.createElement('button');
    next.className = 'btn next';
    next.innerText = '▶';

    const viewport = document.createElement('div');
    viewport.className = 'viewport';

    const img = document.createElement('img');
    img.alt = album.title;
    viewport.appendChild(img);

    carousel.appendChild(prev);
    carousel.appendChild(viewport);
    carousel.appendChild(next);

    el.appendChild(carousel);

    // thumbnails
    const thumbs = document.createElement('div');
    thumbs.className = 'thumbs';
    el.appendChild(thumbs);

    let idx = 0;
    let timer = null;
    let playing = false;

    const setImg = (i, openLB=false) => {
      if (!album.images || album.images.length === 0) {
        img.src = '';
        viewport.innerHTML = '<div class="empty">No images in this album.</div>';
        return;
      }
      idx = (i + album.images.length) % album.images.length;
      img.src = album.images[idx];
      img.dataset.index = idx;
      // mark active thumb
      Array.from(thumbs.children).forEach((t, j) => t.classList.toggle('active', j === idx));
      if (openLB) openLightbox(album, idx);
    };

    prev.addEventListener('click', () => { setImg(idx - 1); resetTimer(); });
    next.addEventListener('click', () => { setImg(idx + 1); resetTimer(); });

    // build thumbs
    album.images.forEach((u, i) => {
      const t = document.createElement('img');
      t.src = u;
      t.alt = album.title + ' ' + (i+1);
      t.addEventListener('click', () => setImg(i));
      t.addEventListener('dblclick', () => openLightbox(album, i));
      thumbs.appendChild(t);
    });

    // viewport click opens lightbox
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(album, idx));

    function startTimer(){
      stopTimer();
      timer = setInterval(()=> setImg(idx+1), autoPlayInterval);
    }
    function stopTimer(){ if (timer) { clearInterval(timer); timer = null; } }
    function resetTimer(){ if (playing) startTimer(); }

    // keyboard left/right when focused
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') setImg(idx - 1);
      if (e.key === 'ArrowRight') setImg(idx + 1);
      if (e.key === ' ') { playing = !playing; autoplayBtn.textContent = playing ? 'Stop' : 'Autoplay'; resetTimer(); }
    });

    el.tabIndex = 0;
    setImg(0);
    container.appendChild(el);
  });

  // Lightbox functions
  let currentAlbum = null;
  let currentIndex = 0;

  function openLightbox(album, index){
    currentAlbum = album;
    currentIndex = index;
    lbImg.src = album.images[index];
    lbImg.alt = album.title + ' ' + (index+1);
    lbCaption.textContent = album.title + ' — ' + (index+1) + '/' + album.images.length;
    lb.classList.add('active');
    lb.setAttribute('aria-hidden','false');
  }
  function closeLightbox(){ lb.classList.remove('active'); lb.setAttribute('aria-hidden','true'); }
  function lbPrevFn(){ if (!currentAlbum) return; currentIndex = (currentIndex - 1 + currentAlbum.images.length) % currentAlbum.images.length; openLightbox(currentAlbum, currentIndex); }
  function lbNextFn(){ if (!currentAlbum) return; currentIndex = (currentIndex + 1) % currentAlbum.images.length; openLightbox(currentAlbum, currentIndex); }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', lbPrevFn);
  lbNext.addEventListener('click', lbNextFn);

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrevFn();
    if (e.key === 'ArrowRight') lbNextFn();
  });

})();
