import * as THREE from './build/three.module.js'
import { TWEEN } from './examples/jsm/libs/tween.module.min.js'
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from './examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from './examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from './examples/jsm/postprocessing/OutlinePass.js'
import { FXAAShader } from './examples/jsm/shaders/FXAAShader.js'
import { ShaderPass } from './examples/jsm/postprocessing/ShaderPass.js'

const width = window.innerWidth
const height = window.innerHeight

const raycaster = new THREE.Raycaster(); // 光线投射用于进行鼠标拾取
const mouse = new THREE.Vector3(); // 三维向量（位于三维空间中的点）

let scene,
    camera,
    renderer,
    controls,
    equipment,
    compose, // 效果合成器
    renderPass,
    outlinePass

// 初始化场景、相机、渲染器
function init () {
  scene = new THREE.Scene()
  
  // 
  scene.background = new THREE.Color(25, 0, 69)

    // 透视相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(-7, 7, -7)

    // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // 开启阴影
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);
}

// 加载模型
function loadingModel () {
  const loader = new GLTFLoader().setPath('model/')
  loader.load('a-dismantling.glb', (gltf) => {
    equipment = gltf.scene
    scene.add( gltf.scene)
  }, xhr => {
    // 模型加载进度回调
    const progress = ( xhr.loaded / xhr.total * 100 ).toFixed(2) + '%'
    const html = tip.innerHTML
    tip.innerHTML = html + progress
    if (( xhr.loaded / xhr.total * 100 ) === 100) {
      tip.style.display = 'none'
    }
  })
}

// 添加轨道控制器
function addControls () {
  controls = new OrbitControls(camera, renderer.domElement)
  document.body.appendChild(renderer.domElement)
}

// 添加光源
function addSpotLight () {
  const arr = [
    [0, 15, 0],
    [-1, 3, 10],
    [-6, 9, -1]
  ]

  // 半球光 - 光源直接放置于场景之上，光照颜色从天空光线颜色颜色渐变到地面光线颜色
  const light = new THREE.HemisphereLight(0xffffff, 0xcccccc)
  scene.add(light)
  
  arr.forEach(([x, y, z]) => {
    // 点光源
    const spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(x, y, z)
    scene.add(spotLight)
  })
}

function render () {
  renderer.render(scene, camera)
  compose && compose.render();
  requestAnimationFrame(render)
  controls.update()
  TWEEN.update()
}

// 鼠标移入设备模型交互事件
function onMouseMove (event) {
  mouse.x = (event.clientX / width) * 2 - 1;
  mouse.y = -(event.clientY / height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(equipment.children, true);
  
  if (intersects.length <= 0) {
    if (outlinePass) {
      outlinePass.selectedObjects = []
    }
    return false
  }
  const object = intersects[0].object;
  if (object.isMesh) {
    // object.material.color.set(0xff0000)
    // 注意传入的是一个数组
    outline([object])
  }
}

// 选中模型外关高亮
function outline (obj, color = 0x15c5e8) {
  console.log(obj[0].name);
  compose = new EffectComposer(renderer);
  renderPass = new RenderPass(scene, camera);
  compose.addPass(renderPass);

  outlinePass = new OutlinePass(
    new THREE.Vector2(width, height),
    scene,
    camera,
    obj
  );
  outlinePass.renderToScreen = true;
  outlinePass.selectedObjects = obj;
  const params = {
    edgeStrength: 10,
    edgeGlow: 0,
    edgeThickness: 50.0,
    pulsePeriod: 1,
    usePatternTexture: false
  };
  outlinePass.edgeStrength = params.edgeStrength;
  outlinePass.edgeGlow = params.edgeGlow;
  outlinePass.visibleEdgeColor.set(color);
  outlinePass.hiddenEdgeColor.set(color);
  compose.addPass(outlinePass);
}

// 模型拆解
function handleBtn1 () {
  console.log(scene);
  move(scene.getObjectByName("Object_7"),{x:-5});
  move(scene.getObjectByName("Object_18"),{x:-5});

  move(scene.getObjectByName("Object_10"),{x:5});
  move(scene.getObjectByName("Object_11"),{x:5});
  move(scene.getObjectByName("Object_17"),{x:5});

  move(scene.getObjectByName("Object_27"),{z:5});
  move(scene.getObjectByName("Object_29"),{z:5});

  move(scene.getObjectByName("Object_14"),{z:-5});
  move(scene.getObjectByName("Object_16"),{z:-5});

  move(scene.getObjectByName("Object_28"),{y:2});
}

// 模型还原
function handleBtn2 () {
  move(scene.getObjectByName("Object_7"),{x:0});
  move(scene.getObjectByName("Object_18"),{x:0});

  move(scene.getObjectByName("Object_10"),{x:0});
  move(scene.getObjectByName("Object_11"),{x:0});
  move(scene.getObjectByName("Object_17"),{x:0});

  move(scene.getObjectByName("Object_27"),{z:0});
  move(scene.getObjectByName("Object_29"),{z:0});

  move(scene.getObjectByName("Object_14"),{z:0});
  move(scene.getObjectByName("Object_16"),{z:0});

  move(scene.getObjectByName("Object_28"),{y:0});
}

// 移动函数
function move(obj, position) {
  new TWEEN.Tween(obj.position)
    .to(position, 1000)
    .onUpdate(function (val) {
      obj.position.set(val.x || 0, val.y || 0, val.z || 0);
    })
    .start();
}

init()
loadingModel()
addControls()
addSpotLight()
render()

document.addEventListener('mousemove', onMouseMove)
btn1.addEventListener('click', handleBtn1)
btn2.addEventListener('click', handleBtn2)