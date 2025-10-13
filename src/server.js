import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

import taskRoutes from './routes/task.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ ok: true, name: 'todo-pwa-api' }));
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Conexión a MongoDB (solo si no está ya conectada)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a la Base de Datos de Brendius'))
    .catch(err => {
      console.error('Error al conectar a la base de datos', err);
    });
}

// Exportar la app para Vercel
export default app;
