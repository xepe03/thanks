import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import html2canvas from 'html2canvas';
import './style.css';


const scene = new THREE.Scene();

// 카메라
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 2.0, 3.5);
camera.lookAt(0, 0, 0);

// 렌더러
const renderer = new THREE.WebGLRenderer({ antialias: true ,preserveDrawingBuffer: true  });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFAE3DB);
document.body.appendChild(renderer.domElement);

// 조명
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

// 컨트롤
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 모델 로드
const loader = new GLTFLoader();
let mixer;

loader.load(import.meta.env.BASE_URL + 'model.glb', (gltf) => {
  scene.add(gltf.scene);

  if (gltf.animations.length) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.timeScale = 0.6;
      action.play();

      const endTime = (clip.duration / 0.6) * 1000;

      setTimeout(() => {
        // 카메라 줌인
        gsap.to(camera.position, {
          x: 0,
          y: 2,
          z: 5,
          duration: 1.5,
          ease: "power2.inOut"
        });

        // 팝업 카드 보여주기
        setTimeout(() => {
          const popup = document.getElementById('popup-card');
          if (popup) popup.classList.add('show');
        }, 800);

      }, endTime);
    });
  }
});

// 애니 루프
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const target = document.getElementById('popup-card');
      if (!target) return;
      html2canvas(target).then(canvas => {
        const link = document.createElement('a');
        link.download = 'letter.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  }

  const closeBtn = document.getElementById('close-popup');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const popup = document.getElementById('popup-card');
      if (popup) popup.classList.remove('show');
    });
  }
});
