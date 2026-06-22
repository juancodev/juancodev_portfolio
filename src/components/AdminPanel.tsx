import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Lock, X, LogOut, Plus, Trash2, Edit2, 
  Save, Globe, Key, Layout, Code, ExternalLink, RefreshCw, Database
} from 'lucide-react';
import { ApiProject, DbStatus } from '../hooks/useApiProjects';

interface AdminPanelProps {
  projects: ApiProject[];
  dbStatus: DbStatus | null;
  onAdd: (proj: Omit<ApiProject, '_id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, proj: Partial<Omit<ApiProject, '_id' | 'createdAt'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReload: () => Promise<void>;
}

const GRADIENT_PRESETS = [
  { name: 'Cian → Púrpura', value: 'from-accent-cyan to-accent-purple' },
  { name: 'Púrpura → Rosa', value: 'from-purple-500 to-pink-500' },
  { name: 'Esmeralda → Azul', value: 'from-emerald-400 to-blue-500' },
  { name: 'Naranja → Rojo', value: 'from-orange-500 to-red-600' },
  { name: 'Blanco → Pizarra', value: 'from-white to-slate-500' },
];

export default function AdminPanel({ projects, dbStatus, onAdd, onUpdate, onDelete, onReload }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);

  useEffect(() => {
    const isDev = (import.meta as any).env?.DEV || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
    
    const params = new URLSearchParams(window.location.search);
    const hasAdminParam = params.get('admin') === 'true';
    const wasActivated = localStorage.getItem('juancodev_admin_active') === 'true';

    if (isDev || hasAdminParam || wasActivated) {
      setShowTrigger(true);
      if (hasAdminParam) {
        localStorage.setItem('juancodev_admin_active', 'true');
      }
    }
  }, []);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Project Form State
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleEs, setTitleEs] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descEs, setDescEs] = useState('');
  const [descEn, setDescEn] = useState('');
  const [link, setLink] = useState('');
  const [color, setColor] = useState(GRADIENT_PRESETS[0].value);
  const [techInput, setTechInput] = useState('');
  const [techList, setTechList] = useState<string[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Check token status on mount/modal open
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUserEmail(data.user.email);
        } else {
          // Token expired or invalid
          localStorage.removeItem('admin_token');
          setUserEmail(null);
        }
      } catch {
        // Safe backend down fallback
      }
    };
    
    checkAuthStatus();
  }, [isOpen]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error en el proceso de autenticación');
      }

      // Save credentials in client space
      localStorage.setItem('admin_token', data.token);
      setUserEmail(data.user.email);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Error al autenticar o crear cuenta.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setUserEmail(null);
  };

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = techInput.trim().replace(/,$/, '');
      if (tag && !techList.includes(tag)) {
        setTechList([...techList, tag]);
      }
      setTechInput('');
    }
  };

  const removeTech = (index: number) => {
    setTechList(techList.filter((_, i) => i !== index));
  };

  const startEdit = (proj: ApiProject) => {
    setFormMode('edit');
    setEditingId(proj._id);
    setTitleEs(proj.title_es);
    setTitleEn(proj.title_en);
    setDescEs(proj.description_es);
    setDescEn(proj.description_en);
    setLink(proj.link || '');
    setColor(proj.color || GRADIENT_PRESETS[0].value);
    setTechList(proj.tech || []);
    setFormSuccess('');
    setFormError('');
  };

  const resetForm = () => {
    setFormMode('create');
    setEditingId(null);
    setTitleEs('');
    setTitleEn('');
    setDescEs('');
    setDescEn('');
    setLink('');
    setColor(GRADIENT_PRESETS[0].value);
    setTechInput('');
    setTechList([]);
    setFormError('');
    setFormSuccess('');
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!titleEs || !titleEn || !descEs || !descEn) {
      setFormError('Por favor, completa los campos de idioma requeridos.');
      return;
    }

    setFormLoading(true);

    const projectData = {
      title_es: titleEs,
      title_en: titleEn,
      description_es: descEs,
      description_en: descEn,
      tech: techList,
      link: link || '#',
      color
    };

    try {
      if (formMode === 'create') {
        await onAdd(projectData);
        setFormSuccess('¡Proyecto agregado con éxito! 🎉');
        resetForm();
      } else if (formMode === 'edit' && editingId) {
        await onUpdate(editingId, projectData);
        setFormSuccess('¡Proyecto actualizado con éxito! ✨');
        resetForm();
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al persistir cambios.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este proyecto de tu portafolio?')) {
      try {
        await onDelete(id);
        if (editingId === id) {
          resetForm();
        }
      } catch (err: any) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  return (
    <>
      {/* Sleek Floating Admin Access Trigger */}
      {showTrigger && (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-text-dim/40 hover:text-accent-cyan hover:scale-110 active:scale-95 transition-all duration-300 p-2 rounded-full hover:bg-glass flex items-center gap-1.5 text-xs font-mono select-none"
          title="Panel de Administración"
          id="admin-panel-trigger"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="opacity-0 hover:opacity-100 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">Admin</span>
        </button>
      )}

      {/* Admin Panel Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[92vh] md:max-h-[85vh] bg-[#0d0d0d] border border-glass-border rounded-xl shadow-2xl flex flex-col z-10 overflow-hidden"
              id="admin-modal-content"
            >
              {/* Header */}
              <div className="p-4 md:p-5 border-b border-glass-border flex items-center justify-between bg-[#111111]">
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                  <div className="p-1.5 md:p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan shrink-0">
                    <Settings className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm md:text-md font-bold text-white font-sans truncate">JUANCODEV Control Core</h2>
                    <p className="text-[10px] md:text-xs text-text-dim-lighter truncate">Gestión del portafolio (MongoDB + JWT)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-glass-border hover:bg-white/5 text-text-dim hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Db Status banner - Sencillo para trabajar local */}
              {dbStatus && (
                <div className="border-b border-glass-border">
                  <div className={`px-4 md:px-5 py-2.5 text-xs font-mono flex flex-wrap items-center justify-between gap-1.5 ${
                    dbStatus.isFallback ? 'bg-amber-950/20 text-amber-200' : 'bg-emerald-950/20 text-emerald-300'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Database className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold whitespace-nowrap">{dbStatus.isFallback ? 'Modo Local:' : 'Modo Cloud:'}</span>
                      <span className="truncate">{dbStatus.type}</span>
                    </div>
                    {dbStatus.isFallback && (
                      <span className="text-text-dim text-[10px] truncate max-w-full">
                        <span className="hidden md:inline"> (Datos guardados de forma segura en: {dbStatus.location})</span>
                        <span className="inline md:hidden"> (Local JSON)</span>
                      </span>
                    )}
                  </div>
                  {dbStatus.isFallback && (
                    <div className="px-4 md:px-5 py-2.5 text-[11px] bg-amber-500/5 text-amber-300/90 leading-relaxed font-sans border-t border-glass-border">
                      💡 <strong>Guía de Conexión:</strong> Si rellenaste tu <code>MONGODB_URI</code> pero continúas en Modo Local, es debido al control de seguridad de Atlas. Asegúrate de añadir la regla <code>0.0.0.0/0</code> en <strong>Network Access</strong> en tu panel de MongoDB Atlas. ¡Funcionará perfecto de ambas formas!
                    </div>
                  )}
                </div>
              )}

              {/* Scrollable Body Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
                {/* 1. NOT AUTHENTICATED -> SHOW LOGIN SCREEN */}
                {!userEmail ? (
                  <div className="max-w-md mx-auto py-2 md:py-4">
                    <div className="text-center mb-5 md:mb-6">
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-accent-purple/10 flex items-center justify-center mx-auto mb-3 text-accent-purple">
                        <Lock className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1.5 font-sans animate-fade-in">Ingresar credenciales</h3>
                      <p className="text-[11px] md:text-xs text-text-dim leading-relaxed">
                        Inicia sesión con tu cuenta de administrador o crea una inicial desde tu entorno local para poder añadir y editar proyectos.
                      </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-text-dim mb-1">Correo Electrónico</label>
                        <input 
                          type="email" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors"
                          placeholder="tu-correo@ejemplo.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-text-dim mb-1">Contraseña</label>
                        <input 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors"
                          placeholder="••••••••"
                        />
                      </div>

                      {authError && (
                        <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 text-xs rounded-lg space-y-1.5">
                          <p>{authError}</p>
                          {authError.toLowerCase().includes('registrado') && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsRegistering(false);
                                setAuthError('');
                              }}
                              className="text-xs text-accent-cyan font-semibold hover:underline block text-left"
                            >
                              👉 Haz clic aquí para cambiar al formulario de "Iniciar Sesión"
                            </button>
                          )}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={authLoading}
                        className="w-full bg-white text-black font-extrabold uppercase tracking-wider text-xs py-2.5 md:py-3 rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                      >
                        {authLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            {isRegistering ? 'Crear Administrador local' : 'Iniciar Sesión'}
                          </>
                        )}
                      </button>

                      <div className="pt-4 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-center">
                        <span className="text-text-dim">
                          {isRegistering ? '¿Ya tienes cuenta?' : '¿Primer uso o sin cuenta?'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsRegistering(!isRegistering);
                            setAuthError('');
                          }}
                          className="text-accent-cyan hover:underline transition-all font-semibold cursor-pointer py-1 px-2"
                        >
                          {isRegistering ? 'Ir al Login' : 'Crear Admin Inicial'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* 2. AUTHENTICATED -> SHOW CRUD INTERFACE */
                  <div className="space-y-5 md:space-y-6">
                    {/* Logged state widget */}
                    <div className="bg-glass border border-glass-border p-3 md:p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs truncate max-w-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-white/80 font-mono text-xs truncate">{userEmail} (Admin)</span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-mono py-1.5 px-3.5 rounded-lg border border-red-500/20 hover:border-red-500 hover:bg-red-950/30 text-red-400 hover:text-red-200 transition-all duration-300 cursor-pointer touch-manipulation"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
                      {/* Left: Project Form */}
                      <div className="lg:col-span-7 bg-[#111] border border-glass-border rounded-xl p-4 md:p-5 space-y-4 md:space-y-5">
                        <div className="flex items-center justify-between border-b border-glass-border pb-3">
                          <h3 className="font-bold text-white text-xs md:text-sm flex items-center gap-2 font-sans truncate pr-2">
                            <Layout className="w-4 h-4 text-accent-cyan" />
                            {formMode === 'create' ? 'Agregar Nuevo Proyecto' : 'Editar Proyecto'}
                          </h3>
                          {formMode === 'edit' && (
                            <button 
                              onClick={resetForm}
                              className="text-xs text-text-dim hover:text-white underline cursor-pointer shrink-0 py-0.5 px-1"
                            >
                              Cancelar Edición
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleProjectSubmit} className="space-y-4">
                          {/* Multilingual Title row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[10px] font-mono text-text-dim mb-1 uppercase">Título (Español)</label>
                              <input 
                                type="text"
                                required
                                value={titleEs}
                                onChange={(e) => setTitleEs(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
                                placeholder="E-Commerce Plataforma"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-text-dim mb-1 uppercase">Title (Inglés)</label>
                              <input 
                                type="text"
                                required
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
                                placeholder="E-Commerce Platform"
                              />
                            </div>
                          </div>

                          {/* Descriptions row */}
                          <div>
                            <label className="block text-[10px] font-mono text-text-dim mb-1 uppercase">Descripción (Español)</label>
                            <textarea 
                              required
                              rows={3}
                              value={descEs}
                              onChange={(e) => setDescEs(e.target.value)}
                              className="w-full bg-[#151515] border border-glass-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan resize-none"
                              placeholder="Construido con ReactJS y NestJS de forma limpia..."
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-dim mb-1 uppercase">Description (Inglés)</label>
                            <textarea 
                              required
                              rows={3}
                              value={descEn}
                              onChange={(e) => setDescEn(e.target.value)}
                              className="w-full bg-[#151515] border border-glass-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan resize-none"
                              placeholder="Built with ReactJS and NestJS..."
                            />
                          </div>

                          {/* Link & Color Preset row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[10px] font-mono text-text-dim mb-1 uppercase">Enlace del Proyecto (Link)</label>
                              <input 
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
                                placeholder="https://github.com/..."
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-text-dim mb-1 uppercase">Gradiente de Acento</label>
                              <select
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan cursor-pointer"
                              >
                                {GRADIENT_PRESETS.map((p) => (
                                  <option key={p.value} value={p.value}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Tech Skill List */}
                          <div>
                            <label className="block text-[10px] font-mono text-text-dim mb-1 uppercase">
                              Tecnologías (Enter o Coma para agregar)
                            </label>
                            <div className="border border-glass-border bg-[#151515] rounded-lg p-2 flex flex-wrap gap-1.5 focus-within:border-accent-cyan transition-colors">
                              {techList.map((tech, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 pl-2 md:pl-2.5 pr-1 md:pr-1.5 py-0.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-[10px] rounded-full font-medium"
                                >
                                  {tech}
                                  <button 
                                    type="button" 
                                    onClick={() => removeTech(idx)}
                                    className="p-0.5 hover:bg-accent-cyan/20 rounded-full text-accent-cyan transition-colors"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                              <input 
                                type="text"
                                value={techInput}
                                onKeyDown={handleAddTech}
                                onChange={(e) => setTechInput(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-xs text-white px-1 py-0.5 min-w-[80px]"
                                placeholder={techList.length === 0 ? 'Ej: React, NestJS...' : 'Agregar...'}
                              />
                            </div>
                          </div>

                          {formError && (
                            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 text-xs rounded-lg">
                              {formError}
                            </div>
                          )}

                          {formSuccess && (
                            <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 text-xs rounded-lg">
                              {formSuccess}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={formLoading}
                            className="w-full bg-accent-cyan text-[#050505] hover:bg-cyan-300 font-extrabold uppercase tracking-wide text-xs py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
                          >
                            {formLoading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                {formMode === 'create' ? 'Agregar al Portafolio' : 'Guardar Cambios'}
                              </>
                            )}
                          </button>
                        </form>
                      </div>

                      {/* Right: Existing Projects List */}
                      <div className="lg:col-span-5 space-y-3">
                        <h3 className="font-bold text-white text-xs md:text-sm flex items-center gap-2 border-b border-glass-border pb-3 font-sans">
                          <Code className="w-4 h-4 text-accent-purple" />
                          Proyectos Guardados ({projects.length})
                        </h3>

                        {projects.length === 0 ? (
                          <div className="border border-dashed border-glass-border p-6 rounded-xl text-center text-text-dim">
                            <Layout className="w-7 h-7 mx-auto mb-1.5 text-white/20" />
                            <p className="text-xs">Sin proyectos en la DB todavía.</p>
                            <p className="text-[10px] text-text-dim-lighter mt-1">Crea tu primer proyecto usando el formulario.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[300px] lg:max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
                            {projects.map((proj) => (
                              <div 
                                key={proj._id}
                                className="group/item border border-glass-border bg-glass hover:bg-glass/30 rounded-lg p-2.5 md:p-3 flex items-center justify-between gap-3 transition-all"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-bold text-white text-xs truncate max-w-[120px] sm:max-w-none">{proj.title_es}</h4>
                                    <span className="text-[9px] font-mono text-text-dim px-1 bg-black/40 border border-glass-border rounded">
                                      {proj.tech.length} tags
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-text-dim line-clamp-1 mt-0.5">{proj.description_es}</p>
                                </div>

                                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-glass-border shrink-0 opacity-100 lg:opacity-80 lg:group-hover/item:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEdit(proj)}
                                    className="p-1 hover:bg-accent-purple/10 text-text-dim hover:text-accent-purple rounded transition-colors cursor-pointer touch-manipulation"
                                    title="Editar proyecto"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(proj._id)}
                                    className="p-1 hover:bg-red-500/10 text-text-dim hover:text-red-400 rounded transition-colors cursor-pointer touch-manipulation"
                                    title="Eliminar proyecto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
