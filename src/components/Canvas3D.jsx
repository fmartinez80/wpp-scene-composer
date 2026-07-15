import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import TransformGizmo from './TransformGizmo'

const Canvas3D = forwardRef(({ objects, selectedObjectId, onSelectObject, onUpdateObject }, ref) => {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const objectsRef = useRef(new Map())
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  // Expose refs to parent
  useImperativeHandle(ref, () => ({
    sceneRef,
    cameraRef
  }))

  const createObject = (type) => {
    let geometry, material, mesh

    switch (type) {
      // Tableware
      case 'bowl':
        geometry = new THREE.CylinderGeometry(0.3, 0.35, 0.25, 32)
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 })
        break
      case 'plate':
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32)
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0 })
        break
      case 'napkin':
        geometry = new THREE.BoxGeometry(0.3, 0.02, 0.3)
        material = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 })
        break

      // Drinkware
      case 'glass':
        geometry = new THREE.CylinderGeometry(0.08, 0.1, 0.2, 16)
        material = new THREE.MeshStandardMaterial({ color: 0xe8f4f8, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.7 })
        break
      case 'mug':
        geometry = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16)
        material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 })
        break
      case 'wine-glass':
        geometry = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 16)
        material = new THREE.MeshStandardMaterial({ color: 0xe8d4f8, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.6 })
        break

      // Flatware
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

      // Furniture
      case 'chair':
        geometry = new THREE.BoxGeometry(0.4, 0.8, 0.4)
        material = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6, metalness: 0 })
        break
      case 'candle':
        geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 8)
        material = new THREE.MeshStandardMaterial({ color: 0xffffcc, roughness: 0.3, emissive: 0xffaa00, emissiveIntensity: 0.3 })
        break
      case 'vase':
        geometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 16)
        material = new THREE.MeshStandardMaterial({ color: 0xccccff, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.8 })
        break

      // Tables - special handling
      case 'wood-table':
        // Table top
        const topGeometry = new THREE.BoxGeometry(2, 0.05, 1.2)
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.6, metalness: 0.1 })
        const top = new THREE.Mesh(topGeometry, topMaterial)
        top.position.y = 0.75
        top.castShadow = true
        top.receiveShadow = true

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08)
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7, metalness: 0 })
        const leg1 = new THREE.Mesh(legGeometry, legMaterial)
        leg1.position.set(-0.9, 0.375, -0.5)
        leg1.castShadow = true
        leg1.receiveShadow = true

        const leg2 = leg1.clone()
        leg2.position.set(0.9, 0.375, -0.5)
        const leg3 = leg1.clone()
        leg3.position.set(-0.9, 0.375, 0.5)
        const leg4 = leg1.clone()
        leg4.position.set(0.9, 0.375, 0.5)

        // Group table parts
        mesh = new THREE.Group()
        mesh.add(top, leg1, leg2, leg3, leg4)
        break

      case 'marble-table':
        const marbleTopGeometry = new THREE.BoxGeometry(2, 0.08, 1.2)
        const marbleMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3, metalness: 0.2 })
        const marbleTop = new THREE.Mesh(marbleTopGeometry, marbleMaterial)
        marbleTop.position.y = 0.75
        marbleTop.castShadow = true
        marbleTop.receiveShadow = true

        const marbleLegGeometry = new THREE.BoxGeometry(0.1, 0.75, 0.1)
        const metalLegMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.8 })
        const mleg1 = new THREE.Mesh(marbleLegGeometry, metalLegMaterial)
        mleg1.position.set(-0.9, 0.375, -0.5)
        mleg1.castShadow = true
        mleg1.receiveShadow = true

        const mleg2 = mleg1.clone()
        mleg2.position.set(0.9, 0.375, -0.5)
        const mleg3 = mleg1.clone()
        mleg3.position.set(-0.9, 0.375, 0.5)
        const mleg4 = mleg1.clone()
        mleg4.position.set(0.9, 0.375, 0.5)

        mesh = new THREE.Group()
        mesh.add(marbleTop, mleg1, mleg2, mleg3, mleg4)
        break

      case 'glass-table':
        const glassTopGeometry = new THREE.BoxGeometry(2, 0.05, 1.2)
        const glassMaterial = new THREE.MeshStandardMaterial({ color: 0xddebf7, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.7 })
        const glassTop = new THREE.Mesh(glassTopGeometry, glassMaterial)
        glassTop.position.y = 0.75
        glassTop.castShadow = true
        glassTop.receiveShadow = true

        const glassLegGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08)
        const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 })
        const gleg1 = new THREE.Mesh(glassLegGeometry, chromeMaterial)
        gleg1.position.set(-0.9, 0.375, -0.5)
        gleg1.castShadow = true
        gleg1.receiveShadow = true

        const gleg2 = gleg1.clone()
        gleg2.position.set(0.9, 0.375, -0.5)
        const gleg3 = gleg1.clone()
        gleg3.position.set(-0.9, 0.375, 0.5)
        const gleg4 = gleg1.clone()
        gleg4.position.set(0.9, 0.375, 0.5)

        mesh = new THREE.Group()
        mesh.add(glassTop, gleg1, gleg2, gleg3, gleg4)
        break

      // Shapes
      case 'cube':
        geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
        material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
        break
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.2, 32, 32)
        material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
        break
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16)
        material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
        break

      default:
        geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
        material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
    }

    if (!mesh) {
      mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
    }

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
    cameraRef.current = camera

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

  return (
    <>
      <div ref={containerRef} className="canvas-3d" />
      {selectedObjectId && sceneRef.current && cameraRef.current && (
        <TransformGizmo
          selectedObjectId={selectedObjectId}
          objects={objects}
          onUpdateObject={onUpdateObject}
          sceneRef={sceneRef}
          cameraRef={cameraRef}
        />
      )}
    </>
  )
})

Canvas3D.displayName = 'Canvas3D'
export default Canvas3D
