// Sirve dist/ para los e2e. El preview de Astro 7 levanta un daemon y Playwright
// lo interpreta como un proceso que murio antes de estar listo, asi que aca hay
// un servidor en primer plano, sin dependencias, que respeta el contrato del
// build: un directorio resuelve a su index.html y lo desconocido devuelve el
// 404 real del sitio con status 404.
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../dist/", import.meta.url))
const port = Number(process.env.PORT ?? 4321)

const server = Bun.serve({
  port,
  hostname: "127.0.0.1",

  async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname)
    const relative = pathname.replace(/^\/+/, "")

    for (const candidate of [relative, `${relative.replace(/\/$/, "")}/index.html`, `${relative}index.html`]) {
      if (candidate === "") continue
      const file = Bun.file(root + candidate)
      if (await file.exists()) return new Response(file)
    }

    const notFound = Bun.file(`${root}404.html`)
    return new Response((await notFound.exists()) ? await notFound.text() : "Not found", {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  },
})

console.log(`e2e static server on http://127.0.0.1:${server.port}`)
