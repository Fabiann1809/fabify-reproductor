import { createContext, useContext, type ReactNode } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { usePlaylist } from '../hooks/usePlaylist';
import { useSearch } from '../hooks/useSearch';
import type { Song } from '../types/song';
import type { DLLNode } from '../lib/DoublyLinkedList';
import type { RepeatMode } from '../hooks/usePlayer';

interface PlayerContextValue {
  // Player state
  nowPlaying: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  historyItems: Song[];
  currentNode: React.MutableRefObject<DLLNode<Song> | null>;
  // Player actions
  playSong: (node: DLLNode<Song>) => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  seek: (delta: number) => void;
  seekTo: (time: number) => void;
  setVolumeLevel: (v: number) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  // Playlist state
  songs: Song[];
  // Playlist actions
  addToQueue: (song: Song) => DLLNode<Song>;
  playNext: (song: Song, currentNode: DLLNode<Song> | null) => DLLNode<Song>;
  removeSong: (node: DLLNode<Song>) => void;
  shufflePlaylist: () => void;
  reversePlaylist: () => void;
  clearPlaylist: () => void;
  updateSongDuration: (songId: string, durationMs: number) => void;
  dll: React.MutableRefObject<import('../lib/DoublyLinkedList').DoublyLinkedList<Song>>;
  // Search state
  query: string;
  setQuery: (q: string) => void;
  results: Song[];
  isLoading: boolean;
  searchError: string | null;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player   = usePlayer();
  const playlist = usePlaylist();
  const search   = useSearch();

  const handleToggleShuffle = () => {
    player.toggleShuffle();
    if (!player.isShuffle) playlist.shufflePlaylist();
  };

  const value: PlayerContextValue = {
    nowPlaying:          player.nowPlaying,
    isPlaying:           player.isPlaying,
    currentTime:         player.currentTime,
    duration:            player.duration,
    volume:              player.volume,
    repeatMode:          player.repeatMode,
    isShuffle:           player.isShuffle,
    historyItems:        player.historyItems,
    currentNode:         player.currentNode,
    playSong:            player.playSong,
    next:                player.next,
    prev:                player.prev,
    togglePlay:          player.togglePlay,
    seek:                player.seek,
    seekTo:              player.seekTo,
    setVolumeLevel:      player.setVolumeLevel,
    cycleRepeatMode:     player.cycleRepeatMode,
    toggleShuffle:       handleToggleShuffle,
    songs:               playlist.songs,
    addToQueue:          playlist.addToQueue,
    playNext:            playlist.playNext,
    removeSong:          playlist.removeSong,
    shufflePlaylist:     playlist.shufflePlaylist,
    reversePlaylist:     playlist.reversePlaylist,
    clearPlaylist:       playlist.clearPlaylist,
    updateSongDuration:  playlist.updateSongDuration,
    dll:                 playlist.dll,
    query:               search.query,
    setQuery:            search.setQuery,
    results:             search.results,
    isLoading:           search.isLoading,
    searchError:         search.error,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayerContext(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayerContext must be used within PlayerProvider');
  return ctx;
}
