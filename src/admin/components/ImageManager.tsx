import { useMemo } from 'react'
import type { TimelineEvent } from '../../App'

interface ImageManagerProps {
  events: TimelineEvent[]
  onDelete: (eventId: string, imageId: string) => void
}

export default function ImageManager({ events, onDelete }: ImageManagerProps) {
  const images = useMemo(() => {
    return events.flatMap((e) => (e.images || []).map((img) => ({ ...img, eventId: e.id })))
  }, [events])

  return (
    <section className="image-manager">
      <h2 className="section-title">图片管理</h2>
      <div className="image-preview-list">
        {images.map((img) => (
          <div key={`${img.eventId}-${img.id}`} className="image-preview-item">
            <img src={img.src} alt={img.alt} />
            <button className="remove-image-btn" onClick={() => onDelete(img.eventId, img.id)}>×</button>
          </div>
        ))}
      </div>
    </section>
  )
}

