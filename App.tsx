
import React, { useState, useEffect, useCallback } from 'react';
import { CloudStorage } from './services/storageService';
import { Bracelet } from './types';
import BraceletCard from './components/BraceletCard';
import UploadModal from './components/UploadModal';

const ADMIN_PASSWORD = 'G0LD2026';
const WHATSAPP_NUMBER = '573114624643';
const INSTAGRAM_USER = 'Golden_Touch_18k';

const App: React.FC = () => {
  const [bracelets, setBracelets] = useState<Bracelet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Bracelet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await CloudStorage.getAllItems();
    setBracelets(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const storedAuth = sessionStorage.getItem('gt_admin_auth');
    if (storedAuth === 'true') setIsAdmin(true);
  }, [loadData]);

  const handleSaveItem = async (item: Bracelet) => {
    if (!isAdmin) return;
    
    if (editingItem) {
      await CloudStorage.updateItem(item);
      setBracelets(prev => prev.map(b => b.id === item.id ? item : b));
    } else {
      await CloudStorage.saveItem(item);
      setBracelets(prev => [item, ...prev]);
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) return;
    if (confirm("¿Seguro que quieres eliminar esta pieza del catálogo?")) {
      await CloudStorage.deleteItem(id);
      setBracelets(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleEditClick = (item: Bracelet) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('gt_admin_auth', 'true');
      setShowLoginModal(false);
      setLoginPassword('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('gt_admin_auth');
  };

  const filteredBracelets = bracelets.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold-500 selection:text-black flex flex-col">
      {/* Top Utility Bar */}
      <div className="bg-zinc-900/80 py-2 px-6 flex justify-between items-center border-b border-zinc-800/30 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="flex items-center gap-2 text-[10px] text-zinc-400 hover:text-green-500 transition-colors uppercase tracking-widest font-bold">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            WhatsApp
          </a>
          <a href={`https://instagram.com/${INSTAGRAM_USER}`} target="_blank" className="flex items-center gap-2 text-[10px] text-zinc-400 hover:text-pink-500 transition-colors uppercase tracking-widest font-bold">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Instagram
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-[9px] text-zinc-500 uppercase tracking-widest">La Palma, Cundinamarca</span>
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-gold-400 font-bold uppercase tracking-[0.2em]">ADMIN</span>
              <button onClick={handleLogout} className="text-[9px] text-zinc-500 hover:text-white uppercase transition-colors font-bold">Salir</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="text-[9px] text-zinc-600 hover:text-gold-500 uppercase tracking-[0.2em] font-bold transition-colors"
            >
              Acceso Privado
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20">
              <span className="text-black font-black text-xl serif">GT</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black gold-text uppercase tracking-widest leading-none">
                Golden Touch
              </h1>
              <span className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] mt-1">Alta Joyería 18K</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar diseños exclusivos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full px-12 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {isAdmin && (
              <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="gold-gradient text-black px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nueva Pieza</span>
              </button>
            )}
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" 
              className="border border-gold-500/30 text-gold-500 px-6 py-2 rounded-full font-bold text-sm hover:bg-gold-500/10 transition-colors flex items-center gap-2"
            >
              Consultar WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* Catalog Grid */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBracelets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBracelets.map(bracelet => (
              <BraceletCard 
                key={bracelet.id} 
                bracelet={bracelet} 
                onDelete={handleDeleteItem}
                onEdit={handleEditClick}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <h3 className="text-zinc-500 uppercase tracking-widest text-sm">No hay piezas que coincidan con tu búsqueda</h3>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gold-gradient rounded-full flex items-center justify-center">
                <span className="text-black font-black text-sm serif">GT</span>
              </div>
              <h2 className="text-xl font-black gold-text uppercase tracking-[0.2em]">Golden Touch</h2>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Exclusividad y arte en joyería fina de 18k. Cada pieza es diseñada para perdurar y brillar con luz propia desde La Palma para toda Colombia.
            </p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Información de Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="text-zinc-400 text-sm">
                  <span className="block text-white font-medium">Línea Directa</span>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-gold-500 transition-colors">+57 311 462 4643</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-zinc-400 text-sm">
                  <span className="block text-white font-medium">Nuestra Ubicación</span>
                  La Palma, Cundinamarca - Envíos a todo el país
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Nuestras Redes</h3>
            <div className="flex gap-4">
              <a href={`https://instagram.com/${INSTAGRAM_USER}`} target="_blank" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 hover:border-gold-500 text-zinc-400 hover:text-gold-500 transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 hover:border-green-500 text-zinc-400 hover:text-green-500 transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              </a>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pt-4">© 2026 Golden Touch Jewelry - Colombia</p>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="luxury-card w-full max-w-md p-10 rounded-3xl border-gold-500/50">
            <h2 className="text-center gold-text text-xs font-bold uppercase tracking-[0.4em] mb-8">Panel Administrativo</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`w-full bg-zinc-900 border ${loginError ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-4 text-center text-white focus:outline-none focus:border-gold-500 text-lg tracking-[0.5em]`}
                placeholder="••••••••"
                autoFocus
              />
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 text-zinc-500 text-[10px] font-bold uppercase tracking-widest py-4">Cerrar</button>
                <button type="submit" className="flex-[2] gold-gradient text-black font-bold py-4 rounded-xl uppercase tracking-widest text-xs">Acceder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isModalOpen && isAdmin && (
        <UploadModal 
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveItem}
          initialData={editingItem}
        />
      )}
    </div>
  );
};

export default App;
