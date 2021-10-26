import * as THREE from '../../../build/three.module.js'

const width = window.innerWidth
const height = window.innerHeight

function init () {
  // 创建场景，该场景将包含所有元素，例如对象、摄影机和灯光。
  const scene = new THREE.Scene()

  /**
   * 创建相机，定义了我们要看的地方。
   * PerspectiveCamera - 透视相机，这一投影模式被用来模拟人眼所看到的景象，它是3D场景的渲染中使用得最普遍的投影模式。四个参数：
   *  fov — 摄像机视锥体垂直视野角度
   *  aspect — 摄像机视锥体长宽比
   *  near — 摄像机视锥体近端面
   *  far — 摄像机视锥体远端面
   */
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)

  // 创建Webgl渲染器
  const renderer = new THREE.WebGLRenderer()
  // 设置颜色及其透明度
  renderer.setClearColor(new THREE.Color(0x000000))
  // 设置输出canvas的大小
  renderer.setSize(width, height)
  // 开启阴影贴图
  renderer.shadowMap.enabled = true

  // 创建平面
  /**
   * 生成平面几何体，四个参数：
   *  width — 平面沿着X轴的宽度。默认值是1。
   *  height — 平面沿着Y轴的高度。默认值是1。
   *  widthSegments — （可选）平面的宽度分段数，默认值是1。
   *  heightSegments — （可选）平面的高度分段数，默认值是1。
   */
  
  const planeGeometry = new THREE.PlaneGeometry(60, 20)
  // MeshBasicMaterial 材质对光源没有反应
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xAAAAAA
  })

  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(15, 0, 0)
  plane.receiveShadow = true

  // 创建立方体
  const cubeGeommetry = new THREE.BoxGeometry(4, 4, 4)
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xFF0000
  })

  const cube = new THREE.Mesh(cubeGeommetry, cubeMaterial)
  cube.position.set(-4, 3, 0)
  // 开启阴影
  cube.castShadow = true

  // 创建球体
  const sphereGeomtry = new THREE.SphereGeometry(4, 20, 20)
  const sphereMaterial = new THREE.MeshLambertMaterial({
    color: 0x7777FF
  })

  const sphere = new THREE.Mesh(sphereGeomtry, sphereMaterial)
  sphere.position.set(20, 4, 2)
  sphere.castShadow = true

  /* 若查看第二种场景，请注释以下代码 */
  // scene.add(plane)
  // scene.add(cube)
  // scene.add(sphere)
  /* 若查看第二种场景，请注释以上代码 */

  /* 第二种场景 */
  createTree(scene)
  createHouse(scene)
  createGroundPlane(scene)
  createBoundingWall(scene)

  // 将摄影机定位并指向场景的中心
  camera.position.set(-30, 40, 30)
  camera.lookAt(scene.position)

  // 添加光点源
  const spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-40, 40, -15)
  spotLight.castShadow = true
  spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
  spotLight.shadow.camera.far = 130
  spotLight.shadow.camera.near = 40

  scene.add(spotLight)

  // 添加环境光。
  // 环境光会均匀的照亮场景中的所有物体。
  // 环境光不能用来投射阴影，因为它没有方向。
  const ambienLight = new THREE.AmbientLight(0x353535)
  scene.add(ambienLight)

  // 将渲染器的输出添加到html元素
  document.getElementById('webgl-output').appendChild(renderer.domElement)

  // 渲染场景
  renderer.render(scene, camera)
}

init()

// 创建树
function createTree (scene) {
  /**
   * new THREE.CubeGeometry() 已废弃
   * 请使用 BoxBufferGeometry
   * https://github.com/mrdoob/three.js/wiki/Migration-Guide#r124--r125
   */
  const trunk = new THREE.BoxBufferGeometry( 1, 8, 1 )
  const leaves = new THREE.SphereBufferGeometry(4, 8, 6)

  const trunkMesh = new THREE.Mesh(trunk, new THREE.MeshLambertMaterial({
    color: 0x8b4513
  }))
  const leavesMesh = new THREE.Mesh(leaves, new THREE.MeshLambertMaterial({
    color: 0x00ff00
  }))

  trunkMesh.position.set(-10, 4, 0)
  leavesMesh.position.set(-10, 12, 0)

  trunkMesh.receiveShadow = true
  trunkMesh.castShadow = true
  leavesMesh.receiveShadow = true
  leavesMesh.castShadow = true

  scene.add(trunkMesh)
  scene.add(leavesMesh)
}

// 创建房子
function createHouse (scene) {
  const roof = new THREE.ConeGeometry(5, 4)
  const base = new THREE.CylinderGeometry(5, 5, 6)

  const roofMesh = new THREE.Mesh(roof, new THREE.MeshLambertMaterial({
    color: 0x8b7213
  }))
  const baseMesh = new THREE.Mesh(base, new THREE.MeshLambertMaterial({
    color: 0xffe4c4
  }))

  roofMesh.position.set(25, 8, 0)
  baseMesh.position.set(25, 3, 0)

  roofMesh.receiveShadow = true
  roofMesh.castShadow = true
  baseMesh.receiveShadow = true
  baseMesh.castShadow = true

  scene.add(roofMesh)
  scene.add(baseMesh)
}

// 创建地面
function createGroundPlane (scene) {
  const planeGeometry = new THREE.PlaneGeometry(70, 50)
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0x9acd32
  })

  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(15, 0, 0)
  plane.receiveShadow = true

  scene.add(plane)
}

// 创建围墙
function createBoundingWall (scene) {
  const wallLeft = new THREE.BoxBufferGeometry(70, 2, 2)
  const wallRight = new THREE.BoxBufferGeometry(70, 2, 2)
  const wallTop = new THREE.BoxBufferGeometry(2, 2, 50)
  const wallBottom = new THREE.BoxBufferGeometry(2, 2, 50)

  const wallMaterial = new THREE.MeshLambertMaterial({
    color: 0xa0522d
  })

  const wallLeftMesh = new THREE.Mesh(wallLeft, wallMaterial)
  const wallRightMesh = new THREE.Mesh(wallRight, wallMaterial)
  const wallTopMesh = new THREE.Mesh(wallTop, wallMaterial)
  const wallBottomMesh = new THREE.Mesh(wallBottom, wallMaterial)

  wallLeftMesh.position.set(15, 1, -25)
  wallRightMesh.position.set(15, 1, 25)
  wallTopMesh.position.set(-19, 1, 0)
  wallBottomMesh.position.set(49, 1, 0)

  scene.add(wallLeftMesh)
  scene.add(wallRightMesh)
  scene.add(wallBottomMesh)
  scene.add(wallTopMesh)
}