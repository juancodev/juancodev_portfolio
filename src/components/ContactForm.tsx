import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="bento-card">
      <span className="text-[10px] uppercase tracking-[2px] text-accent-cyan mb-[12px] block">Contacto</span>
      <h3 className="font-sans text-[18px] font-semibold mb-6 text-text-main">Hablemos</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-[11px] font-medium text-text-dim mb-1 uppercase tracking-[1px]">Nombre</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required
            className="w-full bg-glass border border-glass-border rounded-[8px] px-4 py-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all font-sans text-[13px]"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-[11px] font-medium text-text-dim mb-1 uppercase tracking-[1px]">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required
            className="w-full bg-glass border border-glass-border rounded-[8px] px-4 py-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all font-sans text-[13px]"
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-[11px] font-medium text-text-dim mb-1 uppercase tracking-[1px]">Mensaje</label>
          <textarea 
            id="message" 
            name="message" 
            rows={4}
            required
            className="w-full bg-glass border border-glass-border rounded-[8px] px-4 py-2.5 text-text-main focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-all font-sans resize-none text-[13px]"
            placeholder="¿En qué puedo ayudarte?"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-white text-black font-bold text-[14px] uppercase tracking-[1px] py-[16px] px-[32px] rounded-[100px] shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-70 transition-all hover:bg-gray-200 border-none mt-2 flex justify-center"
        >
          {status === 'idle' && 'Enviar Mensaje'}
          {status === 'submitting' && 'Enviando...'}
          {status === 'success' && '¡Enviado con éxito!'}
          {status === 'error' && 'Error al enviar'}
        </motion.button>
      </form>
    </div>
  );
}
