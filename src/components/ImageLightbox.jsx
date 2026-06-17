import { useEffect } from 'react'
import { Minus, Plus, RotateCcw, X } from 'lucide-react'
import { useImageZoom } from '../hooks/useImageZoom'

function ZoomableImage({ imageUrl, alt }) {
  const {
    scale,
    position,
    rotation,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    reset,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useImageZoom(imageUrl)

  return (
    <>
      <div
        className={`flex max-h-[85vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-[12px] bg-black/20 ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="max-h-[85vh] max-w-[90vw] select-none object-contain"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: 'center center',
            transition: scale === 1 ? 'transform 150ms ease' : 'none',
          }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-lg">
        <button
          type="button"
          onClick={zoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom out"
          className="rounded-full p-2 text-black transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus size={16} />
        </button>
        <span className="w-12 text-center text-xs font-semibold text-black">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom in"
          className="rounded-full p-2 text-black transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
        <span className="mx-1 h-5 w-px bg-[#e5e5e5]" />
        <button
          type="button"
          onClick={reset}
          aria-label="Reset zoom"
          className="rounded-full p-2 text-black transition hover:bg-[#f5f5f5]"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </>
  )
}

export default function ImageLightbox({ imageUrl, alt = 'Customer photo', isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation?.()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeydown, true)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeydown, true)
    }
  }, [isOpen, onClose])

  if (!isOpen || !imageUrl) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[96vh] max-w-[96vw] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image preview"
          className="fixed right-4 top-4 z-[110] rounded-full bg-white p-2 text-black shadow-lg transition hover:bg-[#f5f5f5]"
        >
          <X size={18} />
        </button>

        <ZoomableImage key={`${imageUrl}:${alt}`} imageUrl={imageUrl} alt={alt} />
      </div>
    </div>
  )
}
