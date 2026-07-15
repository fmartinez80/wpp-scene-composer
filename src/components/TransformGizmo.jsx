import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const TransformGizmo = ({ selectedObjectId, objects, onUpdateObject, sceneRef, cameraRef }) => {
  const gizmoRef = useRef(null)
  const isDraggingRef = useRef(false)
  const dragAxisRef = useRef(null)
  const dragStartRef = useRef({ x: 0, z: 0 })
  const objectStartPosRef = useRef({ x: 0, z: 0 })
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  useEffect(() => {
    if (!selectedObjectId || !sceneRef || !cameraRef) return

    const selectedObj = objects.find(o => o.id === selectedObjectId)
    if (!selectedObj) return

    // Create gizmo visuals
    const gizmo = new THREE.Group()
    gizmoRef.current = gizmo

    // X-axis arrow (red) - much larger for visibility
    const xArrowGeom = new THREE.BoxGeometry(2.0, 0.3, 0.3)
    const xArrowMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false })
    const xArrow = new THREE.Mesh(xArrowGeom, xArrowMat)
    xArrow.position.x = 1.0
    xArrow.position.y = 0.2
    xArrow.userData.axis = 'x'
    gizmo.add(xArrow)

    // Z-axis arrow (blue) - much larger for visibility
    const zArrowGeom = new THREE.BoxGeometry(0.3, 0.3, 2.0)
    const zArrowMat = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false })
    const zArrow = new THREE.Mesh(zArrowGeom, zArrowMat)
    zArrow.position.z = 1.0
    zArrow.position.y = 0.2
    zArrow.userData.axis = 'z'
    gizmo.add(zArrow)

    // Center point (yellow) - much larger for visibility
    const centerGeom = new THREE.SphereGeometry(0.5, 16, 16)
    const centerMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: false })
    const center = new THREE.Mesh(centerGeom, centerMat)
    center.position.y = 0.2
    center.userData.axis = 'xy'
    gizmo.add(center)

    // Position gizmo at object location, on the table surface
    gizmo.position.set(selectedObj.position[0], selectedObj.position[1], selectedObj.position[2])
    sceneRef.add(gizmo)

    // Mouse tracking
    const onMouseMove = (event) => {
      const canvas = event.target
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (isDraggingRef.current && dragAxisRef.current) {
        const axis = dragAxisRef.current

        // Ray cast to table surface plane to get new position
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef)
        const tableHeight = selectedObj.position[1]
        const planeNormal = new THREE.Vector3(0, 1, 0)
        const plane = new THREE.Plane(planeNormal, -tableHeight)
        const intersection = new THREE.Vector3()

        if (!raycasterRef.current.ray.intersectPlane(plane, intersection)) {
          return // Ray doesn't intersect plane
        }

        if (axis === 'x') {
          const newX = intersection.x
          onUpdateObject(selectedObjectId, { position: [newX, selectedObj.position[1], selectedObj.position[2]] })
          gizmo.position.set(newX, selectedObj.position[1], selectedObj.position[2])
        } else if (axis === 'z') {
          const newZ = intersection.z
          onUpdateObject(selectedObjectId, { position: [selectedObj.position[0], selectedObj.position[1], newZ] })
          gizmo.position.set(selectedObj.position[0], selectedObj.position[1], newZ)
        } else if (axis === 'xy') {
          onUpdateObject(selectedObjectId, { position: [intersection.x, selectedObj.position[1], intersection.z] })
          gizmo.position.set(intersection.x, selectedObj.position[1], intersection.z)
        }
      }
    }

    const onMouseDown = (event) => {
      // Check if clicking on gizmo
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      const intersects = raycasterRef.current.intersectObjects(gizmo.children)
      if (intersects.length > 0) {
        isDraggingRef.current = true
        dragAxisRef.current = intersects[0].object.userData.axis || 'xy'
        dragStartRef.current = { x: mouseRef.current.x, z: mouseRef.current.y }
        objectStartPosRef.current = {
          x: selectedObj.position[0],
          z: selectedObj.position[2]
        }
      }
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
      dragAxisRef.current = null
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      if (gizmoRef.current && sceneRef) {
        sceneRef.remove(gizmoRef.current)
      }
    }
  }, [selectedObjectId, objects, onUpdateObject, sceneRef, cameraRef])

  return null
}

export default TransformGizmo
