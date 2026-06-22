import { MongoClient, Db, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export interface DBUser {
  _id: string; // Castable to string
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface DBProject {
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

export class DBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isLocalFallback = false;
  private localDbPath = path.join(process.cwd(), 'src', 'db', 'local_db.json');

  constructor() {
    this.init();
  }

  private async init() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('⚠️ No MONGODB_URI found in env variables! Using local JSON file-based database fallback.');
      this.useLocalFallback();
      return;
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      // Extract db name from URI or use default 'juancodev_portfolio'
      const dbName = uri.split('/').pop()?.split('?')[0] || 'juancodev_portfolio';
      this.db = this.client.db(dbName);
      this.isLocalFallback = false;
      console.log(`✅ Fully connected to MongoDB database: "${dbName}"`);
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB, falling back to local JSON database: ', err);
      this.useLocalFallback();
    }
  }

  private useLocalFallback() {
    this.isLocalFallback = true;
    // Ensure parent directory exists
    const dir = path.dirname(this.localDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Seed initial structure if file doesn't exist
    if (!fs.existsSync(this.localDbPath)) {
      const initialSeed = {
        users: [] as DBUser[],
        projects: [
          {
            _id: 'proj-static-1',
            title_es: 'E-Commerce Premium con NestJS',
            title_en: 'Premium E-Commerce with NestJS',
            description_es: 'Una API REST robusta integrada con pasarela de pagos, roles y MongoDB.',
            description_en: 'A robust REST API integrated with a payment gateway, roles, and MongoDB.',
            tech: ['React', 'NestJS', 'MongoDB', 'Tailwindcss'],
            link: 'https://github.com/montillasanchezjuancarlos',
            color: 'from-accent-cyan to-accent-purple',
            createdAt: Date.now() - 10000
          },
          {
            _id: 'proj-static-2',
            title_es: 'Panel de Control Administrativo',
            title_en: 'Administrative Control Dashboard',
            description_es: 'Front-end interactivo con gráficos en tiempo real y autenticación JWT.',
            description_en: 'Interactive frontend with real-time charts and JWT authentication.',
            tech: ['React', 'Tailwindcss', 'Framer Motion'],
            link: 'https://github.com/montillasanchezjuancarlos',
            color: 'from-emerald-400 to-blue-500',
            createdAt: Date.now()
          }
        ] as DBProject[]
      };
      fs.writeFileSync(this.localDbPath, JSON.stringify(initialSeed, null, 2), 'utf-8');
    }
  }

  // Helper to read local JSON data
  private readLocal(): { users: DBUser[]; projects: DBProject[] } {
    try {
      const data = fs.readFileSync(this.localDbPath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading local db file:', err);
      return { users: [], projects: [] };
    }
  }

  // Helper to write local JSON data
  private writeLocal(data: { users: DBUser[]; projects: DBProject[] }) {
    try {
      fs.writeFileSync(this.localDbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing local db file:', err);
    }
  }

  // --- PUBLIC API: PROJECTS ---

  async getProjects(): Promise<DBProject[]> {
    if (this.isLocalFallback || !this.db) {
      const local = this.readLocal();
      return local.projects.sort((a, b) => b.createdAt - a.createdAt);
    }

    try {
      const items = await this.db.collection('projects').find().sort({ createdAt: -1 }).toArray();
      return items.map(item => ({
        ...item,
        _id: item._id.toString()
      })) as unknown as DBProject[];
    } catch (err) {
      console.error('MongoDB find error, using local fallback:', err);
      const local = this.readLocal();
      return local.projects.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  async addProject(proj: Omit<DBProject, '_id' | 'createdAt'>): Promise<DBProject> {
    const newProject: DBProject = {
      _id: this.isLocalFallback ? `proj-${Date.now()}` : new ObjectId().toString(),
      ...proj,
      createdAt: Date.now()
    };

    if (this.isLocalFallback || !this.db) {
      const data = this.readLocal();
      data.projects.push(newProject);
      this.writeLocal(data);
      return newProject;
    }

    try {
      const doc = {
        _id: new ObjectId(newProject._id),
        title_es: newProject.title_es,
        title_en: newProject.title_en,
        description_es: newProject.description_es,
        description_en: newProject.description_en,
        tech: newProject.tech,
        link: newProject.link,
        color: newProject.color,
        createdAt: newProject.createdAt
      };
      await this.db.collection('projects').insertOne(doc);
      return newProject;
    } catch (err) {
      console.error('Error inserting in MongoDB, writing locally:', err);
      const data = this.readLocal();
      data.projects.push(newProject);
      this.writeLocal(data);
      return newProject;
    }
  }

  async updateProject(id: string, updateData: Partial<Omit<DBProject, '_id' | 'createdAt'>>): Promise<boolean> {
    if (this.isLocalFallback || !this.db) {
      const data = this.readLocal();
      const index = data.projects.findIndex(p => p._id === id);
      if (index === -1) return false;
      data.projects[index] = { ...data.projects[index], ...updateData };
      this.writeLocal(data);
      return true;
    }

    try {
      let filter;
      try {
        filter = { _id: new ObjectId(id) };
      } catch {
        filter = { _id: id as any }; // Handle static custom strings
      }
      const result = await this.db.collection('projects').updateOne(filter, { $set: updateData });
      return result.modifiedCount > 0 || result.matchedCount > 0;
    } catch (err) {
      console.error('Error updating in MongoDB:', err);
      return false;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    if (this.isLocalFallback || !this.db) {
      const data = this.readLocal();
      const filtered = data.projects.filter(p => p._id !== id);
      if (filtered.length === data.projects.length) return false;
      data.projects = filtered;
      this.writeLocal(data);
      return true;
    }

    try {
      let filter;
      try {
        filter = { _id: new ObjectId(id) };
      } catch {
        filter = { _id: id as any }; // Handle static custom strings
      }
      const result = await this.db.collection('projects').deleteOne(filter);
      return result.deletedCount > 0;
    } catch (err) {
      console.error('Error deleting from MongoDB:', err);
      return false;
    }
  }

  // --- PUBLIC API: USERS ---

  async getUserByEmail(email: string): Promise<DBUser | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (this.isLocalFallback || !this.db) {
      const data = this.readLocal();
      return data.users.find(u => u.email === cleanEmail) || null;
    }

    try {
      const user = await this.db.collection('users').findOne({ email: cleanEmail });
      if (!user) return null;
      return {
        ...user,
        _id: user._id.toString()
      } as unknown as DBUser;
    } catch (err) {
      console.error('Error getting user from MongoDB:', err);
      return null;
    }
  }

  async createUser(email: string, passwordHash: string): Promise<DBUser> {
    const cleanEmail = email.toLowerCase().trim();
    const newUser: DBUser = {
      _id: this.isLocalFallback ? `user-${Date.now()}` : new ObjectId().toString(),
      email: cleanEmail,
      passwordHash,
      createdAt: Date.now()
    };

    if (this.isLocalFallback || !this.db) {
      const data = this.readLocal();
      // Avoid duplicate
      if (!data.users.some(u => u.email === cleanEmail)) {
        data.users.push(newUser);
        this.writeLocal(data);
      }
      return newUser;
    }

    try {
      const doc = {
        _id: new ObjectId(newUser._id),
        email: newUser.email,
        passwordHash: newUser.passwordHash,
        createdAt: newUser.createdAt
      };
      await this.db.collection('users').insertOne(doc);
      return newUser;
    } catch (err) {
      console.error('Error writing user to MongoDB, saving locally:', err);
      const data = this.readLocal();
      if (!data.users.some(u => u.email === cleanEmail)) {
        data.users.push(newUser);
        this.writeLocal(data);
      }
      return newUser;
    }
  }

  getDbStatus() {
    return {
      isFallback: this.isLocalFallback,
      type: this.isLocalFallback ? 'Local JSON File Database' : 'MongoDB Atlas Connection',
      location: this.isLocalFallback ? this.localDbPath : 'Cloud Database Instance'
    };
  }
}

// Global shared singleton
export const dbService = new DBService();
