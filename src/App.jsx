import { useState, useRef } from 'react'
import Canvas3D from './components/Canvas3D'
import CategoryPicker from './components/CategoryPicker'
import LayersPanel from './components/LayersPanel'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const [objects, setObjects] = useState([])
  const [selectedObjectId, setSelectedObjectId] = useState(null)
  const [sceneName, setSceneName] = useState('Untitled Scene')

  const addObject = (category, itemType) => {
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
    setObjects([...objects, newObject])
    setSelectedObjectId(newId)
  }

  const deleteObject = (id) => {
    setObjects(objects.filter(obj => obj.id !== id))
    if (selectedObjectId === id) setSelectedObjectId(null)
  }

  const updateObject = (id, updates) => {
    setObjects(objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj))
  }

  const getCategoryCount = (category, itemType) => {
    return objects.filter(obj => obj.category === category && obj.type === itemType).length
  }

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
          ref={canvasRef}
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
        />
      </main>

      {/* Right Panel - Layers */}
      <aside className="right-panel">
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
