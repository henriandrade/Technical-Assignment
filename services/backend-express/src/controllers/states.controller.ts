import type { Request, Response } from 'express'
import { query } from '../db/client'
import { ConfiguratorStateZ, CreateStateBodyZ, UpdateStateBodyZ } from '../schemas/configuratorState'

function badRequest(res: Response, issues: unknown) {
    return res.status(400).json({ error: 'validation_error', issues })
}

export async function listStates(req: Request, res: Response) {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '24')), 1), 100)
    const offset = Math.max(parseInt(String(req.query.offset ?? '0')), 0)
    const q = String(req.query.query ?? '').trim()
    const params: any[] = []
    let where = ''
    if (q) {
        params.push(`%${q}%`)
        where = 'WHERE name ILIKE $1'
    }
    const sql = `SELECT id, name, thumbnail_data_url, created_at, updated_at FROM configurator_states ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    const { rows } = await query(sql, params)
    return res.json({ items: rows })
}

export async function getState(req: Request, res: Response) {
    const id = req.params.id
    const { rows } = await query('SELECT id, name, thumbnail_data_url, state, created_at, updated_at FROM configurator_states WHERE id = $1', [id])
    const row = rows[0]
    if (!row) return res.status(404).json({ error: 'not_found' })
    // validate outbound state for safety
    const parsed = ConfiguratorStateZ.safeParse(row.state)
    if (!parsed.success) return badRequest(res, parsed.error.issues)
    return res.json({ ...row, state: parsed.data })
}

export async function createState(req: Request, res: Response) {
    console.log('[states] create body keys:', Object.keys(req.body || {}))
    const parsed = CreateStateBodyZ.safeParse(req.body)
    if (!parsed.success) {
        console.warn('[states] create validation error:', parsed.error.issues)
        return badRequest(res, parsed.error.issues)
    }
    const { name, thumbnail_data_url, state } = parsed.data
    console.log('[states] creating', { name, thumbLen: thumbnail_data_url?.length ?? 0 })
    const { rows } = await query(
        'INSERT INTO configurator_states (name, thumbnail_data_url, state) VALUES ($1, $2, $3) RETURNING id, name, thumbnail_data_url, created_at, updated_at',
        [name, thumbnail_data_url ?? null, state]
    )
    return res.status(201).json(rows[0])
}

export async function updateState(req: Request, res: Response) {
    const id = req.params.id
    console.log('[states] update id:', id, 'body keys:', Object.keys(req.body || {}))
    const parsed = UpdateStateBodyZ.safeParse(req.body)
    if (!parsed.success) {
        console.warn('[states] update validation error:', parsed.error.issues)
        return badRequest(res, parsed.error.issues)
    }
    const { name, thumbnail_data_url, state } = parsed.data
    const fields: string[] = []
    const params: any[] = []
    if (name !== undefined) { params.push(name); fields.push(`name = $${params.length}`) }
    if (thumbnail_data_url !== undefined) { params.push(thumbnail_data_url); fields.push(`thumbnail_data_url = $${params.length}`) }
    if (state !== undefined) { params.push(state); fields.push(`state = $${params.length}`) }
    if (fields.length === 0) return res.json({ ok: true })
    params.push(id)
    await query(`UPDATE configurator_states SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length}`, params)
    return res.json({ ok: true })
}

export async function deleteState(req: Request, res: Response) {
    const id = req.params.id
    await query('DELETE FROM configurator_states WHERE id = $1', [id])
    return res.status(204).end()
}


