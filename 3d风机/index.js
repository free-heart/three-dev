// 引入需要用到的文件
import * as THREE from './build/three.module.js'
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js'
import { TWEEN } from './examples/jsm/libs/tween.module.min.js'
import { EffectComposer } from './examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from './examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from './examples/jsm/postprocessing/OutlinePass.js'

const width = window.innerWidth
const height = window.innerHeight

const raycaster = new THREE.Raycaster(); // 光线投射用于进行鼠标拾取
const mouse = new THREE.Vector3(); // 三维向量（位于三维空间中的点）
const clock = new THREE.Clock();

// 定义变量
let wholeGroup = new THREE.Group() // 保存数据集，用于模型交互
let scene, // 场景
    camera, // 相机
    renderer, // 渲染器
    controls, // 控制器
    matrixTurbine, // 保存模型信息，用于动画效果
    equipment, // 保存设备模型信息，用于页面点击交互
    compose, // 效果合成器
    renderPass,
    outlinePass

// 获取 dom
const equipmentLabel = document.querySelector('.equipmentLabel')
const cn = document.querySelector('.cn')
const en = document.querySelector('.en')
const ul = document.querySelector('.ul')

let mixers = new Map()

const labelData ={
  polySurface152: {
      cn: "变桨系统",
      en: "Variable-Pitch System",
      list: [
          {
              name: "轴箱1变桨位置",
              value: "0.03",
              unit: null
          },
          {
              name: "轴箱2变桨位置",
              value: "0.01",
              unit: null
          },
          {
              name: "轴箱3变桨位置",
              value: "0.02",
              unit: null
          }
      ]
  },
  polySurface258: {
      cn: "主轴",
      en: "Principal Axis",
      list: [
          {
              name: "额定电压",
              value: "110",
              unit: "v"
          },
          {
              name: "额定电流",
              value: "101",
              unit: "A"
          },
          {
              name: "额定功率",
              value: "2",
              unit: "kw"
          },
          {
              name: "功率频率",
              value: "100",
              unit: "Hz"
          }
      ]
  },
  polySurface230: {
      cn: "齿轮箱",
      en: "Gear Box",
      list: [
          {
              name: "油槽温度",
              value: "51",
              unit: "°C"
          },
          {
              name: "入口轴温度",
              value: "41",
              unit: "°C"
          },
          {
              name: "输入轴温度",
              value: "66",
              unit: "°C"
          },
          {
              name: "输出轴温度",
              value: "60",
              unit: "°C"
          }
      ]
  },
  pasted__pCube97: {
      cn: "风冷装置",
      en: "Air Cooling System",
      list: [
          {
              name: "风冷温度",
              value: "7",
              unit: "°C"
          },
          {
              name: "风冷功率",
              value: "300",
              unit: "kWh"
          },
          {
              name: "功率",
              value: "200",
              unit: "kw"
          },
          {
              name: "温度",
              value: "24",
              unit: "°C"
          }
      ]
  },
  pasted__extrudedSurface2: {
      cn: "油冷装置",
      en: "oil Cooling System",
      list: [
          {
              name: "额定功率",
              value: "7",
              unit: "kw"
          },
          {
              name: "油箱容量",
              value: "300",
              unit: "L"
          },
          {
              name: "机器油耗",
              value: "200",
              unit: "G/KW.H"
          },
          {
              name: "工作时间",
              value: "24",
              unit: "H"
          }
      ]
  },
  pasted__extrudedSurface8: {
      cn: "发电机",
      en: "Generator",
      list: [
          {
              name: "轴承A温度",
              value: "33",
              unit: "°C"
          },
          {
              name: "轴承B温度",
              value: "34",
              unit: "°C"
          },
          {
              name: "叶轮转速",
              value: "8",
              unit: "RPM"
          },
          {
              name: "转速",
              value: "1322",
              unit: "RPM"
          }
      ]
  }
}

// 初始化场景、相机、渲染器
function init () {
  scene = new THREE.Scene()

  // 透视相机
  camera = new THREE.PerspectiveCamera( 20, width / height, 0.1, 1000 );
  camera.position.set(-2, 2, 3);

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // 开启阴影
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);

  scene.add(wholeGroup)
}

// 加载模型
function loadingModel () {
  // 模型文件路径
  const loader = new GLTFLoader().setPath('model/')

  loader.load('untitled1.glb', (gltf) => {
    // 保存模型信息，用于动画效果
    matrixTurbine = gltf

    const mesh = gltf.scene;
    const metal = mesh.getObjectByName("颜色材质");
    // 改变模型材质外关
    metal.visible = false
    const scale = 0.0003 * 1;
    mesh.scale.set(scale, scale, scale);
    mesh.rotateY(Math.PI / 10);
    mesh.position.set(0, -2.4, 0);
    
    wholeGroup.add(mesh);
    changeAnimation(mesh, "Anim_0");
  }, xhr => {
    // 模型加载进度回调
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    if (( xhr.loaded / xhr.total * 100 ) === 100) {
      tip.style.display = 'none'
    }
  })

  loader.load('equipment.glb', (gltf) => {
    const mesh = gltf.scene;
    // 保存模型信息，用于页面点击交互
    equipment = mesh
    const scale = 0.0003 * 1;
    mesh.scale.set(scale, scale, scale);
    mesh.rotateY(Math.PI / 10);
    mesh.position.set(0, -2.4, 0);

    wholeGroup.add(mesh);
  }, xhr => {
    // 模型加载进度回调
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    // if (( xhr.loaded / xhr.total * 100 ) === 100) {
    //   tip.style.display = 'none'
    // }
  })
}

// 添加和改变风机旋转动画
function changeAnimation(mesh, animationName) {
  const animations = matrixTurbine.animations;
  const mixer = new THREE.AnimationMixer(mesh);
  const clip = THREE.AnimationClip.findByName(
    animations,
    animationName
  );
  const key = "AA";
  if (clip) {
      const action = mixer.clipAction(clip);
      action.play();
      mixers.set(key, mixer);
  } else {
      mixers.delete(key);
  }
}

// 添加光源
function addSpotLight () {
  const arr = [
    [100, 100, 100],
    [-100, 100, 100],
    [100, -100, 100]
  ];
  arr.forEach(_ => {
    // 平行光
    const spotLight = new THREE.DirectionalLight(0xffffff, 3)
    // 如果设置为 true 该平行光会产生动态阴影。 警告: 这样做的代价比较高而且需要一直调整到阴影看起来正确.
    // spotLight.castShadow = true;
    scene.add(spotLight);
  });
}

// 添加轨道控制器
function addControls () {
  controls = new OrbitControls( camera, renderer.domElement );
  document.body.appendChild(renderer.domElement)
}

// 渲染
function render() {
  renderer.render(scene, camera)
  compose && compose.render();
  requestAnimationFrame(render)
  controls.update();

  const mixerUpdateDelta = clock.getDelta();
  mixers.forEach(mixer => {
    mixer.update(mixerUpdateDelta);
  });

  TWEEN.update();
}

// 设备模型点击交互事件
function onPointerClick (event) {
  equipmentLabel.className = 'equipmentLabel hide'

  mouse.x = (event.clientX / width) * 2 - 1;
  mouse.y = -(event.clientY / height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(equipment.children, true);
  if (intersects.length <= 0) return false;
  const object = intersects[0].object;
  if (object.isMesh) {
    // object.material.color.set(0xff0000);

    // 注意传入的是一个数组
    outline([object]);
    renderLabel(labelData[object.name])
    updateLabalPosition(event)
  }
}

// 选中模型外关高亮
function outline (obj, color = 0x15c5e8) {
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

// 渲染选中文本
function renderLabel (data) {
  ul.innerHTML = ''
  cn.innerHTML = data.cn
  en.innerHTML = data.en

  data.list.forEach(item => {
    const li = document.createElement('li')
    li.innerHTML = `
      <span>${item.name}:</span>
      <span>${item.value}</span>
      <span>${item.unit}</span>
    `
    ul.appendChild(li)
    equipmentLabel.className = 'equipmentLabel show'
  })
}

// 更新标签位置
function updateLabalPosition (e) {
  equipmentLabel.style.left = (e.clientX) + 'px'
  equipmentLabel.style.top = (e.clientY - 200) + 'px'
}

init()
addControls()
addSpotLight()
loadingModel()
render()

document.addEventListener('click', onPointerClick)