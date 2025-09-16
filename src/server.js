import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

//Importar Rutas 
import taskRoutes from './routes/task.routes.js';
//Descomentar authRoutes
import authRoutes from './routes/auth.routes.js';
import e from 'cors';


//Crear la aplicación de Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
//Conectar a la base de datos 
app.get('/', (req, res) => res.json({ok:true, name:'todo-pwa-api'}));
app.use('/api/tasks', taskRoutes);
//descomentar auth Routes 
app.use('/api/auth', authRoutes);

const {PORT = 4000, MONGO_URI} = process.env;

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Conectado a la Base de Datos de Brendius ${PORT}`));
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos', err);
        process.exit(1);
    })
