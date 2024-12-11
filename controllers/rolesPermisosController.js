import RolesPermisos from "../models/rolesPermisosModel.js"
import redis from '../config/redisClient.js';
import cacheService from "../services/cacheService.js";


class rolesPermisosController{


    static getRoles= async (req,res)=>{
        try{

            const cachedUsers = await cacheService.getFromCache('roles')

              if (cachedUsers) {
                  console.log('roles obtenidos mediante redis')
              return  res.json(cachedUsers)
  }
            const roles =  await RolesPermisos.getRoles()

            await cacheService.setToCache('roles',roles)

            res.json(roles)

    }catch(error){
        console.log(error)
        res.status(500).json({message: 'Error al obtener los roles'})

    }


}


 static  getRolesById= async (req,res)=>{
    try{
        const {id} = req.params
        const roles =  await RolesPermisos.getRoleById(id)
        if (!roles){
            return res.status(404).json({message: 'Rol no encontrado'})
            }


        res.json(roles)

        }catch(error){
            console.log(error)
            res.status(500).json({message: 'Error al obtener los roles'})
            
        }


        }

        static getRoleByName=async  (req,res)=>{
            const {name} = req.query

            try{
                const roles =  await RolesPermisos.getRoleByName(name)
                if (!roles){
                    return res.status(404).json({message: 'Rol no encontrado'})
                    }

                    res.json(roles)

        }catch(error){
            console.log(error)
            res.status(500).json({message: 'Error al obtener los roles'})
        }
    }




  static   createRole= async (req,res)=>{
    try{
        const {rol,description} = req.body

   const exisitngRole= await  RolesPermisos.getRoleByName(rol)

   if (exisitngRole.length> 0) {
    return res.status(400).json({message: 'Rol ya existe'})

    
   }

          await RolesPermisos.createRole(rol,description)

    


        res.status(201).json({message:"Rol creado exitosamente"})
        }catch(error){
            console.log(error)
            res.status(500).json({message: 'Error al crear el rol'})


        }

}


static   updateRole= async (req,res)=>{
    try{
        const {id} = req.params
        const {rol,description} = req.body

        const updateFields=[]
        const values=[]
        if(rol){
            values.push('rol')
            updateFields.push(rol)
            }
            if(description){
                values.push('description')
                updateFields.push(description)
                }
                const roles =  await RolesPermisos.updateRole(id,updateFields,values)


    
        res.json({message:"Rol actualizado exitosamente"})
        }catch(error){
            console.log(error)
            res.status(500).json({message: 'Error al actualizar el rol'})
            }

         }



         static deleteRole= async (req,res)=>{
           const {id}=  req.params
           try{
            const roles =  await RolesPermisos.deleteRole(id)
            res.json({message:"Rol eliminado exitosamente"})
            }catch(error){
                console.log(error)
                res.status(500).json({message: 'Error al eliminar el rol'})
                }


         }


         static getPermisos = async (req,res)=>{
            try{
                const permisos =  await RolesPermisos.getPermisos()
                res.json(permisos)
                }catch(error){
                    console.log(error)
                    res.status(500).json({message: 'Error al obtener los permisos'})
                    }

         }



         static getPermisosById=  async (req,res)=>{
            const {id}=  req.params
            try{
                const permisos =  await RolesPermisos.getPermisosById(id)
                if(permisos.length===0){
                    res.status(404).json({message: 'No se encontraron permisos para el rol'})

                }
                res.json(permisos)
                }catch(error){
                    console.log(error)
                    res.status(500).json({message: 'Error al obtener los permisos del rol'})
                        }
                        
                        }


                        static getPermisosByName=   async (req,res)=>{
                            const {name}=  req.query
                            try{
                                const permisos =  await RolesPermisos.getPermisoByName(name)
                                if(permisos.length===0){
                                    res.status(404).json({message: 'No se encontraron permisos con ese nombre'})
                                        }



                                        res.status(200).json(permisos)
                                        }catch(error){
                                            console.log(error)
                                            res.status(500).json({message: 'Error al obtener el permiso con ese nombre'})
                                            }
                                            



                                            }
                                            

      static createPermiso= async (req,res)=>{
        const {name}= req.body
        try{
            const permiso = await RolesPermisos.createPermiso(name)
            res.json(permiso)
            }catch(error){
                console.log(error)
                res.status(500).json({message: 'Error al crear el permiso'})
                }

      }


      static updatePermiso = async (req,res)=>{
        const {id}= req.params
        const {name}= req.body
        try {
            const permiso = await RolesPermisos.updatePermiso(id,name)
            res.json(permiso)
            
            
        } catch (error) {
            console.log(error)
            res.status(500).json({message: 'Error al actualizar el permiso'})
            
        }
      }


      static deletePermiso  = async (req,res)=>{
        const {id}= req.params
        try{
            const permiso = await RolesPermisos.deletePermiso(id)
            if(permiso.length===0){
                res.json({message: 'El permiso no existe'})
            }
            res.json(permiso)
        }catch(error){
            console.log(error)
            res.status(500).json({message: 'Error al eliminar el permiso'})
        }
    }

    static getPermisosByRole = async (req,res)=>{
        try {
            const list = await RolesPermisos.listPermisosByRol()
            res.json(list)
        } catch (error) {
            return res.status(500).json({message: 'Error al obtener los permisos del rol'})
            
        }
    }
    

}

export default rolesPermisosController
