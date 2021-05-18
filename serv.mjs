import http from 'http'
import { Server as WSServer } from 'socket.io'
const PORT = parseInt(process.env.PORT || 8080)

const httpServer = http.createServer((req, res)=> {
  res.writeHead(404, { 'Content-Type': 'text/plain;charset=utf-8' });
  res.end('Olá, você deve usar WebSockets para interagir com esse serviço.')
})
const io = new WSServer(httpServer, {
  cors: {
    origin: `http://localhost:${PORT}`
  }
})
httpServer.listen(PORT, ()=>
  console.log(`O servidor de corrida está de pé em http://localhost:${PORT}.`)
)


