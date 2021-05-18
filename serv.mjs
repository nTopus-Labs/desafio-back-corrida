import http from 'http'
import WS from 'ws'
const PORT = parseInt(process.env.PORT || 8080)

const httpServer = http.createServer((req, res)=> {
  res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  res.end(`
  <html>
  <head><title>404</title></head>
  <body>
  <h1>404</h1>
  <p>Olá, você deve usar WebSockets para interagir com esse serviço.</p>
  <pre id="display"></pre>
  <script>
  socket = new WebSocket('ws://localhost:${PORT}')
  socket.addEventListener('open', console.log)
  socket.addEventListener('message', (msg)=> display.innerHTML = msg.data.replace(/\\{/g,'\\n{'))
  socket.addEventListener('error', console.error)
  </script>
  <body>
  </html>
  `)
})

const ws = new WS.Server({ server: httpServer })

httpServer.listen(PORT, ()=> {
  console.log(
    `O servidor de corrida está de pé em http://localhost:${PORT}.\n` +
    `Conecte seu cliente WebSocket em ws://localhost:${PORT}`
  )
  iniciarCorrida()
})

let clients = []
ws.on("connection", (socket)=> {
  clients.push(socket)
  console.log(`\rRecebemos um cliente! 😃 (Total: ${clients.length})`)
  socket.on('close', ()=> {
    clients = clients.filter(s => s !== socket)
    console.log(`\rPerdemos um cliente. ☹️ (Total: ${clients.length})`)
  })
})

function send(evName, payload) {
  clients.forEach((socket)=>
    socket.send(JSON.stringify([evName, payload]))
  )
}

function delay(secs, func) {
  setTimeout(func, secs*1000)
}

function delaySend(secs, evName, payload) {
  delay(secs, send.bind({}, evName, JSON.parse(JSON.stringify(payload))))
}

function iniciarCorrida() {
  const animais = [ // Teremos de 2 a 8 animais randomizados
    { nome: 'Dourado',  distancia: 0 },
    { nome: 'Filomena', distancia: 0 },
    { nome: 'Jujuba',   distancia: 0 },
    { nome: 'Mimosa',   distancia: 0 },
    { nome: 'Pink',     distancia: 0 },
    { nome: 'Rex',      distancia: 0 },
    { nome: 'Rufos',    distancia: 0 },
    { nome: 'Spot',     distancia: 0 }
  ]
  .sort(()=> Math.random()<.5 ? -1 : 1)
  .filter((a,i)=> i<2 || Math.random()<.5)
  const msg1 = '\rA corrida iniciará em... '
  const msg2 = `\rLargada com ${animais.length} animais!    \n`
  for (let i=0; i<5; i++) (
    (i)=> delay(i, ()=> process.stdout.write(msg1 + (5-i)))
  )(i)
  delay(5, ()=> process.stdout.write(msg2))
  delaySend(5, 'largada', animais)
  let sec = 5
  let victory = null
  let allEnded = false
  while (!allEnded) {
    sec += 0.1
    let animal = animais[Math.floor(Math.random()*animais.length)]
    animal.distancia += 2 + Math.floor(Math.random()*5)
    if (animal.distancia >= 100) animal.distancia = 100
    delaySend(sec, 'update', animais)
    if (!victory && animal.distancia === 100) {
      victory = animal
      delaySend(sec, 'vitoria', animal)
      delay(sec, ()=> console.log(animal.nome,'venceu!'))
    }
    allEnded = !animais.find(a => a.distancia < 100)
  }
  delay(sec, ()=> console.log('A corrida acabou.'))
  delay(sec, iniciarCorrida)
}

