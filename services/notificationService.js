import { getIo } from "./webSocket.js";

const notify =(notification)=>{
    const io = getIo();
    if(io){
        console.log('Emitiendo Notificacion',notification)
        io.emit('notificacion',notification)
    }else{
        console.error('websocket no esta inicializado')
    }
}


export default {notify}