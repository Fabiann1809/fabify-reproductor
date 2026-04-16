import { usePlayerContext } from '../../context/PlayerContext';
import { SongCard } from '../song/SongCard';

interface SearchResultsProps {
  showQueueActions?: boolean;
}

export function SearchResults({ showQueueActions = false }: SearchResultsProps) {
  const { results, isLoading, searchError, query } = usePlayerContext();

  if (!query.trim()) {
    return (
      <div className="empty-state">
        <p>Search your favorite songs</p>
        <small>Type the name of an artist or song</small>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p>Searching...</p>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="empty-state empty-state--error">
        <p>{searchError}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <p>No results found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="song-list">
      {results.map((song) => (
        <SongCard key={song.id} song={song} showQueueActions={showQueueActions} />
      ))}
    </div>
  );
}
