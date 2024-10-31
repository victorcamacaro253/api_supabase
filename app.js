import express,{json} from "express";
import userRoutes from  "./routes/userRoutes.js";
import cors from 'cors'
import helmet from "helmet";

const app= express();

app.disable('x-powered-by')


app.get('/',(req,res)=>{
    res.send('Hola')
})
app.use(json());
app.use(express.urlencoded({ extended: true }));


app.use(cors())

app.use(helmet())

app.use('/users',userRoutes)



const PORT = process.env.PORT || 3004;

app.listen(PORT,()=>{
    console.log(`servidor corriendo en el puerto ${PORT}`)
})