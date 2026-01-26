
import React, { useState, useEffect, useCallback } from 'react';
import { CloudStorage } from './services/storageService';
import { Bracelet } from './types';
import BraceletCard from './components/BraceletCard';
import UploadModal from './components/UploadModal';

const ADMIN_PASSWORD = 'G0LD2026';

const App: React.FC = () => {
  const [bracelets, setBracelets] = useState<Bracelet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    await CloudStorage.saveItem(item);
    setBracelets(prev => [item, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) return;
    if (confirm("¿Seguro que quieres eliminar esta pieza del catálogo?")) {
      await CloudStorage.deleteItem(id);
      setBracelets(prev => prev.filter(i => i.id !== id));
    }
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
                onClick={() => setIsModalOpen(true)}
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

      {/* Hero / Header */}
      <header className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-7xl font-light mb-8 serif tracking-tight">Elegancia Eterna</h2>
        <p className="max-w-2xl mx-auto text-zinc-400 font-light text-lg leading-relaxed">
          Descubra nuestra colección exclusiva de orfebrería fina en oro de 18k. 
          Diseños de autor pensados para perdurar en el tiempo.
        </p>
      </header>

      {/* Main Catalog Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-zinc-500 animate-pulse uppercase tracking-widest text-xs">Cargando catálogo...</p>
          </div>
        ) : filteredBracelets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBracelets.map(bracelet => (
              <BraceletCard 
                key={bracelet.id} 
                bracelet={bracelet} 
                onDelete={handleDeleteItem}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
            <div className="w-20 h-20 mx-auto bg-zinc-900 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-zinc-500 mb-2 uppercase tracking-widest text-sm">Catálogo Vacío</h3>
            <p className="text-zinc-600 mb-8 max-w-sm mx-auto">Próximamente nuevas piezas exclusivas de nuestra colección.</p>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-gold-500 font-bold uppercase tracking-widest text-xs border border-gold-500/30 px-6 py-3 rounded-full hover:bg-gold-500/5 transition-all"
              >
                Añadir Primera Manilla
              </button>
            )}
          </div>
        )}
      </main>

      {/* Contact Us Section */}
      <section className="bg-zinc-900/20 py-24 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-12 serif">Contáctanos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl">
            <a href="https://wa.me/573114624643" target="_blank" rel="noopener noreferrer" className="luxury-card p-10 rounded-3xl group flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 text-green-500 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              </div>
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Ventas & WhatsApp</span>
              <span className="text-xl font-bold text-white">+57 311 4624643</span>
            </a>
            <a href="https://instagram.com/Golden_Touch_18k" target="_blank" rel="noopener noreferrer" className="luxury-card p-10 rounded-3xl group flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-600/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 text-pink-500 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.247 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.247-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.247-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.247 3.608-1.308 1.266-.058-1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.312.06-2.208.267-2.992.573-.81.315-1.497.736-2.181 1.42-.684.684-1.105 1.371-1.42 2.181-.306.784-.513 1.68-.573 2.992-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.06 1.312.267 2.208.573 2.992.315.81.736 1.497 1.42 2.181.684.684 1.371 1.105 2.181 1.42.784.306 1.68.513 2.992.573 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.312-.06 2.208-.267 2.992-.573.81-.315 1.497-.736 2.181-1.42.684-.684 1.105-1.371 1.42-2.181.306-.784.513-1.68.573-2.992.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.06-1.312-.267-2.208-.573-2.992-.315-.81-.736-1.497-1.42-2.181-.684-.684-1.371-1.105-2.181-1.42-.784-.306-1.68-.513-2.992-.573-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44-1.44-.645-1.44-1.44.645-1.44 1.44-1.44z"/></svg>
              </div>
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Instagram Oficial</span>
              <span className="text-xl font-bold text-white">@Golden_Touch_18k</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 gold-gradient rounded-full"></div>
              <span className="font-bold gold-text uppercase tracking-widest text-xl serif">Golden Touch</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs mb-8">Orfebrería de alta gama y diseños exclusivos de 18k. Su joyería de confianza.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Empresa</h4>
              <ul className="text-zinc-500 text-xs space-y-4">
                <li><a href="#" className="hover:text-gold-500 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-gold-500 transition-colors">Taller de Joyería</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Contacto</h4>
              <ul className="text-zinc-500 text-xs space-y-4">
                <li><a href="tel:+573114624643" className="hover:text-gold-500 transition-colors">+57 311 4624643</a></li>
                <li><a href="https://instagram.com/Golden_Touch_18k" className="hover:text-gold-500 transition-colors">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Servicios</h4>
              <ul className="text-zinc-500 text-xs space-y-4">
                <li>Diseño Personalizado</li>
                <li>Garantía de por Vida</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest">
          <span>© 2026 Golden Touch Inc. Joyería de Autor.</span>
          <span>Bogotá, Colombia</span>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="luxury-card w-full max-w-md p-10 rounded-3xl border-gold-500/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold gold-text serif">Acceso Admin</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">Introduce la clave maestra</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full bg-zinc-900 border ${loginError ? 'border-red-500' : 'border-zinc-800'} rounded-xl px-4 py-4 text-center text-white focus:outline-none focus:border-gold-500 text-lg tracking-[0.5em]`}
                  placeholder="••••••••"
                  autoFocus
                />
                {loginError && <p className="text-red-500 text-[10px] text-center mt-2 uppercase tracking-widest">Clave Incorrecta</p>}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => {setShowLoginModal(false); setLoginError(false);}} className="flex-1 text-zinc-500 text-xs font-bold uppercase tracking-widest py-4 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] gold-gradient text-black font-bold py-4 rounded-xl uppercase tracking-widest text-xs">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && isAdmin && (
        <UploadModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};

export default App;