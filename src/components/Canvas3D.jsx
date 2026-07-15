import { useEffect, useRef, forwardRef } from 'react'
import * as THREE from 'three'

const Canvas3D = forwardRef(({ objects, selectedObject, cameraPreset, aspectRatio }, ref) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const objectsRef = useRef({})
  const labelsCanvasRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7)
    scene.add(directionalLight)

    // Table (simple box)
    const tableGeometry = new THREE.BoxGeometry(4, 0.1, 2.5)
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 })
    const table = new THREE.Mesh(tableGeometry, tableMaterial)
    table.userData = { label: 'Table' }
    scene.add(table)
    objectsRef.current.table = table

    // Create label canvas for text rendering
    const labelCanvas = document.createElement('canvas')
    labelCanvas.width = width
    labelCanvas.height = height
    labelsCanvasRef.current = labelCanvas

    // Camera controls (simple orbit)
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let orbitAngles = { theta: 0, phi: Math.PI / 4 }

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    })

    renderer.domElement.addEventListener('mousemove', (e) => {
      if (isDragging && e.button !== 2) {
        const deltaX = e.clientX - previousMousePosition.x
        const deltaY = e.clientY - previousMousePosition.y
        orbitAngles.theta += deltaX * 0.01
        orbitAngles.phi -= deltaY * 0.01
        orbitAngles.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitAngles.phi))
        previousMousePosition = { x: e.clientX, y: e.clientY }
      }
    })

    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false
    })

    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault()
      const currentDistance = camera.position.length()
      const newDistance = currentDistance + e.deltaY * 0.01
      camera.position.normalize().multiplyScalar(Math.max(3, Math.min(20, newDistance)))
    })

    const updateCamera = () => {
      const elev = (cameraPreset.elevation * Math.PI) / 180
      const azim = (cameraPreset.azimuth * Math.PI) / 180
      const distance = cameraPreset.focal === 'wide' ? 12 : cameraPreset.focal === 'tight' ? 4 : 7
      const radius = distance * Math.sin(elev)
      const height = distance * Math.cos(elev)

      camera.position.x = radius * Math.sin(azim)
      camera.position.y = height
      camera.position.z = radius * Math.cos(azim)
      camera.lookAt(0, 0, 0)

      if (cameraPreset.dutch !== 0) {
        camera.rotateZ((cameraPreset.dutch * Math.PI) / 180)
      }
    }

    const createCompositeCanvas = () => {
      const composite = document.createElement('canvas')
      composite.width = width * window.devicePixelRatio
      composite.height = height * window.devicePixelRatio
      const ctx = composite.getContext('2d')

      // Draw 3D scene from renderer
      ctx.drawImage(renderer.domElement, 0, 0, composite.width, composite.height)

      // Draw labels
      const labelCtx = labelCanvas.getContext('2d')
      ctx.font = 'bold 14px Arial'
      ctx.fillStyle = '#000'
      ctx.textAlign = 'center'

      scene.children.forEach((child) => {
        if (child.userData.label) {
          const vector = child.position.clone()
          vector.project(camera)
          const x = ((vector.x + 1) * composite.width) / 2
          const y = (-(vector.y - 1) * composite.height) / 2

          if (vector.z < 1) {
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 3
            ctx.strokeText(child.userData.label, x, y)
            ctx.fillStyle = '#000'
            ctx.fillText(child.userData.label, x, y)
          }
        }
      })

      return composite
    }

    const animate = () => {
      requestAnimationFrame(animate)
      updateCamera()
      renderer.render(scene, camera)

      // Create composite canvas for export
      const composite = createCompositeCanvas()
      ref.current = composite
    }

    animate()

    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
      labelCanvas.width = newWidth
      labelCanvas.height = newHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Update objects in scene
  useEffect(() => {
    if (!sceneRef.current) return

    const scene = sceneRef.current

    // Remove old objects
    Object.values(objectsRef.current).forEach((mesh) => {
      if (mesh.userData.id !== 'table') scene.remove(mesh)
    })

    objectsRef.current = { table: objectsRef.current.table }

    // Add new objects
    objects.forEach((obj) => {
      const geometry = createGeometry(obj.type)
      const material = new THREE.MeshStandardMaterial({
        color: selectedObject === obj.id ? 0xff6b6b : 0x4a90e2,
        metalness: 0.3,
        roughness: 0.6
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...obj.position)
      mesh.rotation.set(...obj.rotation)
      mesh.scale.set(...obj.scale)
      mesh.userData = { id: obj.id, label: obj.label, type: obj.type }
      scene.add(mesh)
      objectsRef.current[obj.id] = mesh
    })
  }, [objects, selectedObject])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
})

function createGeometry(type) {
  const geometries = {
    bowl: new THREE.ConeGeometry(0.4, 0.3, 32),
    plate: new THREE.CylinderGeometry(0.45, 0.45, 0.05, 32),
    glass: new THREE.CylinderGeometry(0.2, 0.25, 0.5, 16),
    fork: new THREE.BoxGeometry(0.1, 0.6, 0.05),
    spoon: new THREE.BoxGeometry(0.15, 0.6, 0.05),
    cup: new THREE.CylinderGeometry(0.2, 0.22, 0.4, 16),
    chair: new THREE.BoxGeometry(0.5, 0.8, 0.5),
    cube: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(0.5, 32, 32),
    cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    cone: new THREE.ConeGeometry(0.5, 1, 32),
    torus: new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    plane: new THREE.PlaneGeometry(1, 1)
  }
  return geometries[type] || new THREE.BoxGeometry(0.5, 0.5, 0.5)
}

function renderLabels(canvas, camera, scene, width, height) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  ctx.font = 'bold 12px Arial'
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'

  scene.children.forEach((child) => {
    if (child.userData.label) {
      const vector = child.position.clone()
      vector.project(camera)
      const x = (vector.x * width) / 2 + width / 2
      const y = -(vector.y * height) / 2 + height / 2

      if (vector.z < 1) {
        ctx.fillText(child.userData.label, x, y - 10)
      }
    }
  })
}

export default Canvas3D
