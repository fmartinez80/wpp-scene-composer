import { useState } from 'react'
import '../styles/CameraPresets.css'

const CameraPresets = ({ cameraRef, onCameraChange }) => {
  const [activePreset, setActivePreset] = useState('default')

  const cameraPresets = {
    default: {
      label: 'Default',
      position: [3, 3, 3],
      fov: 50,
      target: [0, 0.5, 0]
    },
    overhead: {
      label: 'Overhead',
      position: [0, 4, 0],
      fov: 50,
      target: [0, 0.5, 0]
    },
    front: {
      label: 'Front',
      position: [0, 2, 4],
      fov: 45,
      target: [0, 0.5, 0]
    },
    side: {
      label: 'Side',
      position: [4, 2, 0],
      fov: 45,
      target: [0, 0.5, 0]
    },
    wide: {
      label: 'Wide',
      position: [4, 2.5, 4],
      fov: 60,
      target: [0, 0.5, 0]
    },
    closeup: {
      label: 'Close-up',
      position: [1.5, 1.5, 1.5],
      fov: 35,
      target: [0, 0.5, 0]
    }
  }

  const applyPreset = (presetName) => {
    const preset = cameraPresets[presetName]
    if (!cameraRef) return

    const camera = cameraRef

    // Animate camera movement
    const startPos = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      fov: camera.fov
    }
    const endPos = {
      x: preset.position[0],
      y: preset.position[1],
      z: preset.position[2],
      fov: preset.fov
    }

    const duration = 400 // ms
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      camera.position.x = startPos.x + (endPos.x - startPos.x) * progress
      camera.position.y = startPos.y + (endPos.y - startPos.y) * progress
      camera.position.z = startPos.z + (endPos.z - startPos.z) * progress
      camera.fov = startPos.fov + (endPos.fov - startPos.fov) * progress
      camera.updateProjectionMatrix()
      camera.lookAt(preset.target[0], preset.target[1], preset.target[2])

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
    setActivePreset(presetName)
    onCameraChange?.(presetName)
  }

  return (
    <div className="camera-presets">
      <div className="presets-label">CAMERA</div>
      <div className="presets-grid">
        {Object.entries(cameraPresets).map(([key, preset]) => (
          <button
            key={key}
            className={`preset-btn ${activePreset === key ? 'active' : ''}`}
            onClick={() => applyPreset(key)}
            title={preset.label}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CameraPresets
