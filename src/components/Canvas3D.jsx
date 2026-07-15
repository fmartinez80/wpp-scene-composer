import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const Canvas3D = ({ objects, selectedObjectId, onSelectObject }) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const objectsRef = useRef(new Map())
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  const createObject = (type) => {
    let geometry, material

    switch (type) {
      case 'bowl':
        geometry = new THREE.CylinderGeometry(0.3, 0.35, 0.25, 32)
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 })
        break
      case 'plate':
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32)
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0 })
        break
      case 'glass':
        geometry = new THREE.CylinderGeometry(0.08, 0.1, 0.2, 16)
        material = new THREE.MeshStandardMaterial({ color: 0xe8f4f8, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 })
        break
      case 'mug':
        geometry = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16)
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 })
        break
      case 'fork':
        geometry = new THREE.BoxGeometry(0.02, 0.3, 0.15)
        material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 })
        break
      case 'knife':
        geometry = new THREE.BoxGeometry(0.02, 0.3, 0.08)
        material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 })
        break
      case 'spoon':
        geometry = new THREE.BoxGeometry(0.015, 0.3, 0.1)
        material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 })
        break
      default:
        geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
        material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(3, 3, 3)
    camera.lookAt(0, 0.5, 0)

    // Renderer
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
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const height = containerRef.current.clientHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
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
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      const intersects = raycasterRef.current.intersectObjects(Array.from(objectsRef.current.values()))
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object
        for (const [id, mesh] of objectsRef.current) {
          if (mesh === clickedMesh) {
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('click', onMouseClick)
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Update scene objects
  useEffect(() => {
    if (!sceneRef.current) return

    // Remove objects no longer in the list
    const objectIds = new Set(objects.map(obj => obj.id))
    for (const [id, mesh] of objectsRef.current) {
      if (!objectIds.has(id)) {
        sceneRef.current.remove(mesh)
        objectsRef.current.delete(id)
      }
    }

    // Add or update objects
    objects.forEach(obj => {
      if (!objectsRef.current.has(obj.id)) {
        const mesh = createObject(obj.type)
        mesh.position.fromArray(obj.position)
        mesh.rotation.fromArray(obj.rotation)
        mesh.scale.fromArray(obj.scale)
        sceneRef.current.add(mesh)
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
    for (const [id, mesh] of objectsRef.current) {
      if (id === selectedObjectId) {
        mesh.material = mesh.material.clone()
        mesh.material.emissive.setHex(0x0066cc)
      } else {
        mesh.material.emissive.setHex(0x000000)
      }
    }
  }, [selectedObjectId])

  return <div ref={containerRef} className="canvas-3d" />
}

export default Canvas3D
