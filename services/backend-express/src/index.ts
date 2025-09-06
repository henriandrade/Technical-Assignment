import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const port = Number(process.env.PORT || process.env.API_PORT || 3000)

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.listen(port, () => {
    console.log(`[api] listening on :${port}`)
})
