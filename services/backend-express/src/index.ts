import express from 'express'
import cors from 'cors'
import { initDb } from './db/init'
import { statesRouter } from './routes/states.routes'

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

const port = Number(process.env.PORT || process.env.API_PORT || 3000)

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/states', statesRouter)

// Basic JSON error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[api] error', err)
    res.status(500).json({ error: 'internal_error' })
})

initDb().catch((e) => console.warn('[db] init failed', e)).finally(() => {
    app.listen(port, () => {
        console.log(`[api] listening on :${port}`)
    })
})
