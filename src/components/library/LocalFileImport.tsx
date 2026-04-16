import { useRef, useState } from 'react';
import { usePlayerContext } from '../../context/PlayerContext';
import { importLocalFiles, getAudioDuration } from '../../services/LocalFileService';

interface LocalFileImportProps {
  compact?: boolean; // renders as a sidebar button instead of drag-drop area
}

export function LocalFileImport({ compact = false }: LocalFileImportProps) {
  const { addToQueue, updateSongDuration } = usePlayerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList) => {
    const songs = importLocalFiles(files);
    for (const song of songs) {
      addToQueue(song);
      const durationMs = await getAudioDuration(song.previewUrl);
      if (durationMs > 0) {
        updateSongDuration(song.id, durationMs);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  if (compact) {
    return (
      <button
        className="sidebar__upload-btn"
        onClick={() => fileInputRef.current?.click()}
        title="Import audio files"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
        </svg>
        Upload local file
      </button>
    );
  }

  return (
    <div
      className={`file-import ${isDragging ? 'file-import--dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="file-import__input"
        onChange={handleFileChange}
      />
      <span className="file-import__icon">🎵</span>
      <p className="file-import__text">
        {isDragging ? 'Drop files here' : 'Drag audio files or click to import'}
      </p>
    </div>
  );
}
