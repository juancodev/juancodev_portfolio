import 'reflect-metadata';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import path from 'path';

// --- NEST CONTROLLERS AND MODULES ---

@Controller('contact')
class ContactController {
  @Post()
  async handleContact(@Body() body: any) {
    console.log('Contact form submitted via NestJS:', body);
    return { success: true, message: 'Message received and processed by NestJS ✅' };
  }
}

@Module({
  controllers: [ContactController],
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
  // IMPORTANT: We add this via nestApp.use() BEFORE await nestApp.init() 
  // so it intercepts non-API routes before Nest's global 404 handler runs.
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
        vite.middlewares(req, res, next);
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
