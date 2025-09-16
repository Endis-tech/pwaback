
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        user:{type:mongoose.Schema.Types.ObjectId, REF: 'User', required:true},
        title:{type:String, required:true, trim:true},
        description:{type:String, trim:true, default:''}, 
        status:{type:String, enum:['Pendiente', 'En Proceso', 'Completado'], default:'Pendiente'}, 
        ClienteId:{type:String}, 
        delete:{type:Boolean, default:false}
    },
    {Timestamp:true}

);

taskSchema.index({user:1, cratedAt:-1});

export default mongoose.model('Task', taskSchema);
