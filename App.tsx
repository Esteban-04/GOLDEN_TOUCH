
import React, { useState, useEffect, useCallback } from 'react';
import { CloudStorage } from './services/storageService';
import { Bracelet } from './types';
import BraceletCard from './components/BraceletCard';
import UploadModal from './components/UploadModal';

const ADMIN_PASSWORD = 'G0LD2026';

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
      // Caso Edición
      await CloudStorage.updateItem(item);
      setBracelets(prev => prev.map(b => b.id === item.id ? item : b));
    } else {
      // Caso Nuevo
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
    <div className="min-h-screen bg-black text-white selection:bg-gold-500 selection:text-black">
      {/* Top Utility Bar */}
      <div className="bg-zinc-900/50 py-1 px-6 flex justify-end items-center border-b border-zinc-800/30">
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest">Modo Administrador</span>
              <button onClick={handleLogout} className="text-[10px] text-zinc-500 hover:text-white uppercase transition-colors">Cerrar Sesión</button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="text-[10px] text-zinc-600 hover:text-gold-500 uppercase tracking-[0.2em] font-bold transition-colors"
            >
              Acceso Privado
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20">
              <span className="text-black font-black text-xl serif">GT</span>
            </div>
            <h1 className="text-2xl font-black gold-text uppercase tracking-widest hidden sm:block">
              Golden Touch
            </h1>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar en el catálogo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full px-12 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-4">
            {isAdmin && (
              <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="gold-gradient text-black px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Añadir Pieza</span>
              </button>
            )}
            {!isAdmin && (
               <a 
               href="https://wa.me/573114624643" 
               target="_blank" 
               className="border border-gold-500/30 text-gold-500 px-6 py-2 rounded-full font-bold text-sm hover:bg-gold-500/10 transition-colors"
             >
               Consultar
             </a>
            )}
          </div>
        </div>
      </nav>

      {/* Catalog Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
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
            <h3 className="text-zinc-500 uppercase tracking-widest text-sm">Catálogo Vacío</h3>
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="luxury-card w-full max-w-md p-10 rounded-3xl border-gold-500/50">
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
                <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 text-zinc-500 text-xs font-bold uppercase tracking-widest py-4">Cancelar</button>
                <button type="submit" className="flex-[2] gold-gradient text-black font-bold py-4 rounded-xl uppercase tracking-widest text-xs">Entrar</button>
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
