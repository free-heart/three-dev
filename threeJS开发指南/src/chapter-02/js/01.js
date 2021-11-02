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
  
  const planeGeometry = new THREE.PlaneGeometry(60, 40)
  // MeshBasicMaterial 材质对光源没有反应
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff
  })

  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -0.5 * Math.PI
  plane.position.set(0, 0, 0)
  plane.receiveShadow = true

  scene.add(plane)

  // 将摄影机定位并指向场景的中心
  camera.position.set(-30, 40, 30)
  camera.lookAt(scene.position)

  // 添加环境光。
  // 环境光会均匀的照亮场景中的所有物体。
  // 环境光不能用来投射阴影，因为它没有方向。
  const ambienLight = new THREE.AmbientLight(0x3c3c3c)
  scene.add(ambienLight)

  /**
   * 添加光点源
   * color - (可选参数) 十六进制光照颜色。 缺省值 0xffffff (白色)。
   * intensity - (可选参数) 光照强度。 缺省值 1。
   * distance - 从光源发出光的最大距离，其强度根据光源的距离线性衰减。
   * angle - 光线散射角度，最大为Math.PI/2。
   * penumbra - 聚光锥的半影衰减百分比。在0和1之间的值。默认为0。
   * decay - 沿着光照距离的衰减量。
   */
  const spotLight = new THREE.SpotLight(0xffffff, 1.2, 150, 120)
  spotLight.position.set(-40, 60, -10)
  spotLight.castShadow = true

  scene.add(spotLight)
  
  // 将渲染器的输出添加到html元素
  document.getElementById('webgl-output').appendChild(renderer.domElement)

  // 添加控制
  const controls =  new function () {
    this.rotationSpeed = 0.02
    this.numberOfObjects = scene.children.length

    // 添加立方体
    this.addCube = function () {
      const cubeSize = Math.ceil(Math.random() * 3) 
      const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
      const cubeMaterial = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
      })
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      cube.castShadow = true
      cube.name = 'cube-' + this.numberOfObjects.length

      cube.position.set(
        -30 + Math.round(Math.random() * planeGeometry.parameters.width),
        Math.round(Math.random() * 5),
        -20 + Math.round(Math.random() * planeGeometry.parameters.height)
      )

      scene.add(cube)
      this.numberOfObjects = scene.children.length
    }

    // 移除立方体
    this.removeCube = function () {
      const children = scene.children
      const lastObject = children[children.length - 1]
      if (lastObject instanceof THREE.Mesh) {
        scene.remove(lastObject)
        this.numberOfObjects = scene.children.length
      }
    }

    // 打印场景信息
    this.outputObjects = function () {
      console.log(scene.children)
    }

  }
  const gui = new GUI()
  gui.add(controls, 'rotationSpeed', 0, 0.5)
  gui.add(controls, 'addCube')
  gui.add(controls, 'removeCube')
  gui.add(controls, 'outputObjects')
  gui.add(controls, 'numberOfObjects').listen()

  const trackballControls = initTrackballControls(camera, renderer)
  // 该对象用于跟踪时间
  const clock = new THREE.Clock()

  // 渲染场景
  renderScene()
  function renderScene () {
    // 利用鼠标移动摄像机
    trackballControls.update(clock.getDelta())
    stats.update()

    scene.traverse(function (e) {
      if (e instanceof THREE.Mesh && e !== plane) {
        e.rotation.x += controls.rotationSpeed
        e.rotation.y += controls.rotationSpeed
        e.rotation.z += controls.rotationSpeed
      }
    })
    
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