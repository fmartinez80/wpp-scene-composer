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
  const [sceneRef, setSceneRef] = useState(null)
  const [cameraRef, setCameraRef] = useState(null)

  const addObject = useCallback((category, itemType) => {
    const newId = `${itemType}-${Date.now()}`
    const newObject = {
      id: newId,
      type: itemType,
      category,
      label: itemType,
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
    setObjects(objects => [...objects, newObject])
    setSelectedObjectId(newId)
  }, [])

  const deleteObject = useCallback((id) => {
    setObjects(objects => objects.filter(obj => obj.id !== id))
    setSelectedObjectId(current => current === id ? null : current)
  }, [])

  const updateObject = useCallback((id, updates) => {
    setObjects(objects => objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj))
  }, [])

  const getCategoryCount = useCallback((category, itemType) => {
    return objects.filter(obj => obj.category === category && obj.type === itemType).length
  }, [objects])

  const handleSceneReady = useCallback((scene, camera) => {
    setSceneRef(scene)
    setCameraRef(camera)
  }, [])

  return (
    <div className="app">
      {/* Top Toolbar */}
      <header className="toolbar">
        <div className="toolbar-left">
          <div className="scene-name-pill">
            <div className="scene-dot"></div>
            <input
              type="text"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              className="scene-name-input"
            />
          </div>
          <button className="toolbar-icon" title="Save">💾</button>
          <button className="toolbar-icon" title="Import">📦</button>
          <button className="toolbar-icon" title="Add">➕</button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-icon" title="Properties">🖌️</button>
          <button className="toolbar-icon" title="Layers">📊</button>
          <button className="toolbar-icon" title="Menu">☰</button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="main-content">
        <Canvas3D
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
          onSceneReady={({ scene, camera }) => handleSceneReady(scene, camera)}
        />
        {selectedObjectId && sceneRef && cameraRef && (
          <TransformGizmo
            selectedObjectId={selectedObjectId}
            objects={objects}
            onUpdateObject={updateObject}
            sceneRef={sceneRef}
            cameraRef={cameraRef}
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
