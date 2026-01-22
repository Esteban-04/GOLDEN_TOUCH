
import React from 'react';
import { Bracelet } from '../types';

interface BraceletCardProps {
  bracelet: Bracelet;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const BraceletCard: React.FC<BraceletCardProps> = ({ bracelet, onDelete, isAdmin }) => {
  const whatsappUrl = `https://wa.me/573114624643?text=${encodeURIComponent(`Hola Golden Touch, me interesa la manilla "${bracelet.name}" de ${bracelet.karats}K.`)}`;

  return (
    <div className="luxury-card rounded-2xl overflow-hidden group">
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        <img 
          src={bracelet.imageUrl} 
          alt={bracelet.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAdmin && (
            <button 
              onClick={() => onDelete(bracelet.id)}
              className="bg-black/50 hover:bg-red-600/80 p-2 rounded-full backdrop-blur-md transition-colors"
              title="Eliminar de la nube"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600/80 hover:bg-green-600 p-2 rounded-full backdrop-blur-md transition-colors flex items-center justify-center"
            title="Consultar por WhatsApp"
          >
            <svg className="h-4 w-4 text-white fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
          </a>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="bg-black/60 backdrop-blur-md text-[10px] px-2 py-1 rounded-full border border-gold-300 text-yellow-500 font-bold uppercase tracking-widest">
            {bracelet.karats}K
          </span>
          <span className="bg-black/60 backdrop-blur-md text-[10px] px-2 py-1 rounded-full border border-zinc-700 text-zinc-300 font-medium uppercase tracking-widest">
            {bracelet.weight}g
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-1 gold-text truncate">{bracelet.name}</h3>
        <p className="text-zinc-400 text-sm line-clamp-2 h-10 mb-4">{bracelet.description}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-light text-white serif">
            ${bracelet.price.toLocaleString()}
          </span>
          <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-500 uppercase tracking-tighter hover:text-gold-400 transition-colors flex items-center gap-1"
          >
            Preguntar
          </a>
        </div>
      </div>
    </div>
  );
};

export default BraceletCard;
