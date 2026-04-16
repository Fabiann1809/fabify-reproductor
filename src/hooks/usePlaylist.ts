import { useRef, useState, useCallback } from 'react';
import { Queue } from '../lib/Queue';
import type { SongNode } from '../lib/Queue';
import type { Song } from '../types/song';
import { revokeObjectURL } from '../services/LocalFileService';



export function usePlaylist() {
  const dll           = useRef(new Queue<Song>());
  // Saves IDs in original order before shuffle.
  const originalOrder = useRef<string[] | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  const syncArray = useCallback(() => {
    setSongs(dll.current.toArray());
  }, []);

  const addToQueue = useCallback((song: Song): SongNode<Song> => {
    const node = dll.current.append(song);
    syncArray();
    return node;
  }, [syncArray]);

  const playNext = useCallback((song: Song, currentNode: SongNode<Song> | null): SongNode<Song> => {
    let node: SongNode<Song>;
    if (currentNode === null) {
      node = dll.current.append(song);
    } else {
      node = dll.current.insertAfter(currentNode, song);
    }
    syncArray();
    return node;
  }, [syncArray]);

  const removeSong = useCallback((node: SongNode<Song>) => {
    if (node.value.source === 'local') {
      revokeObjectURL(node.value.id);
    }
    dll.current.remove(node);
    syncArray();
  }, [syncArray]);

  // Saves original order (IDs) and shuffles without recreating nodes.
  const shufflePlaylist = useCallback((anchorNode?: SongNode<Song> | null) => {
    if (originalOrder.current === null) {
      originalOrder.current = dll.current.toArray().map(s => s.id);
    }
    dll.current.shuffleNodes(anchorNode);
    syncArray();
  }, [syncArray]);

  // Restores previous order by locating nodes by ID.
  // If anchorNode (current song) is provided, list is rotated so it stays first.
  const restoreOriginalOrder = useCallback((anchorNode?: SongNode<Song> | null) => {
    if (!originalOrder.current) return;

    const savedIds = originalOrder.current;
    const restoredNodes: SongNode<Song>[] = [];
    for (const id of savedIds) {
      const node = dll.current.findNode(s => s.id === id);
      if (node) restoredNodes.push(node);
    }

    // Songs added during shuffle are appended at the end.
    const restoredSet = new Set(restoredNodes);
    const newNodes = dll.current.getNodes().filter(n => !restoredSet.has(n));
    let finalOrder = [...restoredNodes, ...newNodes];

    // Rotate so the current song stays first.
    if (anchorNode) {
      const anchorIdx = finalOrder.indexOf(anchorNode);
      if (anchorIdx > 0) {
        finalOrder = [...finalOrder.slice(anchorIdx), ...finalOrder.slice(0, anchorIdx)];
      }
    }

    dll.current.reorderNodes(finalOrder);
    originalOrder.current = null;
    syncArray();
  }, [syncArray]);

  const reversePlaylist = useCallback(() => {
    dll.current.reverse();
    syncArray();
  }, [syncArray]);

  const clearPlaylist = useCallback(() => {
    for (const song of dll.current.toArray()) {
      if (song.source === 'local') revokeObjectURL(song.id);
    }
    dll.current.clear();
    syncArray();
  }, [syncArray]);

  const moveNode = useCallback((draggedId: string, afterId: string | null) => {
    const draggedNode = dll.current.findNode((s) => s.id === draggedId);
    if (!draggedNode) return;
    if (afterId === null) {
      dll.current.moveAfter(draggedNode, null);
    } else {
      const afterNode = dll.current.findNode((s) => s.id === afterId);
      if (!afterNode) return;
      dll.current.moveAfter(draggedNode, afterNode);
    }
    syncArray();
  }, [syncArray]);

  const updateSongDuration = useCallback((songId: string, durationMs: number) => {
    const node = dll.current.findNode((s) => s.id === songId);
    if (node) {
      node.value = { ...node.value, durationMs };
      syncArray();
    }
  }, [syncArray]);

  return {
    dll,
    songs,
    addToQueue,
    playNext,
    removeSong,
    shufflePlaylist,
    restoreOriginalOrder,
    reversePlaylist,
    clearPlaylist,
    updateSongDuration,
    moveNode,
  };
}
