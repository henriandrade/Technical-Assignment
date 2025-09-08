import type { StoreApi } from 'zustand'
import type { ModuleStore, ModuleState } from './createNewConfiguratorModule'

export type ConfiguratorState = {
    version: '1'
    dimensions: ModuleState['dimensions']
    columns: ModuleState['columns']
    shelves: ModuleState['shelves']
    columnThickness: number
    shelfThickness: number
    frameThickness: number
    materials: ModuleState['materials']
    selectedMaterialKey: ModuleState['selectedMaterialKey']
    woodParams: ModuleState['woodParams']
    selectedGenus: string
    selectedFinish: string
    hoveredId: ModuleState['hoveredId']
    selectedId: ModuleState['selectedId']
}

export function serializeModuleStore(store: StoreApi<ModuleStore>): ConfiguratorState {
    const s = store.getState()
    return {
        version: '1',
        dimensions: s.dimensions,
        columns: s.columns,
        shelves: s.shelves,
        columnThickness: s.columnThickness,
        shelfThickness: s.shelfThickness,
        frameThickness: s.frameThickness,
        materials: s.materials,
        selectedMaterialKey: s.selectedMaterialKey,
        woodParams: s.woodParams,
        selectedGenus: s.selectedGenus ?? 'white_oak',
        selectedFinish: s.selectedFinish ?? 'matte',
        hoveredId: s.hoveredId,
        selectedId: s.selectedId,
    }
}

export function applySerializedState(snapshot: ConfiguratorState, store: StoreApi<ModuleStore>) {
    const s = store.getState()
    s.setDimensions(snapshot.dimensions)
    s.setFrameThickness(snapshot.frameThickness)
    s.setColumnThickness(snapshot.columnThickness)
    s.setShelfThickness(snapshot.shelfThickness)
    s.setColumnsEven(0)
    s.setShelvesEven(0)
    // apply exact columns/shelves
    // directly set by mutating store via set (not exposed), use actions sequence instead
    snapshot.columns.forEach(c => s.addColumn(c.x, c.width))
    // remove auto-generated ids mismatch by moving to positions
    const cols = store.getState().columns
    cols.forEach((c, i) => { if (snapshot.columns[i]) s.moveColumn(c.id, snapshot.columns[i]!.x) })
    snapshot.shelves.forEach(sh => s.addShelf(sh.y))
    // wood/materials
    s.setWoodParams(snapshot.woodParams)
    if (snapshot.selectedGenus && snapshot.selectedFinish) s.applyPreset(snapshot.selectedGenus, snapshot.selectedFinish)
    if (snapshot.selectedMaterialKey) s.setSelectedMaterial(snapshot.selectedMaterialKey)
    // selection
    s.setHovered(snapshot.hoveredId)
    s.setSelected(snapshot.selectedId)
}


