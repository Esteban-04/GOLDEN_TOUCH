
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
        {/* Preview & Edit Image */}
        <div className="w-full md:w-1/2 bg-zinc-950 flex items-center justify-center relative min-h-[300px] border-b md:border-b-0 md:border-r border-zinc-800 group">
          {imagePreview ? (
            <>
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span className="font-bold text-[10px] uppercase tracking-widest">Cambiar Foto</span>
              </button>
            </>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-zinc-600 hover:text-gold-500 flex flex-col items-center gap-4 transition-all">
              <div className="p-8 border-2 border-dashed border-zinc-800 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs uppercase tracking-widest font-bold">Añadir Foto Principal</span>
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gold-text serif">
              {initialData ? 'Editar Pieza' : 'Nuevo Registro'}
            </h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 ml-2 tracking-widest font-bold">Nombre del Diseño</label>
              <input 
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl outline-none focus:border-gold-500 transition-all text-white"
                placeholder="Ej: Manilla Cartier Especial" required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 ml-2 tracking-widest font-bold">Valor en Pesos</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 font-bold">$</span>
                  <input 
                    type="number" value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 p-3 pl-8 rounded-xl outline-none text-white focus:border-gold-500"
                    placeholder="0" required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 ml-2 tracking-widest font-bold">Peso Gramos</label>
                <input 
                  type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl outline-none text-white focus:border-gold-500"
                  placeholder="0.00" required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 ml-2 tracking-widest font-bold">Ley del Oro</label>
              <select 
                value={karats} onChange={e => setKarats(Number(e.target.value))}
                className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl outline-none appearance-none cursor-pointer text-white focus:border-gold-500"
              >
                <option value={18}>Oro 18K (Ley 750)</option>
                <option value={22}>Oro 22K</option>
                <option value={24}>Oro 24K (Puro)</option>
              </select>
            </div>

            <div className="relative space-y-1">
              <label className="text-[10px] uppercase text-zinc-500 ml-2 tracking-widest font-bold">Descripción de Lujo</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 p-3 rounded-xl outline-none min-h-[120px] text-white focus:border-gold-500 resize-none"
                placeholder="Describe los detalles de la pieza..." required
              />
              <button 
                type="button" onClick={handleAiDescription} disabled={isGenerating}
                className="absolute bottom-3 right-3 text-[10px] text-gold-400 font-bold uppercase flex items-center gap-1 bg-black/80 px-3 py-1.5 rounded-full border border-gold-500/30 hover:bg-gold-500/10 transition-colors shadow-lg"
              >
                {isGenerating ? (
                  <div className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                ) : "✨ IA"} 
                <span>{isGenerating ? "Mejorando..." : "Redactar"}</span>
              </button>
            </div>

            <button 
              type="submit"
              disabled={status !== 'idle' || !imagePreview}
              className="w-full gold-gradient text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-gold-500/10 uppercase tracking-[0.2em] text-xs"
            >
              {status === 'uploading' && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
              {status === 'uploading' ? 'Sincronizando Imagen...' : status === 'saving' ? 'Guardando en la Nube...' : initialData ? 'Confirmar Edición' : 'Publicar en Catálogo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
