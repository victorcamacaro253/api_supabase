import { Socket, Server as SocketIOServer } from "socket.io";

let io 


export const  setupWebsocket = (httpServer) =>{
    io = new SocketIOServer(httpServer,{
    cors:{
        origin: "*", //Permitir todas las solicitudes de origen
        methods: ['GET','POST'],
        allowedHeaders:['Content-Type','Authorization'],
        credentials: true //Permitir el envío de cookies
    }
    })

    io.on('connection',(socket)=>{
        console.log('Cliente socket.io conectado')

       // manejo de eventos de mensajes
       socket.on('mensaje', (msg) => {
        console.log(`Mensaje recibido:': ${msg}`)
    })

    socket.emit('Welcome','Bienvenido al servidor de websocket')

    socket.on('disconnect',()=>{
        console.log('Cliente socket.io desconectado')
    })

});
return io;

}

export const getIo = ()=> io