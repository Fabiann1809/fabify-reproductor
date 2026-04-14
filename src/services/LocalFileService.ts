import type { Song } from '../types/song';

const blobRegistry = new Map<string, string>();

export function importLocalFiles(files: FileList): Song[] {
  const songs: Song[] = [];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('audio/')) continue;
    const url = URL.createObjectURL(file);
    const id = crypto.randomUUID();
    blobRegistry.set(id, url);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split(' - ');
    const artist = parts.length > 1 ? parts[0].trim() : 'Artista desconocido';
    const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : nameWithoutExt;
    songs.push({
      id,
      title,
      artist,
      album: '',
      durationMs: 0,
      artworkUrl: '',
      previewUrl: url,
      source: 'local',
    });
  }
  return songs;
}

export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration * 1000);
    });
    audio.addEventListener('error', () => resolve(0));
  });
}

export function revokeObjectURL(songId: string): void {
  const url = blobRegistry.get(songId);
  if (url) {
    URL.revokeObjectURL(url);
    blobRegistry.delete(songId);
  }
}

window.addEventListener('beforeunload', () => {
  for (const url of blobRegistry.values()) {
    URL.revokeObjectURL(url);
  }
  blobRegistry.clear();
});
