
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { ImageCloudService } from '../services/imageService';
import { Bracelet } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onSave: (item: Bracelet) => Promise<void>;
  initialData?: Bracelet | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [karats, setKarats] = useState<number>(18);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(initialData.price.toString());
      setWeight(initialData.weight.toString());
      setKarats(initialData.karats);
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAiDescription = async () => {
    if (!name && !imagePreview) return;
    setIsGenerating(true);
    try {
      if (imagePreview && !name) {
        const result = await GeminiService.analyzeImageAndSuggestName(imagePreview);
        setName(result.name);
        setDescription(result.description);
      } else {
        const desc = await GeminiService.generateLuxuryDescription(name, Number(weight) || 0, karats);
        setDescription(desc);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !imagePreview || !price || status !== 'idle') return;

    try {
      let cloudImageUrl = imagePreview;

      // Solo subir a Cloudinary si la imagen es nueva (base64)
      if (imagePreview.startsWith('data:image')) {
        setStatus('uploading');
        try {
          cloudImageUrl = await ImageCloudService.uploadImage(imagePreview);
        } catch (imgError: any) {
          alert("⚠️ ERROR DE IMAGEN: No se pudo subir la foto.");
          setStatus('idle');
          return;
        }
      }
      
      setStatus('saving');
      const itemToSave: Bracelet = {
        id: initialData ? initialData.id : `br_${Date.now()}`,
        name,
        description,
        price: Number(price),
        weight: Number(weight),
        karats,
        imageUrl: cloudImageUrl,
        createdAt: initialData ? initialData.createdAt : Date.now(),
      };

      try {
        await onSave(itemToSave);
        onClose();
      } catch (dbError: any) {
        if (dbError.message === "LocalOnly") {
          alert("✅ Guardado localmente. Se sincronizará con la nube pronto.");
          onClose();
        } else {
          alert("⚠️ ERROR DE CONEXIÓN: No se pudieron guardar los cambios.");
        }
      }
    } catch (error) {
      alert("Error inesperado.");
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="bg-zinc-900 border border-gold-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Preview */}
        <div className="w-full md:w-1/2 bg-zinc-950 flex items-center justify-center relative min-h-[300px] border-b md:border-b-0 md:border-r border-zinc-800 group">
          {imagePreview ? (
            <>
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs uppercase tracking-widest"
              >
                Cambiar Imagen
              </button>
            </>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="text-zinc-600 hover:text-gold-500 flex flex-col items-center gap-4 transition-all">
              <div className="p-8 border-2 border-dashed border-zinc-800 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <span className="text-xs uppercase tracking-widest font-bold">Tomar Foto / Subir</span>
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gold-text serif">
              {initialData ? 'Editar Pieza' : 'Añadir al Inventario Cloud'}
            </h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input 
              value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl outline-none focus:border-gold-500 transition-all text-white"
              placeholder="Nombre de la Manilla" required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 ml-2">Precio ($)</label>
                <input 
                  type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl outline-none text-white"
                  placeholder="0.00" required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 ml-2">Peso (g)</label>
                <input 
                  type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl outline-none text-white"
                  placeholder="0.00" required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 ml-2">Ley del Oro</label>
              <select 
                value={karats} onChange={e => setKarats(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl outline-none appearance-none cursor-pointer text-white"
              >
                <option value={18}>Oro 18K (Ley 750)</option>
                <option value={22}>Oro 22K</option>
                <option value={24}>Oro 24K (Puro)</option>
              </select>
            </div>

            <div className="relative space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 ml-2">Descripción de Lujo</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl outline-none min-h-[120px] text-white"
                placeholder="Describe la pieza..." required
              />
              <button 
                type="button" onClick={handleAiDescription} disabled={isGenerating}
                className="absolute bottom-3 right-3 text-[10px] text-gold-400 font-bold uppercase flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md"
              >
                {isGenerating ? "Mejorando..." : "✨ Usar IA"}
              </button>
            </div>

            <button 
              type="submit"
              disabled={status !== 'idle' || !imagePreview}
              className="w-full gold-gradient text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg"
            >
              {status === 'uploading' && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
              {status === 'uploading' ? 'Sincronizando Imagen...' : status === 'saving' ? 'Guardando en la Nube...' : initialData ? 'Guardar Cambios' : 'Publicar en Catálogo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
