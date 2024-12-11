const serverError= (err,req,res,next)=>{
    console.log(err.stack)
    res.status(500).json({message:'Ocurrio un error del servidor '})
    }

    export default serverError;