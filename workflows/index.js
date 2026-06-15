function pick(media, preferVideo, idx) {
  const v = media.filter(m => m.mime?.startsWith('video/'));
  const i = media.filter(m => m.mime?.startsWith('image/'));
  const pool = preferVideo ? (v.length ? v : i) : (i.length ? i : v);
  return pool[idx % Math.max(pool.length, 1)] || media[idx % Math.max(media.length, 1)] || null;
}

const testimonial = {
  meta: { name: 'Corporate Testimonial', description: '75s social proof video for corporate AI training.', format: '9:16', duration: 75, music: 'corporate', icon: '🏢' },
  generateCuts(media, cfg) {
    const { clientName = 'AI Training', trainerName = 'Dee Ferdinand' } = cfg;
    return [
      { start: 0,  duration: 3,  mediaFile: pick(media, true, 0),  caption: clientName ? `${clientName} × AI Training` : 'AI Corporate Training', captionStyle: 'hook' },
      { start: 3,  duration: 2,  mediaFile: pick(media, false, 0), caption: `${trainerName} · AI Corporate Trainer`, captionStyle: 'badge' },
      { start: 5,  duration: 5,  mediaFile: pick(media, false, 1), caption: '1,000+ professionals trained since 2023', captionStyle: 'stat' },
      { start: 10, duration: 5,  mediaFile: pick(media, true, 1),  caption: '80% hands-on · langsung praktek', captionStyle: 'default' },
      { start: 15, duration: 8,  mediaFile: pick(media, true, 2),  caption: '"Saya pikir AI itu susah. Ternyata..."', captionStyle: 'default' },
      { start: 23, duration: 4,  mediaFile: pick(media, false, 2), caption: clientName ? `${clientName} · ${new Date().getFullYear()}` : null, captionStyle: 'badge' },
      { start: 27, duration: 5,  mediaFile: pick(media, true, 3),  caption: 'Hands-on prompting. Real output.', captionStyle: 'default' },
      { start: 32, duration: 4,  mediaFile: pick(media, false, 3), caption: null },
      { start: 36, duration: 7,  mediaFile: pick(media, true, 4),  caption: '"Sekarang saya bisa buat konten sendiri."', captionStyle: 'default' },
      { start: 43, duration: 4,  mediaFile: pick(media, false, 4), caption: null },
      { start: 47, duration: 8,  mediaFile: pick(media, true, 5),  caption: 'Energi yang berbeda. Hasil yang nyata.', captionStyle: 'default' },
      { start: 55, duration: 8,  mediaFile: pick(media, true, 0),  caption: 'Training AI untuk tim kamu?', captionStyle: 'hook' },
      { start: 63, duration: 7,  mediaFile: pick(media, false, 5), caption: 'DM · atau klik link di bio', captionStyle: 'default' },
    ];
  },
};

const teaser = {
  meta: { name: 'Event Teaser', description: '30s fast-cut teaser for upcoming events.', format: '9:16', duration: 30, music: 'energetic', icon: '⚡' },
  generateCuts(media, cfg) {
    const { clientName = 'Next Event' } = cfg;
    const m = media;
    return [
      { start: 0,  duration: 2, mediaFile: pick(m,true,0),  caption: 'COMING SOON', captionStyle: 'hook' },
      { start: 2,  duration: 2, mediaFile: pick(m,false,1), caption: null },
      { start: 4,  duration: 2, mediaFile: pick(m,true,1),  caption: clientName, captionStyle: 'badge' },
      { start: 6,  duration: 2, mediaFile: pick(m,false,2), caption: null },
      { start: 8,  duration: 2, mediaFile: pick(m,true,2),  caption: 'AI Training', captionStyle: 'default' },
      { start: 10, duration: 2, mediaFile: pick(m,false,3), caption: null },
      { start: 12, duration: 2, mediaFile: pick(m,true,3),  caption: 'Hands-on. Real tools.', captionStyle: 'default' },
      { start: 14, duration: 3, mediaFile: pick(m,true,0),  caption: 'Real results. Real fast.', captionStyle: 'hook' },
      { start: 17, duration: 3, mediaFile: pick(m,false,4), caption: null },
      { start: 20, duration: 3, mediaFile: pick(m,true,0),  caption: 'Save your spot. Link in bio.', captionStyle: 'default' },
    ];
  },
};

const trailer = {
  meta: { name: 'Cinematic Trailer', description: '60s cinematic event recap or brand trailer.', format: '9:16', duration: 60, music: 'cinematic', icon: '🎬' },
  generateCuts(media, cfg) {
    const { clientName = '', trainerName = 'Dee Ferdinand' } = cfg;
    const m = media;
    return [
      { start: 0,  duration: 5, mediaFile: pick(m,true,0),  caption: 'Ini bukan teori.', captionStyle: 'hook' },
      { start: 5,  duration: 4, mediaFile: pick(m,false,0), caption: 'Ini yang benar-benar terjadi.', captionStyle: 'default' },
      { start: 9,  duration: 4, mediaFile: pick(m,true,1),  caption: clientName || null, captionStyle: 'badge' },
      { start: 13, duration: 4, mediaFile: pick(m,false,1), caption: null },
      { start: 17, duration: 5, mediaFile: pick(m,true,2),  caption: 'Prompt. Praktek. Hasil.', captionStyle: 'default' },
      { start: 22, duration: 4, mediaFile: pick(m,false,2), caption: null },
      { start: 26, duration: 5, mediaFile: pick(m,true,3),  caption: '"Saya tidak sangka bisa."', captionStyle: 'default' },
      { start: 31, duration: 4, mediaFile: pick(m,false,3), caption: null },
      { start: 35, duration: 5, mediaFile: pick(m,true,0),  caption: '1,000+ professionals trained', captionStyle: 'stat' },
      { start: 40, duration: 5, mediaFile: pick(m,true,4),  caption: null },
      { start: 45, duration: 5, mediaFile: pick(m,false,0), caption: `${trainerName} · AI Corporate Trainer`, captionStyle: 'brand' },
      { start: 50, duration: 5, mediaFile: pick(m,true,1),  caption: 'Training AI untuk tim kamu?', captionStyle: 'hook' },
    ];
  },
};

const community = {
  meta: { name: 'Community Story', description: '60s warm documentary for community/church sessions.', format: '9:16', duration: 60, music: 'warm', icon: '🤝' },
  generateCuts(media, cfg) {
    const { clientName = 'Community Training', trainerName = 'Dee Ferdinand' } = cfg;
    const m = media;
    return [
      { start: 0,  duration: 4, mediaFile: pick(m,false,0), caption: 'AI bukan cuma untuk korporat.', captionStyle: 'hook' },
      { start: 4,  duration: 5, mediaFile: pick(m,true,0),  caption: clientName, captionStyle: 'badge' },
      { start: 9,  duration: 5, mediaFile: pick(m,false,1), caption: 'Guru. Ibu rumah tangga. Mahasiswa.', captionStyle: 'default' },
      { start: 14, duration: 5, mediaFile: pick(m,true,1),  caption: null },
      { start: 19, duration: 5, mediaFile: pick(m,false,2), caption: 'Semua orang bisa belajar AI.', captionStyle: 'default' },
      { start: 24, duration: 8, mediaFile: pick(m,true,2),  caption: '"Saya tidak sangka bisa."', captionStyle: 'default' },
      { start: 32, duration: 5, mediaFile: pick(m,false,3), caption: null },
      { start: 37, duration: 5, mediaFile: pick(m,true,3),  caption: 'Belajar bersama. Tumbuh bersama.', captionStyle: 'default' },
      { start: 42, duration: 5, mediaFile: pick(m,false,0), caption: `${trainerName} · ${new Date().getFullYear()}`, captionStyle: 'brand' },
      { start: 47, duration: 5, mediaFile: pick(m,true,0),  caption: 'Training AI untuk komunitas kamu?', captionStyle: 'hook' },
    ];
  },
};

export const WORKFLOWS = { testimonial, teaser, trailer, community };
