export type Language = 'es' | 'en';

export const translations = {
  es: {
    nav: { home: 'Inicio', skills: 'Skills', projects: 'Proyectos', testimonials: 'Testimonios' },
    hero: {
      desc: 'Me especializo en crear ecosistemas web excepcionales. Construyo soluciones front-end destacadas y arquitecturas back-end robustas para marcas que quieren liderar el mercado digital.',
      btn: 'Conoce más',
    },
    skills: {
      title1: 'Skills & ',
      title2: 'Experience.',
      years: 'Años de código continuo',
      stackTitle: 'Stack Principal',
      stackDesc: 'ReactJS, NestJS, TailwindCSS. Arquitecturas escalables centradas en el usuario y rendimiento.',
      specialtySubtitle: 'Especialidad Técnica',
      specialtyTitle: 'El arsenal con el que construyo'
    },
    projects: {
      title: 'Proyectos ',
      highlight: 'Destacados',
      tag: 'Caso de Éxito',
      btn: 'Explorar Sistema',
      items: [
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
        }
      ]
    },
    testimonials: {
      title1: 'Lo que opinan mis ',
      title2: 'clientes.',
      footer: 'Diseñado en AI Studio',
      items: [
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
      ]
    }
  },
  en: {
    nav: { home: 'Home', skills: 'Skills', projects: 'Projects', testimonials: 'Testimonials' },
    hero: {
      desc: 'I specialize in creating exceptional web ecosystems. I build outstanding front-end solutions and robust back-end architectures for brands aiming to lead the digital market.',
      btn: 'Learn more',
    },
    skills: {
      title1: 'Skills & ',
      title2: 'Experience.',
      years: 'Years of continuous coding',
      stackTitle: 'Core Stack',
      stackDesc: 'ReactJS, NestJS, TailwindCSS. Scalable architectures focused on user experience and performance.',
      specialtySubtitle: 'Technical Specialty',
      specialtyTitle: 'The arsenal I build with'
    },
    projects: {
      title: 'Featured ',
      highlight: 'Projects',
      tag: 'Success Story',
      btn: 'Explore System',
      items: [
        {
          title: "E-Commerce Platform",
          description: "A complete e-commerce solution using NestJS and React.",
          tech: ["React", "NestJS", "Tailwind", "PostgreSQL"],
          link: "#",
          color: "from-brand-primary to-brand-accent"
        },
        {
          title: "Analytics Dashboard",
          description: "Real-time dashboard for data analysis and visualization.",
          tech: ["TypeScript", "Next.js", "D3.js", "Framer Motion"],
          link: "#",
          color: "from-brand-secondary to-brand-primary"
        }
      ]
    },
    testimonials: {
      title1: 'What my clients ',
      title2: 'say.',
      footer: 'Designed in AI Studio',
      items: [
        {
          quote: "The attention to detail in every component and the resilience of the architecture is god-tier. The ecosystem flows beautifully.",
          author: "Carolina Gómez",
          role: "CTO, StartPath"
        },
        {
          quote: "Juan understands that code must solve real business problems. Our conversion rate increased by 40% with the new web ecosystem.",
          author: "David Ruiz",
          role: "Product Manager, Elevate"
        }
      ]
    }
  }
};
