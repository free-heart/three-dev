import * as THREE from '../../../build/three.module.js'
import Stats from '../../../examples/jsm/libs/stats.module.js'
import { GUI } from '../../../examples/jsm/libs/dat.gui.module.js'
import { TrackballControls } from '../../../examples/jsm/controls/TrackballControls.js'

const width = window.innerWidth
const height = window.innerHeight

// 初始化帧数统计模块
function initStats () {
  const panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0
  const stats = new Stats()

  stats.showPanel(panelType) // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom)

  return stats
}

// TrackballControls 类似 于OrbitControls。
// 然而，它并不保持一个恒定的摄像机向上向量。这意味着，如果相机在南极和北极轨道上运行，它不会翻转以保持“正面朝上”。
// 初始化轨迹球控件来控制场景
function initTrackballControls (camera, renderer) {
  const trackballControls = new TrackballControls(camera, renderer.domElement)
  trackballControls.rotateSpeed = 1.0
  trackballControls.zoomSpeed = 1.2
  trackballControls.panSpeed = 0.8
  trackballControls.noZoom = false
  trackballControls.noPan = false
  trackballControls.staticMoving = true
  trackballControls.dynamicDampingFactor = 0.3
  trackballControls.keys = [65, 83, 68]

  return trackballControls
}

function init () {
  const stats = initStats()

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
    color: 0xffffff
  })

  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(15, 0, 0)
  plane.receiveShadow = true

  scene.add(plane)

  // 创建立方体
  const cubeGeommetry = new THREE.BoxGeometry(4, 4, 4)
  const cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xFF0000
  })

  const cube = new THREE.Mesh(cubeGeommetry, cubeMaterial)
  cube.position.set(-4, 3, 0)
  // 开启阴影
  cube.castShadow = true

  scene.add(cube)

  // 创建球体
  const sphereGeomtry = new THREE.SphereGeometry(4, 20, 20)
  const sphereMaterial = new THREE.MeshLambertMaterial({
    color: 0x7777FF
  })

  const sphere = new THREE.Mesh(sphereGeomtry, sphereMaterial)
  sphere.position.set(20, 4, 2)
  sphere.castShadow = true

  scene.add(sphere)

  // 将摄影机定位并指向场景的中心
  camera.position.set(-30, 40, 30)
  camera.lookAt(scene.position)

  // 添加光点源
  const spotLight = new THREE.SpotLight(0xffffff)
  spotLight.position.set(-10, 20, -5)
  spotLight.castShadow = true

  scene.add(spotLight)

  // 添加环境光。
  // 环境光会均匀的照亮场景中的所有物体。
  // 环境光不能用来投射阴影，因为它没有方向。
  const ambienLight = new THREE.AmbientLight(0x353535)
  scene.add(ambienLight)

  // 将渲染器的输出添加到html元素
  document.getElementById('webgl-output').appendChild(renderer.domElement)

  // 添加控制
  const controls =  new function () {
    // 控制小球的弹跳速度
    this.rotationSpeed = 0.02
    // 控制立方体的旋转
    this.bouncingSpeed = 0.03
  }
  const gui = new GUI()
  gui.add(controls, 'rotationSpeed', 0, 0.5)
  gui.add(controls, 'bouncingSpeed', 0, 0.5)

  const trackballControls = initTrackballControls(camera, renderer)
  // 该对象用于跟踪时间
  const clock = new THREE.Clock()

  let step = 0
  // 渲染场景
  renderScene()
  function renderScene () {
    // 利用鼠标移动摄像机
    trackballControls.update(clock.getDelta())
    stats.update()

    // 围绕立方体的轴旋转立方体
    cube.rotation.x += controls.rotationSpeed
    cube.rotation.y += controls.rotationSpeed
    cube.rotation.z += controls.rotationSpeed

    // 使球体上下弹跳
    step += controls.bouncingSpeed
    // Math.cos() 函数返回一个数值的余弦值
    sphere.position.x = 20 + 10 * (Math.cos(step))
    // Math.abs(x) 函数返回指定数字 “x“ 的绝对值
    // Math.sin() 函数返回一个数值的正弦值
    sphere.position.y= 2 + 10 * Math.abs(Math.sin(step))
    
    requestAnimationFrame(renderScene)
    renderer.render(scene, camera)
  }

  // 监听浏览器窗口
  window.addEventListener('resize', onResize, false)

  function onResize () {
    // aspect 摄像机视锥体的长宽比，通常是使用画布的宽/画布的高。默认值是1（正方形画布）。
    camera.aspect = window.innerWidth / window.innerHeight
    // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

init()