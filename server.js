const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')

const PORT = 8080
const ROOT = path.resolve(__dirname)

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

function sendPage(res, statusCode, title, body) {
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;padding:2rem;text-align:center"><h1>${title}</h1><p>${body}</p><a href="/">Volver al inicio</a></body></html>`
  res.writeHead(statusCode, { 'Content-Type': 'text/html', ...SECURITY_HEADERS })
  res.end(html)
}

const server = http.createServer((req, res) => {
  const filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url)
  const resolvedPath = path.resolve(filePath)

  if (!resolvedPath.startsWith(ROOT)) {
    sendPage(res, 403, '403 Forbidden', 'Acceso denegado.')
    return
  }

  const ext = path.extname(resolvedPath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      sendPage(res, 404, '404 No encontrada', 'La página que buscas no existe.')
      return
    }
    res.writeHead(200, { 'Content-Type': contentType, ...SECURITY_HEADERS })
    res.end(data)
  })
})

const localIP = getLocalIP()
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`)
  if (localIP !== 'localhost') {
    console.log(`Access from mobile: http://${localIP}:${PORT}`)
  }
})
