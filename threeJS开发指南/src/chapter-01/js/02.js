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

  // 创建简单模拟3个坐标轴的对象。一个参数：
  // size -- (可选的) 表示代表轴的线段长度. 默认为 1.
  const axes = new THREE.AxesHelper(20)
  // 将对象添加到场景中
  scene.add(axes)

  // 创建平面
  /**
   * 生成平面几何体，四个参数：
   *  width — 平面沿着X轴的宽度。默认值是1。
   *  height — 平面沿着Y轴的高度。默认值是1。
   *  widthSegments — （可选）平面的宽度分段数，默认值是1。
   *  heightSegments — （可选）平面的高度分段数，默认值是1。
   */
  
  const planeGeometry = new THREE.PlaneGeometry(60, 20)
  // 一个以简单着色（平面或线框）方式来绘制几何体的材质。这种材质不受光照的影响。
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xAAAAAA
  })

  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(15, 0, 0)
  scene.add(plane)

  // 创建立方体
  const cubeGeommetry = new THREE.BoxGeometry(4, 4, 4)
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true
  })

  const cube = new THREE.Mesh(cubeGeommetry, cubeMaterial)
  cube.position.set(-4, 3, 0)
  scene.add(cube)

  // 创建球体
  const sphereGeomtry = new THREE.SphereGeometry(4, 20, 20)
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x7777FF,
    wireframe: true
  })

  const sphere = new THREE.Mesh(sphereGeomtry, sphereMaterial)
  sphere.position.set(20, 4, 2)
  scene.add(sphere)

  // 将摄影机定位并指向场景的中心
  camera.position.set(-30, 40, 30)
  camera.lookAt(scene.position)

  // 将渲染器的输出添加到html元素
  document.getElementById('webgl-output').appendChild(renderer.domElement)

  // 渲染场景
  renderer.render(scene, camera)
}

init()