import Task from "../models/Task.js";

const allwed = ['Pendiente', 'En Proceso', 'Completado'];

export async function list(req, res){
    const items = await Task.find({user: req, userId, delete:false}).sort({createdAt:-1});
    res.json({items});
}

export async function create(req, res){
    const{title, description = '', status ='Pendiente', clienteId} = req.body;
    if (!title)return res.status(400).json ({message:'El titulo es requerido'});

    const task = await Task.create({
        user :req.userId, 
        title, 
        description, 
        status: allwed.includes(status)? status:'Pendiente', 
        clienteId
    });
}

    export async function update(req, res){
        const{id}=req.params;
        const{title, description, status} = req.body;

        if(status && !allwed.includes(status))
            return res.status(400).json({message: ''});
        

        const task = await Task.findOneAndUpdate(
            {_id:id, user:req.userId}, 
            {title, description, status}, 
            {new:true}
        );

        if(!task)return res.status(404).json({message:'Tarea no encontrada'});
        res.json({task});
    }



    export async function remove(req, res){
        const{id} = req.params;

        const task = await Task.findOneAndUpdate(
            {_id:id, user:req.userId}, 
            {title, description, status}, 
            {new:true}
        );

        if(!task) return res.status(404).json({message:'Tarea no encontrada'});
        res.json({ok: true});
    }

    /**endoint para sincronización offline : crear/actualizar y devolver mapeo  */

    export async function bulksync(req, res){
        const {task} = req.body;
        const mapping =[];

        for (const item of tasks) {
            if(!task.clienteId || !task.title) continue;
            
            let doc = await Task.findOne({user: req.userId, clienteId: task.clienteId});
            if(!doc){
                doc= await Task.create({
                            user :req.userId, 
        title, 
        description, 
        status: allwed.includes(status)? status:'Pendiente', 
        clienteId: t.clienteId

                });
            }else{
                doc.title= t.title ?? doc.title;
                doc.description = t.description ?? doc.description;

                if(t.status && allwed.includes (t.status)) doc.status =t.status;
                await doc.save();
            }
            mapping.push({clienteId: t.clienteId, serverId: String(doc._id)});
        }

        res.json({mapping});

    }