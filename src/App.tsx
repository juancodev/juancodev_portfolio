import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll } from 'motion/react';
import { Github, Linkedin, Mail, ExternalLink, Terminal, Code2, Briefcase, Zap } from 'lucide-react';
import { IconType } from 'react-icons';
import { SiReact, SiJavascript, SiTypescript, SiVite, SiTailwindcss, SiNestjs, SiPostgresql, SiMongodb, SiDocker, SiGit } from 'react-icons/si';
import StarBackground from './components/StarBackground';
import MouseGlow from './components/MouseGlow';
import ContactForm from './components/ContactForm';

const projects = [
  {
    title: "E-Commerce Plataforma",
    description: "Una solución completa de comercio electrónico con NestJS y React.",
    tech: ["React", "NestJS", "Tailwind", "PostgreSQL"],
    link: "#",
    color: "from-brand-primary to-brand-accent"
  },
  {
    title: "Dashboard Analítico",
    description: "Panel de control en tiempo real para análisis de datos.",
    tech: ["TypeScript", "Next.js", "D3.js", "Framer Motion"],
    link: "#",
    color: "from-brand-secondary to-brand-primary"
  },
];

const skills = [
  "JavaScript / TypeScript", "React.js / Next.js", "NestJS / Express", 
  "Tailwind CSS", "PostgreSQL / MongoDB", "Git / Docker", "Framer Motion", "Arquitectura Web"
];

const testimonials = [
  {
    quote: "La atención al detalle en cada componente y la resiliencia de la arquitectura es nivel Dios. El ecosistema fluye maravillosamente.",
    author: "Carolina Gómez",
    role: "CTO, StartPath"
  },
  {
    quote: "Juan entiende que el código debe solucionar problemas de negocio reales. Nuestra conversión subió un 40% con el nuevo ecosistema web.",
    author: "David Ruiz",
    role: "Product Manager, Elevate"
  }
];

const Navbar = ({ activeSection }: { activeSection: string }) => {
  const links = [
    { id: 'hero', label: 'Inicio' },
    { id: 'tecnologias', label: 'Skills' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'testimonios', label: 'Testimonios' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
      {/* Top Glow Edge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-accent-purple to-transparent shadow-[0_0_30px_10px_rgba(139,92,246,0.2)]" />
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="text-accent-cyan">
          <SiReact size={24} />
        </div>
        <span className="font-sans font-bold text-[16px] text-white tracking-wide">JUANCODEV</span>
      </div>

      {/* Pill Links */}
      <nav className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-2 backdrop-blur-sm">
        {links.map(({ id, label }) => {
          const isActive = activeSection === id;
          return (
            <a 
              key={id} 
              href={`#${id}`} 
              className={`relative px-4 py-1 text-[13px] transition-colors overflow-hidden ${isActive ? 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan' : 'font-medium text-text-dim hover:text-white'}`}
            >
              {label}
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-accent-cyan shadow-[0_0_10px_var(--accent-cyan)] rounded-full"
                />
              )}
            </a>
          );
        })}
      </nav>

      {/* Socials */}
      <div className="flex items-center gap-4 md:gap-5 text-text-dim">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Github className="w-5 h-5"/></a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5"/></a>
        <a href="#contact" className="hover:text-white transition-colors hidden sm:block"><Mail className="w-5 h-5"/></a>
      </div>
    </header>
  );
};

const useProximity = (ref: React.RefObject<any>, maxDistance = 200, scaleTo = 1.15) => {
  const glowOpacity = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    let animationFrame: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (distance < maxDistance) {
          const intensity = 1 - (distance / maxDistance);
          const easeIntensity = Math.pow(intensity, 2); // Efecto orgánico exponencial
          glowOpacity.set(easeIntensity);
          scale.set(1 + (easeIntensity * (scaleTo - 1))); 
        } else {
          glowOpacity.set(0);
          scale.set(1);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [maxDistance, scaleTo]);

  const smoothGlow = useSpring(glowOpacity, { damping: 40, stiffness: 300 });
  const smoothScale = useSpring(scale, { damping: 40, stiffness: 300 });

  return { smoothGlow, smoothScale };
};

const ConstellationIcon = ({ tech, idx, isCore = false }: { key?: React.Key, tech: { Icon: any, color: string, pos?: string }, idx?: number, isCore?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { smoothGlow, smoothScale } = useProximity(ref, isCore ? 250 : 200, isCore ? 1.1 : 1.15);
  const zIndex = useTransform(smoothGlow, v => v > 0.1 ? 20 : 10);
  
  const content = (
      <motion.div 
        ref={ref}
        style={{ scale: smoothScale }}
        className={`${isCore ? 'w-20 h-20' : 'w-14 h-14 md:w-16 md:h-16'} bg-[#111111]/90 backdrop-blur-md border border-glass-border rounded-2xl flex items-center justify-center shadow-xl relative cursor-default`}
      >
        {/* Base Layer */}
        <tech.Icon className={`absolute ${isCore ? 'w-10 h-10' : 'w-7 h-7 md:w-8 md:h-8'} text-white/30`} />
        
        {/* Glow/Active Layer */}
        <motion.div 
          style={{ opacity: smoothGlow }} 
          className="absolute inset-0 flex items-center justify-center"
        >
          <tech.Icon 
            className={`absolute ${isCore ? 'w-10 h-10' : 'w-7 h-7 md:w-8 md:h-8'}`}
            style={{ color: tech.color }}
          />
          <div 
            className="absolute inset-0 rounded-2xl blur-md -z-10"
            style={{ backgroundColor: tech.color, opacity: 0.4 }}
          />
          <div 
            className="absolute inset-0 rounded-2xl border"
            style={{ borderColor: tech.color, opacity: 0.8 }}
          />
        </motion.div>
      </motion.div>
  );

  if (isCore) {
    return <div className="relative z-10 flex items-center justify-center">{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 + ((idx || 0) * 0.1), type: "spring", stiffness: 100, damping: 15 }}
      className={`absolute ${tech.pos} -translate-x-1/2 -translate-y-1/2`}
      style={{ zIndex }}
    >
      {content}
    </motion.div>
  );
}

const TechConstellation = () => {
  const techIcons = [
    { Icon: SiReact, color: '#61DAFB', pos: 'top-[15%] left-[25%]' },
    { Icon: SiJavascript, color: '#F7DF1E', pos: 'top-[5%] left-[65%]' },
    { Icon: SiNestjs, color: '#E0234E', pos: 'top-[35%] left-[85%]' },
    { Icon: SiPostgresql, color: '#4169E1', pos: 'top-[70%] left-[80%]' },
    { Icon: SiMongodb, color: '#47A248', pos: 'bottom-[5%] left-[55%]' },
    { Icon: SiDocker, color: '#2496ED', pos: 'bottom-[10%] left-[20%]' },
    { Icon: SiGit, color: '#F05032', pos: 'top-[65%] left-[5%]' },
    { Icon: SiTailwindcss, color: '#06B6D4', pos: 'top-[30%] left-[5%]' },
  ];
  
  const coreTech = { Icon: SiTypescript, color: '#3178C6' };

  return (
    <div className="relative w-full aspect-square max-w-[450px] flex items-center justify-center mx-auto">
      {/* Target/Radar Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="absolute w-full h-px bg-glass-border"></div>
        <div className="absolute w-px h-full bg-glass-border"></div>
        <div className="absolute w-1/3 h-1/3 rounded-full border border-glass-border"></div>
        <div className="absolute w-2/3 h-2/3 rounded-full border border-glass-border"></div>
        <div className="absolute w-full h-full rounded-full border border-glass-border"></div>
        <div className="absolute w-full h-px bg-glass-border rotate-45"></div>
        <div className="absolute w-full h-px bg-glass-border -rotate-45"></div>
      </div>

      {/* Center Core */}
      <ConstellationIcon tech={coreTech} isCore={true} />

      {/* Orbiting Icons */}
      <div className="absolute w-full h-full">
        {techIcons.map((tech, idx) => (
          <ConstellationIcon key={idx} tech={tech} idx={idx} />
        ))}
      </div>
    </div>
  );
};

const ParallaxSection = ({ children, id, className, containerRef, offset = 100 }: any) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollXProgress } = useScroll({
    target: ref,
    container: containerRef,
    axis: "x",
    offset: ["start end", "end start"]
  });
  const x = useTransform(scrollXProgress, [0, 1], [-offset, offset]);

  return (
    <section id={id} ref={ref} className={`snap-start min-w-[100vw] w-screen h-screen flex-shrink-0 flex items-center justify-center relative overflow-hidden ${className || ''}`}>
      <motion.div style={{ x }} className="w-full h-full flex flex-col justify-center items-center">
        {children}
      </motion.div>
    </section>
  );
};

export default function App() {
  const [hoverTitle, setHoverTitle] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScrollTracking = () => {
      const sectionWidth = container.clientWidth;
      if (sectionWidth === 0) return;
      const index = Math.round(container.scrollLeft / sectionWidth);
      const sections = ['hero', 'tecnologias', 'proyectos', 'testimonios'];
      if (sections[index]) {
        setActiveSection(sections[index]);
      }
    };

    container.addEventListener('scroll', handleScrollTracking, { passive: true });
    handleScrollTracking(); // Init
    
    return () => container.removeEventListener('scroll', handleScrollTracking);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleWheel = (e: WheelEvent) => {
      // Tomamos el movimiento dominante, sea rueda del ratón (Y) o trackpad horizontal (X)
      const primaryDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      
      // Ignoramos micro-movimientos para evitar falsos positivos
      if (Math.abs(primaryDelta) < 5) return;

      // Prevenir comportamiento por defecto sin importar sobre qué elemento estemos
      e.preventDefault();

      if (isScrolling) {
        // Renovar el bloqueo de inercia si el usuario sigue haciendo gestos en el trackpad
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          container.style.scrollSnapType = 'x mandatory';
          isScrolling = false;
        }, 400);
        return;
      }

      const direction = primaryDelta > 0 ? 1 : -1;
      const sectionWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;
      
      const currentIndex = Math.round(currentScroll / sectionWidth);
      const targetIndex = currentIndex + direction;

      const sectionsCount = container.querySelectorAll('section').length;

      if (targetIndex >= 0 && targetIndex < sectionsCount) {
        isScrolling = true;
        
        container.style.scrollSnapType = 'none';

        container.scrollTo({
          left: targetIndex * sectionWidth,
          behavior: 'smooth'
        });

        scrollTimeout = setTimeout(() => {
          container.style.scrollSnapType = 'x mandatory';
          isScrolling = false;
        }, 900);
      }
    };

    // VINCULAMOS AL WINDOW. Esto es mandatorio. Si vinculamos al container, ciertos elementos
    // superpuestos como tarjetas, capas SVG, o fixed layers pueden robarse el evento de hover.
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50, filter: 'blur(8px)' },
    visible: {
      opacity: 1, 
      x: 0, 
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 80, damping: 20 }
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050505] selection:bg-accent-purple/30">
      <Navbar activeSection={activeSection} />
      <StarBackground />
      <MouseGlow />

      {/* Main Snap Scroll Container (Horizontal with Parallax) */}
      <main ref={scrollContainerRef} className="relative z-10 flex h-full w-full overflow-x-scroll overflow-y-hidden snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* 1. HERO SECTION */}
        <ParallaxSection id="hero" containerRef={scrollContainerRef} offset={80}>
          <div className="max-w-[1200px] w-full mx-auto px-6 md:px-[60px]">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              className="md:col-span-12 flex flex-col lg:flex-row justify-between items-center relative group gap-10 lg:gap-5"
            >
              {/* Background Atmospheric Elements */}
              <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] bg-accent-purple opacity-20 pointer-events-none z-[-1]" />
              <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] bg-accent-cyan opacity-20 pointer-events-none z-[-1]" />

              {/* Typography Content */}
              <div className="flex-1 flex flex-col justify-start max-w-2xl w-full relative z-20 pt-20 md:pt-0">
                <motion.h1 variants={itemVariants} className="text-[clamp(45px,7vw,110px)] font-sans font-black tracking-[-2px] md:tracking-[-4px] leading-[0.9] text-white mb-5 break-words">
                  <div 
                    className="relative cursor-default w-fit group/name"
                    onMouseEnter={() => setHoverTitle(true)}
                    onMouseLeave={() => setHoverTitle(false)}
                  >
                    <span className={`block transition-all duration-500 ease-out whitespace-nowrap ${hoverTitle ? 'opacity-0 blur-xl -translate-y-6 scale-95' : 'opacity-100 blur-0 translate-y-0 scale-100'}`}>
                      JUANCODEV
                    </span>
                    <span className={`absolute top-0 left-0 block transition-all duration-500 ease-out whitespace-nowrap ${hoverTitle ? 'opacity-100 blur-0 translate-y-0 scale-100' : 'opacity-0 blur-xl translate-y-6 scale-95'}`}>
                      JUAN MONTILLA
                    </span>
                  </div>
                  <span className="block outline-text text-[clamp(40px,6vw,90px)] mt-1">DEVELOPER</span>
                  <span className="block text-[clamp(35px,5vw,70px)] tracking-[-1px] md:tracking-[-2px] text-accent-cyan lg:whitespace-nowrap">FULLSTACK</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-[16px] md:text-[18px] leading-[1.6] text-text-dim mt-2 border-l-2 border-accent-cyan pl-5 mb-8 max-w-[450px]">
                  Me especializo en crear ecosistemas web excepcionales. Construyo soluciones front-end destacadas y arquitecturas back-end robustas para marcas que quieren liderar el mercado digital.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mt-2">
                  <a href="#testimonios" className="bg-white text-black px-[32px] py-[16px] rounded-[100px] font-bold text-[14px] uppercase tracking-[1px] border-none flex items-center gap-[10px] w-fit hover:bg-gray-200 transition-colors cursor-pointer">
                    Conoce más <Zap className="ml-2 w-4 h-4" />
                  </a>
                </motion.div>
              </div>

              {/* Radar / Tech Constellation */}
              <motion.div variants={itemVariants} className="flex-1 w-full max-w-[500px] hidden md:block">
                <TechConstellation />
              </motion.div>
            </motion.div>
          </div>

          {/* Minimalist Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 md:bottom-12 flex items-center gap-4 z-30 pointer-events-none"
          >
            <span className="text-white/30 text-[9px] md:text-[10px] font-sans font-medium uppercase tracking-[0.4em] ml-2">
              Scroll
            </span>
            <div className="relative w-[40px] md:w-[60px] h-[1px] bg-white/10">
              <motion.div 
                className="absolute top-0 h-full bg-white/60"
                animate={{ 
                  left: ["0%", "0%", "100%"],
                  width: ["0%", "100%", "0%"]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                }}
              />
            </div>
          </motion.div>
        </ParallaxSection>

        {/* 2. SKILLS & EXPERIENCE SECTION */}
        <ParallaxSection id="tecnologias" containerRef={scrollContainerRef} offset={100}>
          <div className="max-w-[1200px] w-full mx-auto px-6 md:px-[60px] flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="mb-10 text-center md:text-left"
            >
              <h2 className="text-[30px] md:text-[50px] font-sans font-black tracking-tight text-white mb-2">Skills & <span className="text-accent-purple">Experience.</span></h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-10 gap-[20px]">
              {/* Quick Stats */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                className="md:col-span-4 flex flex-col gap-[20px]"
              >
                <div className="bento-card flex flex-row md:flex-col justify-center items-center text-center gap-6 md:gap-0 h-full">
                  <div className="w-16 h-16 rounded-full bg-accent-cyan/20 flex items-center justify-center md:mb-4 text-accent-cyan">
                    <Code2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-sans text-[40px] font-bold text-text-main">5+</h3>
                    <p className="text-text-dim font-mono text-[10px] tracking-[2px] uppercase mt-1">Años de código continuo</p>
                  </div>
                </div>
                
                <div className="bento-card bg-gradient-to-br from-glass to-bg-dark border-glass-border relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/setup/800/600')] opacity-5 group-hover:opacity-10 transition-opacity mix-blend-overlay object-cover" />
                  <Terminal className="w-6 h-6 text-accent-purple mb-4" />
                  <h3 className="font-sans text-[18px] font-semibold text-text-main mb-2">Stack Principal</h3>
                  <p className="text-text-dim text-[13px]">ReactJS, NestJS, TailwindCSS. Arquitecturas escalables centradas en el usuario y rendimiento.</p>
                </div>
              </motion.div>

              {/* Skills Array */}
              <motion.div
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: false, margin: "-50px" }}
                 variants={{
                   hidden: { opacity: 0, x: 50 },
                   visible: { 
                     opacity: 1, 
                     x: 0, 
                     transition: { type: 'spring', stiffness: 80, damping: 20, staggerChildren: 0.08, delayChildren: 0.1 }
                   }
                 }}
                 className="md:col-span-6 bento-card flex flex-col justify-center py-10"
              >
                <span className="text-[10px] uppercase tracking-[2px] text-accent-cyan mb-[12px] block">Especialidad Técnica</span>
                <h3 className="text-[22px] font-sans font-semibold text-white mb-6">El arsenal con el que construyo</h3>
                 <div className="flex flex-wrap gap-[8px]">
                  {skills.map((skill, idx) => (
                    <motion.div 
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 12 } }
                      }}
                      whileHover={{ scale: 1.1, y: -2, backgroundColor: "rgba(139, 92, 246, 0.1)", borderColor: "rgba(139, 92, 246, 0.5)" }}
                      className="px-[14px] py-[8px] border border-glass-border bg-glass rounded-[8px] text-[13px] font-medium text-text-main inline-block transition-colors"
                    >
                      {skill}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </ParallaxSection>

        {/* 3. PROJECTS SECTION */}
        <ParallaxSection id="proyectos" containerRef={scrollContainerRef} offset={90}>
          <div className="max-w-[1200px] w-full mx-auto px-6 md:px-[60px] flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="text-center md:text-left mb-10"
            >
              <h2 className="text-[30px] md:text-[50px] font-sans font-black tracking-tight text-white"><Zap className="inline-block w-8 h-8 md:w-12 md:h-12 mr-3 text-accent-cyan pb-2" />Proyectos <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">Destacados</span>.</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              {projects.map((project, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 50, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: false }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ 
                    type: 'spring', stiffness: 300, damping: 25, 
                    delay: idx * 0.1
                  }}
                  className="bento-card flex flex-col justify-between group overflow-hidden relative min-h-[250px]"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${project.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div>
                    <span className="text-[10px] uppercase tracking-[2px] text-accent-cyan mb-[12px] block">
                      Caso de Éxito
                    </span>
                    <h3 className="text-[22px] font-sans font-semibold text-text-main mb-[12px] group-hover:text-accent-cyan transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-[14px] text-text-dim mb-[20px] line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((t) => (
                        <span key={t} className="px-[10px] py-[4px] border border-glass-border rounded-[4px] text-[11px] text-text-main bg-black/20">
                          {t}
                        </span>
                      ))}
                    </div>
                    <a href={project.link} className="inline-flex items-center text-[12px] uppercase tracking-[1px] font-bold text-white group-hover:text-accent-purple transition-colors">
                      Explorar Sistema <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ParallaxSection>

        {/* 4. CLINENT TESTIMONIALS SECTION */}
        <ParallaxSection id="testimonios" containerRef={scrollContainerRef} offset={110} className="pb-20">
          <div className="max-w-[1000px] w-full mx-auto px-6 md:px-[60px]">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="text-center mb-16"
            >
              <h2 className="text-[30px] md:text-[50px] font-sans font-black tracking-tight text-white mb-4">Lo que opinan mis <span className="text-accent-cyan">clientes.</span></h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testi, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
                  className="bento-card bg-gradient-to-br from-glass to-bg-dark border-glass-border flex flex-col justify-between hover:border-accent-purple/30 transition-colors min-h-[220px]"
                >
                  <p className="text-[16px] md:text-[18px] leading-relaxed text-text-main italic mb-8">"{testi.quote}"</p>
                  <div className="flex flex-col mt-auto border-t border-glass-border pt-4">
                    <span className="font-bold text-white text-[14px] uppercase tracking-wide">{testi.author}</span>
                    <span className="text-accent-cyan text-[12px]">{testi.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-text-dim text-[12px] uppercase tracking-[1px]">
             <p>Diseñado en AI Studio • {new Date().getFullYear()} JUANCODEV</p>
          </div>
        </ParallaxSection>

      </main>
    </div>
  );
}
