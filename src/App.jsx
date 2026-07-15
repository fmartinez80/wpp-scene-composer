import { useState, useRef, useEffect } from 'react'
import Canvas3D from './components/Canvas3D'
import ShapeLibrary from './components/ShapeLibrary'
import CameraControls from './components/CameraControls'
import SceneManager from './components/SceneManager'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [objects, setObjects] = useState([])
  const [selectedObject, setSelectedObject] = useState(null)
  const [sceneName, setSceneName] = useState('Untitled Scene')
  const [cameraPreset, setCameraPreset] = useState({ elevation: 45, azimuth: 0, dutch: 0, focal: 'medium' })
  const [aspectRatio, setAspectRatio] = useState('16:9')

  const addObject = (shapeType) => {
    const newId = Math.random().toString(36).substr(2, 9)
    const newObject = {
      id: newId,
      type: shapeType,
      label: `${shapeType}_${objects.filter(o => o.type === shapeType).length + 1}`.substr(0, 10),
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
    setObjects([...objects, newObject])
    setSelectedObject(newId)
  }

  const removeObject = (id) => {
    setObjects(objects.filter(o => o.id !== id))
    if (selectedObject === id) setSelectedObject(null)
  }

  const updateObject = (id, updates) => {
    setObjects(objects.map(o => o.id === id ? { ...o, ...updates } : o))
  }

  const renameObject = (id, newLabel) => {
    const truncated = newLabel.slice(0, 10)
    updateObject(id, { label: truncated })
  }

  const exportImage = async () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL('image/png')
    link.download = `${sceneName.replace(/\s+/g, '_')}_${aspectRatio.replace(':', '-')}.png`
    link.click()
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="scene-name-container">
          <input
            type="text"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            className="scene-name"
            placeholder="Scene name"
          />
        </div>
        <button className="export-btn" onClick={exportImage}>Export PNG</button>
      </header>

      <div className="main-layout">
        <aside className="left-panel">
          <SceneManager
            objects={objects}
            selectedObject={selectedObject}
            onSelect={setSelectedObject}
            onDelete={removeObject}
            onRename={renameObject}
          />
        </aside>

        <section className="canvas-section">
          <Canvas3D
            ref={canvasRef}
            objects={objects}
            selectedObject={selectedObject}
            cameraPreset={cameraPreset}
            aspectRatio={aspectRatio}
            sceneRef={sceneRef}
          />
          <div className="canvas-info">
            <span>Drag to orbit • Scroll to zoom • Right-click to pan</span>
          </div>
        </section>

        <aside className="right-panel">
          <div className="panel-section">
            <h3>Camera</h3>
            <CameraControls
              cameraPreset={cameraPreset}
              onPresetChange={setCameraPreset}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
            />
          </div>

          <div className="panel-section">
            <h3>Add Items</h3>
            <ShapeLibrary onAddShape={addObject} />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
