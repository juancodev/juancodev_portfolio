import { useEffect, useState } from 'react';

export interface ApiProject {
  _id: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  tech: string[];
  link: string;
  color: string;
  createdAt: number;
}

export interface DbStatus {
  isFallback: boolean;
  type: string;
  location: string;
}

export const useApiProjects = (staticFallback: Array<{ title: string; description: string; tech: string[]; link: string; color: string }>) => {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        throw new Error(data.message || 'Failed to fetch projects');
      }
    } catch (err: any) {
      console.warn('REST API project retrieval failed, using fallback static projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/projects/db-info');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data.status);
      }
    } catch {
      // Squelch background errors
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDbStatus();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const addProject = async (proj: Omit<ApiProject, '_id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(proj)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al agregar proyecto a la base de datos');
      }
      await fetchProjects();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const updateProject = async (id: string, proj: Partial<Omit<ApiProject, '_id' | 'createdAt'>>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(proj)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al actualizar proyecto');
      }
      await fetchProjects();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al eliminar proyecto');
      }
      await fetchProjects();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Maps projects to active language format
  const getMappedProjects = (lang: 'es' | 'en') => {
    if (projects.length === 0) {
      // Return static list from translated resources
      return staticFallback.map((item, idx) => ({
        id: `static-${idx}`,
        title: item.title,
        description: item.description,
        tech: item.tech,
        link: item.link,
        color: item.color || 'from-accent-cyan to-accent-purple'
      }));
    }

    return projects.map((item) => ({
      id: item._id,
      title: lang === 'es' ? item.title_es : item.title_en,
      description: lang === 'es' ? item.description_es : item.description_en,
      tech: item.tech,
      link: item.link,
      color: item.color
    }));
  };

  return {
    rawProjects: projects,
    dbStatus,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getMappedProjects,
    reloadProjects: fetchProjects
  };
};
