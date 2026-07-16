import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const TransformGizmo = ({ selectedObjectId, objects, onUpdateObject, sceneRef, cameraRef, getBoundingBox }) => {
  const gizmoRef = useRef(null)
  const isDraggingRef = useRef(false)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  useEffect(() => {
    if (!selectedObjectId || !sceneRef || !cameraRef) return

    const selectedObj = objects.find(o => o.id === selectedObjectId)
    if (!selectedObj) return

    // Create small circular directional pad
    const gizmo = new THREE.Group()
    gizmoRef.current = gizmo

    // Circular base pad (light gray)
    const padGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32)
    const padMat = new THREE.MeshBasicMaterial({ color: 0xcccccc })
    const pad = new THREE.Mesh(padGeom, padMat)
    pad.position.y = 0.02
    pad.userData.type = 'pad'
    gizmo.add(pad)

    // Four directional indicators
    const arrowSize = 0.08
    const arrowDist = 0.15

    // Forward (positive Z) - blue
    const fwdGeom = new THREE.BoxGeometry(arrowSize * 0.6, arrowSize * 0.3, arrowSize)
    const fwdMat = new THREE.MeshBasicMaterial({ color: 0x0066ff })
    const fwd = new THREE.Mesh(fwdGeom, fwdMat)
    fwd.position.set(0, 0.05, arrowDist)
    fwd.userData.direction = [0, 1]
    gizmo.add(fwd)

    // Backward (negative Z) - blue
    const bwdGeom = new THREE.BoxGeometry(arrowSize * 0.6, arrowSize * 0.3, arrowSize)
    const bwdMat = new THREE.MeshBasicMaterial({ color: 0x0066ff })
    const bwd = new THREE.Mesh(bwdGeom, bwdMat)
    bwd.position.set(0, 0.05, -arrowDist)
    bwd.userData.direction = [0, -1]
    gizmo.add(bwd)

    // Right (positive X) - red
    const rgtGeom = new THREE.BoxGeometry(arrowSize, arrowSize * 0.3, arrowSize * 0.6)
    const rgtMat = new THREE.MeshBasicMaterial({ color: 0xff6600 })
    const rgt = new THREE.Mesh(rgtGeom, rgtMat)
    rgt.position.set(arrowDist, 0.05, 0)
    rgt.userData.direction = [1, 0]
    gizmo.add(rgt)

    // Left (negative X) - red
    const lftGeom = new THREE.BoxGeometry(arrowSize, arrowSize * 0.3, arrowSize * 0.6)
    const lftMat = new THREE.MeshBasicMaterial({ color: 0xff6600 })
    const lft = new THREE.Mesh(lftGeom, lftMat)
    lft.position.set(-arrowDist, 0.05, 0)
    lft.userData.direction = [-1, 0]
    gizmo.add(lft)

    // Position gizmo above selected object
    let gizmoY = selectedObj.position[1]
    if (getBoundingBox) {
      const bbox = getBoundingBox(selectedObjectId)
      if (bbox) {
        const objectHeight = bbox.max.y - bbox.min.y
        gizmoY = selectedObj.position[1] + objectHeight / 2 + 0.15
      }
    }
    gizmo.position.set(selectedObj.position[0], gizmoY, selectedObj.position[2])
    sceneRef.add(gizmo)

    // Mouse tracking
    const onMouseMove = (event) => {
      const canvas = event.target
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (isDraggingRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef)
        const tableHeight = selectedObj.position[1]
        const planeNormal = new THREE.Vector3(0, 1, 0)
        const plane = new THREE.Plane(planeNormal, -tableHeight)
        const intersection = new THREE.Vector3()

        if (!raycasterRef.current.ray.intersectPlane(plane, intersection)) {
          return
        }

        onUpdateObject(selectedObjectId, { position: [intersection.x, selectedObj.position[1], intersection.z] })
        gizmo.position.set(intersection.x, gizmoY, intersection.z)
      }
    }

    const onMouseDown = (event) => {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef)
      const intersects = raycasterRef.current.intersectObjects(gizmo.children)
      if (intersects.length > 0) {
        isDraggingRef.current = true
      }
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
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
  }, [selectedObjectId, objects, onUpdateObject, sceneRef, cameraRef, getBoundingBox])

  return null
}

export default TransformGizmo
