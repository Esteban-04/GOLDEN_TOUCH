
import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { Bracelet } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onSave: (item: Bracelet) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [karats, setKarats] = useState<number>(18);
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiDescription = async () => {
    if (!name && !image) return;
    setIsGenerating(true);
    try {
      if (image && !name) {
        const result = await GeminiService.analyzeImageAndSuggestName(image);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image || !price) return;

    const newItem: Bracelet = {
      id: Date.now().toString(),
      name,
      description,
      price: Number(price),
      weight: Number(weight),
      karats,
      imageUrl: image,
      createdAt: Date.now(),
    };

    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-gold-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Image Preview Area */}
        <div className="w-full md:w-1/2 bg-zinc-950 flex items-center justify-center relative min-h-[300px]">
          {image ? (
            <>
              <img src={image} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-white hover:bg-black"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 text-zinc-500 hover:text-gold-400 transition-colors"
            >
              <div className="p-6 border-2 border-dashed border-zinc-800 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium">Subir Foto de Manilla</span>
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        {/* Form Area */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold gold-text">Añadir a Nube</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Nombre de la Pieza</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold-500 text-white"
                placeholder="Ej. Pulsera Emperatriz"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Precio ($)</label>
                <input 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold-500 text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Peso (g)</label>
                <input 
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold-500 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Quilates</label>
              <select 
                value={karats}
                onChange={(e) => setKarats(Number(e.target.value))}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold-500 text-white appearance-none"
              >
                <option value={14}>14K</option>
                <option value={18}>18K</option>
                <option value={22}>22K</option>
                <option value={24}>24K</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Descripción</label>
                <button 
                  type="button"
                  onClick={handleAiDescription}
                  disabled={isGenerating || (!name && !image)}
                  className="text-[10px] text-gold-400 font-bold uppercase tracking-widest flex items-center gap-1 hover:text-gold-300 disabled:opacity-50"
                >
                  {isGenerating ? 'Generando...' : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Usar Toque de Oro (IA)
                    </>
                  )}
                </button>
              </div>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold-500 text-white min-h-[100px]"
                placeholder="Describe la elegancia de esta pieza..."
              />
            </div>

            <button 
              type="submit"
              disabled={!name || !image || !price}
              className="w-full gold-gradient text-black font-bold py-4 rounded-xl shadow-lg shadow-gold-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
              Guardar en la Nube
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
