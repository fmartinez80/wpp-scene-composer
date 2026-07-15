import * as THREE from 'three'

export const createObjectGeometry = (type) => {
  let geometry, material, mesh

  switch (type) {
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
    case 'wood-table':
      const topGeometry = new THREE.BoxGeometry(2, 0.05, 1.2)
      const topMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.6, metalness: 0.1 })
      const top = new THREE.Mesh(topGeometry, topMaterial)
      top.position.y = 0.75
      top.castShadow = true
      top.receiveShadow = true

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

      mesh = new THREE.Group()
      mesh.add(top, leg1, leg2, leg3, leg4)
      return mesh

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
      return mesh

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
      return mesh

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
