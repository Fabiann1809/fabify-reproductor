import type { Song } from '../types/song';

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  trackTimeMillis: number;
  artworkUrl100: string;
  previewUrl: string;
}

interface ITunesResponse {
  resultCount: number;
  results: ITunesTrack[];
}

export async function searchSongs(query: string, signal?: AbortSignal): Promise<Song[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`iTunes API error: ${response.status}`);
  const data: ITunesResponse = await response.json();
  return data.results
    .filter((track) => Boolean(track.previewUrl))
    .map((track) => ({
      id: String(track.trackId),
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName ?? '',
      durationMs: track.trackTimeMillis ?? 0,
      artworkUrl: track.artworkUrl100 ?? '',
      previewUrl: track.previewUrl,
      source: 'itunes' as const,
    }));
}
