import { Router } from 'express'
import { listStates, getState, createState, updateState, deleteState } from '../controllers/states.controller'

export const statesRouter = Router()

statesRouter.get('/', listStates)
statesRouter.get('/:id', getState)
statesRouter.post('/', createState)
statesRouter.put('/:id', updateState)
statesRouter.delete('/:id', deleteState)


