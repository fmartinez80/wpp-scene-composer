import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createObjectGeometry } from '../utils/objectGeometries'

const Canvas3D = ({ objects, selectedObjectId, onSelectObject, onSceneReady }) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const objectsRef = useRef(new Map())
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(3, 3, 3)
    camera.lookAt(0, 0.5, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 8, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -10
    directionalLight.shadow.camera.right = 10
    directionalLight.shadow.camera.top = 10
    directionalLight.shadow.camera.bottom = -10
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0xe0e0e0, 0xf0f0f0)
    gridHelper.position.y = 0.001
    scene.add(gridHelper)

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(width, height)
      }
    }
    window.addEventListener('resize', handleResize)

    // Mouse interaction
    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    const onMouseClick = (event) => {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      const intersects = raycasterRef.current.intersectObjects(Array.from(objectsRef.current.values()))
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object
        for (const [id, mesh] of objectsRef.current) {
          if (mesh === clickedMesh || mesh.children.includes(clickedMesh)) {
            onSelectObject(id)
            break
          }
        }
      } else {
        onSelectObject(null)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('click', onMouseClick)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Notify parent that scene is ready
    if (onSceneReady) {
      onSceneReady({ scene, camera })
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('click', onMouseClick)
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [onSceneReady, onSelectObject])

  // Update scene objects
  useEffect(() => {
    if (!sceneRef || typeof sceneRef.add !== 'function') return

    const objectIds = new Set(objects.map(o => o.id))
    for (const [id, mesh] of objectsRef.current) {
      if (!objectIds.has(id)) {
        sceneRef.remove(mesh)
        objectsRef.current.delete(id)
      }
    }

    objects.forEach(obj => {
      if (!objectsRef.current.has(obj.id)) {
        const mesh = createObjectGeometry(obj.type)
        mesh.position.fromArray(obj.position)
        mesh.rotation.fromArray(obj.rotation)
        mesh.scale.fromArray(obj.scale)
        sceneRef.add(mesh)
        objectsRef.current.set(obj.id, mesh)
      } else {
        const mesh = objectsRef.current.get(obj.id)
        mesh.position.fromArray(obj.position)
        mesh.rotation.fromArray(obj.rotation)
        mesh.scale.fromArray(obj.scale)
      }
    })
  }, [objects])

  // Update selection highlight
  useEffect(() => {
    for (const [id, obj] of objectsRef.current) {
      if (obj.isMesh) {
        if (id === selectedObjectId) {
          obj.material.emissive?.setHex(0x0066cc)
        } else {
          obj.material.emissive?.setHex(0x000000)
        }
      } else if (obj.isGroup) {
        obj.children.forEach(child => {
          if (child.isMesh) {
            if (id === selectedObjectId) {
              child.material.emissive?.setHex(0x0066cc)
            } else {
              child.material.emissive?.setHex(0x000000)
            }
          }
        })
      }
    }
  }, [selectedObjectId])

  return <div ref={containerRef} className="canvas-3d" />
}

export default Canvas3D
