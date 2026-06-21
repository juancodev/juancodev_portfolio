import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FirebaseProject {
  id: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  tech: string[];
  link: string;
  color: string;
  createdAt: number;
}

export const useFirebaseProjects = (staticFallback: Array<{ title: string; description: string; tech: string[]; link: string; color: string }>) => {
  const [projects, setProjects] = useState<FirebaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedProjects: FirebaseProject[] = [];
        snapshot.forEach((doc) => {
          loadedProjects.push({ id: doc.id, ...doc.data() } as FirebaseProject);
        });
        setProjects(loadedProjects);
        setLoading(false);
      }, (err) => {
        console.warn("Firestore access error, falling back to static projects list:", err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Failed to initialize Firestore listener:", err);
      setError(err);
      setLoading(false);
    }
  }, []);

  const addProject = async (proj: Omit<FirebaseProject, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'projects'), {
        ...proj,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Error adding project:", err);
      throw err;
    }
  };

  const updateProject = async (id: string, proj: Partial<Omit<FirebaseProject, 'id' | 'createdAt'>>) => {
    try {
      await updateDoc(doc(db, 'projects', id), proj);
    } catch (err) {
      console.error("Error updating project:", err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.error("Error deleting project:", err);
      throw err;
    }
  };

  // Convert Firebase projects array to active language format, or fallback to static list
  const getMappedProjects = (lang: 'es' | 'en') => {
    if (loading || projects.length === 0) {
      return staticFallback.map((item, idx) => ({
        id: `static-${idx}`,
        title: item.title,
        description: item.description,
        tech: item.tech,
        link: item.link,
        color: item.color || "from-accent-cyan to-accent-purple"
      }));
    }

    return projects.map((item) => ({
      id: item.id,
      title: lang === 'es' ? item.title_es : item.title_en,
      description: lang === 'es' ? item.description_es : item.description_en,
      tech: item.tech,
      link: item.link,
      color: item.color
    }));
  };

  return {
    rawProjects: projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getMappedProjects
  };
};
