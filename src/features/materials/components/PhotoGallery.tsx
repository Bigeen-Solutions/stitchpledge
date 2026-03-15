interface PhotoGalleryProps {
  photos: string[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="photo-gallery grid grid-cols-4 gap-sm mt-md">
      {photos.map((url, i) => (
        <div 
          key={i} 
          className="photo-item sf-glass" 
          style={{ 
            aspectRatio: '1', 
            borderRadius: 'var(--radius-sm)', 
            overflow: 'hidden',
            border: '1px solid var(--color-border)'
          }}
        >
          <img 
            src={url} 
            alt={`Intake Evidence ${i + 1}`} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      ))}
    </div>
  );
}
