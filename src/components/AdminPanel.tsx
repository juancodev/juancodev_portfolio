import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Lock, X, LogOut, Plus, Trash2, Edit2, 
  Save, Globe, Key, Layout, Code, ExternalLink, RefreshCw 
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FirebaseProject } from '../hooks/useFirebaseProjects';

interface AdminPanelProps {
  projects: FirebaseProject[];
  onAdd: (proj: Omit<FirebaseProject, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, proj: Partial<Omit<FirebaseProject, 'id' | 'createdAt'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const GRADIENT_PRESETS = [
  { name: 'Cyan → Purple', value: 'from-accent-cyan to-accent-purple' },
  { name: 'Purple → Pink', value: 'from-purple-500 to-pink-500' },
  { name: 'Green → Blue', value: 'from-emerald-400 to-blue-500' },
  { name: 'Orange → Red', value: 'from-orange-500 to-red-600' },
  { name: 'White → Slate', value: 'from-white to-slate-500' },
];

export default function AdminPanel({ projects, onAdd, onUpdate, onDelete }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
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

  // Track authenticated user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setAuthError('Usuario no encontrado. ¿Quieres registrarte? Activá el switch de abajo.');
      } else if (err.code === 'auth/wrong-password') {
        setAuthError('Contraseña incorrecta. Por favor vuelve a intentarlo.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('El correo electrónico ya está registrado.');
      } else {
        setAuthError(err.message || 'Error al autenticar.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
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

  const startEdit = (proj: FirebaseProject) => {
    setFormMode('edit');
    setEditingId(proj.id);
    setTitleEs(proj.title_es);
    setTitleEn(proj.title_en);
    setDescEs(proj.description_es);
    setDescEn(proj.description_en);
    setLink(proj.link);
    setColor(proj.color);
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
      <button 
        onClick={() => setIsOpen(true)}
        className="text-text-dim/40 hover:text-accent-cyan hover:scale-110 active:scale-95 transition-all duration-300 p-2 rounded-full hover:bg-glass flex items-center gap-1.5 text-xs font-mono select-none"
        title="Panel de Administración"
        id="admin-panel-trigger"
      >
        <Lock className="w-3.5 h-3.5" />
        <span className="opacity-0 hover:opacity-100 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">Admin</span>
      </button>

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
              className="relative w-full max-w-4xl max-h-[85vh] bg-[#0d0d0d] border border-glass-border rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10"
              id="admin-modal-content"
            >
              {/* Header */}
              <div className="p-6 border-b border-glass-border flex items-center justify-between bg-[#111111]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-sans">JUANCODEV Control Core</h2>
                    <p className="text-xs text-text-dim">Gestión del portafolio en tiempo real (Firebase)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-glass-border hover:bg-white/5 text-text-dim hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {/* 1. NOT AUTHENTICATED -> SHOW LOGIN SCREEN */}
                {!user ? (
                  <div className="max-w-md mx-auto py-8">
                    <div className="text-center mb-8">
                      <div className="w-12 h-12 rounded-full bg-accent-purple/10 flex items-center justify-center mx-auto mb-4 text-accent-purple">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Ingresar credenciales</h3>
                      <p className="text-sm text-text-dim">Identifícate para agregar, actualizar o eliminar proyectos del portafolio.</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">Correo Electrónico</label>
                        <input 
                          type="email" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#151515] border border-glass-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors"
                          placeholder="tu-correo@ejemplo.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">Contraseña</label>
                        <input 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#151515] border border-glass-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan transition-colors"
                          placeholder="••••••••"
                        />
                      </div>

                      {authError && (
                        <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-200 text-xs rounded-lg">
                          {authError}
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={authLoading}
                        className="w-full bg-white text-black font-bold uppercase tracking-wider text-xs py-3 rounded-lg hover:bg-gray-200 active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            {isRegistering ? 'Crear Administrador' : 'Iniciar Sesión'}
                          </>
                        )}
                      </button>

                      <div className="pt-4 border-t border-glass-border flex items-center justify-between text-xs">
                        <span className="text-text-dim">
                          {isRegistering ? '¿Ya tienes cuenta?' : '¿Primer uso local?'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => setIsRegistering(!isRegistering)}
                          className="text-accent-cyan hover:underline hover:text-accent-purple transition-all font-semibold"
                        >
                          {isRegistering ? 'Volver al Login' : 'Crear Admin Inicial'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* 2. AUTHENTICATED -> SHOW CRUD INTERFACE */
                  <div className="space-y-8">
                    {/* Logged state widget */}
                    <div className="bg-glass border border-glass-border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-white/80 font-mono text-xs">{user.email} (Administrador)</span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-xs font-mono py-1.5 px-3 rounded-lg border border-red-500/20 hover:border-red-500 hover:bg-red-950/30 text-red-400 hover:text-red-200 transition-all duration-300"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Project Form */}
                      <div className="lg:col-span-7 bg-[#111] border border-glass-border rounded-xl p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-glass-border pb-3">
                          <h3 className="font-bold text-white text-base flex items-center gap-2">
                            <Layout className="w-4 h-4 text-accent-cyan" />
                            {formMode === 'create' ? 'Agregar Nuevo Proyecto' : 'Editar Proyecto'}
                          </h3>
                          {formMode === 'edit' && (
                            <button 
                              onClick={resetForm}
                              className="text-xs text-text-dim hover:text-white underline"
                            >
                              Cancelar Edición
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleProjectSubmit} className="space-y-4">
                          {/* Multilingual Title row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono text-text-dim mb-1 uppercase">Título (Español)</label>
                              <input 
                                type="text"
                                required
                                value={titleEs}
                                onChange={(e) => setTitleEs(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan"
                                placeholder="E-Commerce Plataforma"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-mono text-text-dim mb-1 uppercase">Title (Inglés)</label>
                              <input 
                                type="text"
                                required
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan"
                                placeholder="E-Commerce Platform"
                              />
                            </div>
                          </div>

                          {/* Descriptions row */}
                          <div>
                            <label className="block text-[11px] font-mono text-text-dim mb-1 uppercase">Descripción (Español)</label>
                            <textarea 
                              required
                              rows={3}
                              value={descEs}
                              onChange={(e) => setDescEs(e.target.value)}
                              className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan resize-none"
                              placeholder="Construido con ReactJS y NestJS..."
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-text-dim mb-1 uppercase">Description (Inglés)</label>
                            <textarea 
                              required
                              rows={3}
                              value={descEn}
                              onChange={(e) => setDescEn(e.target.value)}
                              className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan resize-none"
                              placeholder="Built using ReactJS and NestJS..."
                            />
                          </div>

                          {/* Link & Color Preset row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono text-text-dim mb-1 uppercase">Enlace del Proyecto (Link)</label>
                              <input 
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan"
                                placeholder="https://github.com/..."
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-mono text-text-dim mb-1 uppercase">Gradiente de Acento</label>
                              <select
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full bg-[#151515] border border-glass-border rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan cursor-pointer"
                              >
                                {GRADIENT_PRESETS.map((p) => (
                                  <option key={p.value} value={p.value}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Tech Skill List */}
                          <div>
                            <label className="block text-[11px] font-mono text-text-dim mb-1 uppercase">
                              Tecnologías (Pulsa Enter o una Coma para agregar)
                            </label>
                            <div className="border border-glass-border bg-[#151515] rounded-lg p-2 flex flex-wrap gap-1.5 focus-within:border-accent-cyan transition-colors">
                              {techList.map((tech, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs rounded-full font-medium"
                                >
                                  {tech}
                                  <button 
                                    type="button" 
                                    onClick={() => removeTech(idx)}
                                    className="p-0.5 hover:bg-accent-cyan/20 rounded-full text-accent-cyan transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                              <input 
                                type="text"
                                value={techInput}
                                onKeyDown={handleAddTech}
                                onChange={(e) => setTechInput(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-white px-1 py-0.5 min-w-[100px]"
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
                            className="w-full bg-accent-cyan text-[#050505] hover:bg-cyan-300 font-extrabold uppercase tracking-wide text-xs py-3 rounded-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
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
                      <div className="lg:col-span-5 space-y-4">
                        <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-glass-border pb-3">
                          <Code className="w-4 h-4 text-accent-purple" />
                          Proyectos Actuales ({projects.length})
                        </h3>

                        {projects.length === 0 ? (
                          <div className="border border-dashed border-glass-border p-8 rounded-xl text-center text-text-dim">
                            <Layout className="w-8 h-8 mx-auto mb-2 text-white/20" />
                            <p className="text-sm">Sin proyectos en base de datos.</p>
                            <p className="text-xs text-text-dim mt-1">Crea tu primer caso de éxito usando el formulario de la izquierda.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                            {projects.map((proj) => (
                              <div 
                                key={proj.id}
                                className="group/item border border-glass-border bg-glass hover:bg-glass/30 rounded-lg p-4 flex items-center justify-between gap-4 transition-all"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-bold text-white text-sm truncate">{proj.title_es}</h4>
                                    <span className="text-[10px] font-mono text-text-dim px-1.5 py-0.5 bg-black/40 border border-glass-border rounded">
                                      {proj.tech.length} tags
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-dim line-clamp-1 mt-0.5">{proj.description_es}</p>
                                </div>

                                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-glass-border shrink-0 opacity-80 group-hover/item:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEdit(proj)}
                                    className="p-1.5 hover:bg-accent-purple/10 text-text-dim hover:text-accent-purple rounded transition-colors"
                                    title="Editar proyecto"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(proj.id)}
                                    className="p-1.5 hover:bg-red-500/10 text-text-dim hover:text-red-400 rounded transition-colors"
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
