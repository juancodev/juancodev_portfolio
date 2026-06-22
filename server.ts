import 'reflect-metadata';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { NestFactory } from '@nestjs/core';
import { 
  Module, 
  Controller, 
  Post, 
  Get, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Headers, 
  HttpException, 
  HttpStatus, 
  ValidationPipe 
} from '@nestjs/common';
import path from 'path';

// Import our DB and Auth Services
import { dbService } from './src/db/db.service';
import { AuthService } from './src/auth/auth.service';

// --- NEST CONTROLLERS ---

@Controller('contact')
class ContactController {
  @Post()
  async handleContact(@Body() body: any) {
    console.log('Contact form submitted via NestJS:', body);
    return { success: true, message: 'Message received and processed by NestJS ✅' };
  }
}

@Controller('auth')
class AuthController {
  @Post('register')
  async register(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new HttpException('Email y contraseña requeridos.', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      throw new HttpException('El correo ya está registrado.', HttpStatus.CONFLICT);
    }

    const passwordHash = await AuthService.hashPassword(password);
    const user = await dbService.createUser(email, passwordHash);

    const token = AuthService.generateToken({ userId: user._id, email: user.email });
    return {
      success: true,
      user: { id: user._id, email: user.email },
      token
    };
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new HttpException('Email y contraseña requeridos.', HttpStatus.BAD_REQUEST);
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      throw new HttpException('Usuario no registrado.', HttpStatus.NOT_FOUND);
    }

    const isMatch = await AuthService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new HttpException('Contraseña incorrecta.', HttpStatus.UNAUTHORIZED);
    }

    const token = AuthService.generateToken({ userId: user._id, email: user.email });
    return {
      success: true,
      user: { id: user._id, email: user.email },
      token
    };
  }

  @Get('me')
  async getMe(@Headers() headers: any) {
    const decoded = AuthService.getAuthUserFromRequest(headers);
    if (!decoded) {
      throw new HttpException('No autorizado.', HttpStatus.UNAUTHORIZED);
    }

    const user = await dbService.getUserByEmail(decoded.email);
    if (!user) {
      throw new HttpException('Usuario no existe en base de datos.', HttpStatus.UNAUTHORIZED);
    }

    return {
      success: true,
      user: { id: user._id, email: user.email }
    };
  }
}

@Controller('projects')
class ProjectsController {
  @Get()
  async getProjects() {
    const projects = await dbService.getProjects();
    return {
      success: true,
      projects
    };
  }

  @Get('db-info')
  async getDbInfo() {
    return {
      success: true,
      status: dbService.getDbStatus()
    };
  }

  @Post()
  async addProject(@Headers() headers: any, @Body() body: any) {
    const decoded = AuthService.getAuthUserFromRequest(headers);
    if (!decoded) {
      throw new HttpException('No autorizado. Sesión inválida o expirada.', HttpStatus.UNAUTHORIZED);
    }

    const { title_es, title_en, description_es, description_en, tech, link, color } = body;
    
    if (!title_es || !title_en || !description_es || !description_en) {
      throw new HttpException('Faltan campos requeridos.', HttpStatus.BAD_REQUEST);
    }

    try {
      const newProject = await dbService.addProject({
        title_es,
        title_en,
        description_es,
        description_en,
        tech: Array.isArray(tech) ? tech : [],
        link: link || '#',
        color: color || 'from-accent-cyan to-accent-purple'
      });
      return { success: true, project: newProject };
    } catch (err: any) {
      throw new HttpException('Error al agregar proyecto: ' + err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async updateProject(@Param('id') id: string, @Headers() headers: any, @Body() body: any) {
    const decoded = AuthService.getAuthUserFromRequest(headers);
    if (!decoded) {
      throw new HttpException('No autorizado. Sesión inválida o expirada.', HttpStatus.UNAUTHORIZED);
    }

    try {
      const updated = await dbService.updateProject(id, body);
      if (!updated) {
        throw new HttpException('Proyecto no encontrado.', HttpStatus.NOT_FOUND);
      }
      return { success: true, message: 'Proyecto actualizado correctamente.' };
    } catch (err: any) {
      throw new HttpException('Error al actualizar: ' + err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Headers() headers: any) {
    const decoded = AuthService.getAuthUserFromRequest(headers);
    if (!decoded) {
      throw new HttpException('No autorizado. Sesión inválida o expirada.', HttpStatus.UNAUTHORIZED);
    }

    try {
      const deleted = await dbService.deleteProject(id);
      if (!deleted) {
        throw new HttpException('Proyecto no encontrado.', HttpStatus.NOT_FOUND);
      }
      return { success: true, message: 'Proyecto eliminado correctamente.' };
    } catch (err: any) {
      throw new HttpException('Error al eliminar: ' + err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

// --- NEST APP APP_MODULE ---

@Module({
  controllers: [ContactController, AuthController, ProjectsController],
})
class AppModule {}

// --- SERVER BOOTSTRAP ---

async function startServer() {
  const PORT = 3000;

  // Initialize NestJS and let it create its own Express instance
  const nestApp = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  
  // Set global API prefix so routes don't conflict with frontend pages
  nestApp.setGlobalPrefix('api');
  
  // Route everything else to Vite for Development, or static files for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    nestApp.use((req: any, res: any, next: any) => {
      // Allow API routes to pass through to NestJS controllers
      if (req.url.startsWith('/api')) {
        next();
      } else {
        // Send frontend routes to Vite
        vite.middlewares(req, res, async () => {
          try {
            const url = req.originalUrl || req.url;
            if (!url.includes('.')) {
              const fs = await import('fs');
              const htmlPath = path.resolve(process.cwd(), 'index.html');
              let html = fs.readFileSync(htmlPath, 'utf-8');
              html = await vite.transformIndexHtml(url, html);
              res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
            } else {
              next();
            }
          } catch (e: any) {
            vite.ssrFixStacktrace(e);
            console.error('Vite transform index.html error:', e);
            res.status(500).end(e.message);
          }
        });
      }
    });
  } else {
    // Production SPA serving
    const distPath = path.join(process.cwd(), 'dist');
    nestApp.use(express.static(distPath));
    nestApp.use((req: any, res: any, next: any) => {
      if (req.url.startsWith('/api')) {
        next();
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  // Initialize the Nest application context and routes
  await nestApp.init();

  // Start the server via NestJS
  await nestApp.listen(PORT, '0.0.0.0');
  console.log(`🚀 Full-stack Server (React + NestJS) running on http://localhost:${PORT}`);
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
