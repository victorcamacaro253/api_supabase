import express,{json} from "express";
import routes from "./routes/index.js"
import http from 'http'
import cors from 'cors'
import helmet from "helmet";
import morgan from "morgan";
import { setupWebsocket } from "./services/webSocket.js";


const app= express();

const server = http.createServer(app)

setupWebsocket(server)

app.disable('x-powered-by')


app.get('/',(req,res)=>{
    res.send('Hola')
})
app.use(json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'))
app.use(cors())

app.use(helmet())

app.use(routes)

const PORT = process.env.PORT || 3004;

server.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})