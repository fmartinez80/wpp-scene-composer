import { useState, useCallback, useMemo } from 'react'
import Canvas3D from './components/Canvas3D'
import TransformGizmo from './components/TransformGizmo'
import CategoryPicker from './components/CategoryPicker'
import LayersPanel from './components/LayersPanel'
import CameraPresets from './components/CameraPresets'
import './App.css'

function App() {
  const [objects, setObjects] = useState(() => {
    return [{
      id: 'wood-table-init',
      type: 'wood-table',
      category: 'tables',
      label: 'wood-table',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }]
  })
  const [selectedObjectId, setSelectedObjectId] = useState('wood-table-init')
  const [sceneName, setSceneName] = useState('Untitled Scene')
  const [fileName, setFileName] = useState('untitled_scene')
  const [sceneRef, setSceneRef] = useState(null)
  const [cameraRef, setCameraRef] = useState(null)
  const [getBoundingBox, setGetBoundingBox] = useState(null)
  const [mode, setMode] = useState('compose') // 'compose' or 'preview'

  const addObject = useCallback((category, itemType) => {
    // For tables, replace the existing table instead of adding a new one
    if (category === 'tables') {
      const currentTable = objects.find(obj => obj.category === 'tables')
      if (currentTable) {
        // Replace existing table
        setObjects(objects => objects.map(obj =>
          obj.id === currentTable.id
            ? { ...obj, type: itemType, label: itemType }
            : obj
        ))
        setSelectedObjectId(currentTable.id)
      }
    } else {
      // Add new object for other categories
      const newId = `${itemType}-${Date.now()}`
      const spawnHeight = ['tableware', 'drinkware', 'flatware', 'decorative'].includes(category) ? 0.85 : 0
      const newObject = {
        id: newId,
        type: itemType,
        category,
        label: itemType,
        position: [0, spawnHeight, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      }
      setObjects(objects => [...objects, newObject])
      setSelectedObjectId(newId)
    }
  }, [objects])

  const deleteObject = useCallback((id) => {
    setObjects(objects => objects.filter(obj => obj.id !== id))
    setSelectedObjectId(current => current === id ? null : current)
  }, [])

  const updateObject = useCallback((id, updates) => {
    setObjects(objects => objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj))
  }, [])

  const getCategoryCount = useCallback((category, itemType) => {
    return objects.filter(obj => obj.category === category && obj.type === itemType).length
  }, [])

  const handleSceneReady = useCallback(({ scene, camera, getBoundingBox }) => {
    setSceneRef(scene)
    setCameraRef(camera)
    setGetBoundingBox(() => getBoundingBox)
  }, [])

  return (
    <div className="app">
      {/* Top Toolbar */}
      <header className="toolbar">
        <div className="toolbar-left">
          <label className="file-name-label">FILE NAME</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="file-name-input"
            placeholder="untitled_scene"
          />
          <button className="toolbar-button" title="Load">LOAD</button>
          <button className="toolbar-button" title="Save">SAVE</button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-button" title="Export">EXPORT</button>
          <button className={`toolbar-button mode-toggle ${mode === 'preview' ? 'active' : ''}`}
                  onClick={() => setMode(mode === 'compose' ? 'preview' : 'compose')}>
            {mode === 'compose' ? 'PREVIEW' : 'COMPOSE'}
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="main-content">
        <Canvas3D
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onSceneReady={handleSceneReady}
        />
        {selectedObjectId && sceneRef && cameraRef && getBoundingBox && (
          <TransformGizmo
            selectedObjectId={selectedObjectId}
            objects={objects}
            onUpdateObject={updateObject}
            sceneRef={sceneRef}
            cameraRef={cameraRef}
            getBoundingBox={getBoundingBox}
          />
        )}
      </main>

      {/* Right Panel - Layers & Camera */}
      <aside className="right-panel">
        <CameraPresets cameraRef={cameraRef} onCameraChange={() => {}} />
        <LayersPanel
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onDeleteObject={deleteObject}
        />
      </aside>

      {/* Bottom Category Picker */}
      <footer className="category-footer">
        <CategoryPicker onSelectItem={addObject} getCategoryCount={getCategoryCount} />
      </footer>
    </div>
  )
}

export default App
