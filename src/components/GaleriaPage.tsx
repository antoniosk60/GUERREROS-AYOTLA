import { useState, useEffect } from 'react';
import { Image as ImageIcon, Camera, Eye, Zap, ImagePlay } from 'lucide-react';
import { Photo } from '../types';

export default function GaleriaPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<'all' | 'facilities' | 'matches' | 'events'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const filteredPhotos = filter === 'all' 
    ? photos 
    : photos.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Visual Title */}
      <div className="space-y-4 text-center lg:text-left">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full select-none">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">Galería de Imágenes Guerreros Ayotla</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Nuestras Instalaciones en Acción
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Explora fotos de nuestras tres canchas equipadas, partidos de liga amateur y ceremonias de premiación. ¡Te esperamos para formar parte de la historia deportiva del complejo!
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center lg:justify-start pb-2 border-b border-emerald-950/20">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'all' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/15'
          }`}
        >
          Todo el Complejo
        </button>

        <button
          onClick={() => setFilter('facilities')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'facilities' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/15'
          }`}
        >
          Infraestructura (Canchas)
        </button>

        <button
          onClick={() => setFilter('matches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'matches' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/15'
          }`}
        >
          Partidos en Curso
        </button>

        <button
          onClick={() => setFilter('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'events' ? 'bg-emerald-500 text-black font-extrabold' : 'text-gray-400 hover:text-white bg-emerald-950/15'
          }`}
        >
          Torneos y Premiaciones
        </button>
      </div>

      {/* Photo Grid Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-xs font-mono text-emerald-400">Cargando catálogo visual...</div>
      ) : filteredPhotos.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-gray-400">
          No hay fotografías en esta sección actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="glass-panel overflow-hidden rounded-2xl border border-emerald-950/40 hover:border-emerald-500/20 transition-all duration-300 group cursor-pointer relative"
              title="Click para ampliar"
            >
              <div className="h-60 overflow-hidden relative">
                <img 
                  src={photo.url} 
                  alt={photo.caption} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                
                {/* On hover view badge */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-emerald-500 text-black rounded-full p-3 font-bold flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Eye className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur rounded uppercase font-mono font-bold text-[8px] px-2 py-0.5 text-emerald-400">
                  {photo.category}
                </span>
              </div>

              {/* Caption */}
              <div className="p-4 bg-emerald-950/5 text-left border-t border-emerald-950/10">
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-light">
                  {photo.caption}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal Popup */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden text-center space-y-4">
            <img 
              src={previewPhoto.url} 
              alt={previewPhoto.caption} 
              className="max-w-full max-h-[70vh] rounded-2xl border border-emerald-500/15 object-contain shadow-2xl mx-auto"
            />
            <div className="max-w-2xl mx-auto text-center px-4">
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest">{previewPhoto.category}</span>
              <p className="text-white text-sm sm:text-base mt-1.5 leading-relaxed font-medium">{previewPhoto.caption}</p>
              <span className="text-[11px] text-gray-500 font-mono block mt-2">Haz clic en cualquier parte para cerrar</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
