import express,{json} from "express";
import userRoutes from  "./routes/userRoutes.js";


const app= express();

app.get('/',(req,res)=>{
    res.send('Hola')
})

app.use('/users',userRoutes)

app.use(json());
app.disable('x-powered-by')

const PORT = process.env.PORT || 3004;

app.listen(PORT,()=>{
    console.log(`servidor corriendo en el puerto ${PORT}`)
})