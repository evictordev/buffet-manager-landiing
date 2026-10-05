import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "../../lib/gsap";

export type NotebookSceneOptions = {
  container: HTMLDivElement;
  screenVideoUrl: string;
  screenAspect: number;
  reducedMotion: boolean;
};

// ── Paleta ──────────────────────────────────────────────────────────
const ALU = 0xd4d6da;
const BEZEL = 0x050506;
const TRACKPAD = 0xd0d2d7;

// ── Dimensões (unidades arbitrárias, proporção ~macbook) ───────────
const W = 3.4;
const BASE_DEPTH = 2.1;
const BASE_HEIGHT = 0.16;
const LID_THICKNESS = 0.09;
const LID_HEIGHT = BASE_DEPTH;
const SIDE_MARGIN = 0.075;
const BOTTOM_MARGIN = 0.1;

// O canvas é maior que o contêiner para que o notebook não seja cortado ao girar/abrir.
const OVERSCAN_X = 1.5;
const OVERSCAN_Y = 1.5;
const BASE_FOV = 29;

const OPEN_ANGLE = -1.832; // ~-105°, inclinação natural de notebook aberto

export class NotebookScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private root = new THREE.Group();
  private floatGroup = new THREE.Group();
  private hinge = new THREE.Group();
  private screenMaterial: THREE.MeshBasicMaterial;
  private screenPlane: THREE.Mesh | null = null;
  private video: HTMLVideoElement | null = null;
  private videoTexture: THREE.VideoTexture | null = null;
  private envTexture: THREE.Texture | null = null;

  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private raf = 0;
  private isVisible = true;
  private disposed = false;

  private reducedMotion: boolean;
  private screenAspect: number;
  private pointer = { x: 0, y: 0 };
  private idleT = 0;

  private onPointerMove = (event: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    this.pointer.x = Math.max(-1, Math.min(1, x));
    this.pointer.y = Math.max(-1, Math.min(1, y));
  };

  private onPointerLeave = () => {
    this.pointer.x = 0;
    this.pointer.y = 0;
  };

  constructor(opts: NotebookSceneOptions) {
    this.container = opts.container;
    this.reducedMotion = opts.reducedMotion;
    this.screenAspect = opts.screenAspect;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cssText = `position:absolute;left:50%;top:50%;width:${OVERSCAN_X * 100}%;height:${OVERSCAN_Y * 100}%;transform:translate(-50%,-50%);display:block;pointer-events:none;`;

    this.camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 100);
    this.camera.position.set(0, 0.98, 5.35);
    this.camera.lookAt(0, 0.92, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 1.0;
    pmrem.dispose();

    this.buildLights();
    this.root.add(this.floatGroup);
    this.screenMaterial = this.buildLaptop();
    this.loadScreenVideo(opts.screenVideoUrl);

    this.scene.add(this.root);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    this.handleResize();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0]?.isIntersecting ?? true;
        if (!this.reducedMotion && this.video) {
          if (this.isVisible) this.video.play().catch(() => {});
          else this.video.pause();
        }
      },
      { threshold: 0.05 },
    );
    this.intersectionObserver.observe(this.container);

    if (!this.reducedMotion) {
      this.container.addEventListener("pointermove", this.onPointerMove);
      this.container.addEventListener("pointerleave", this.onPointerLeave);
    }

    this.playIntro();
    this.loop();
  }

  private buildLights() {
    const hemi = new THREE.HemisphereLight(0xe3e6ec, 0x1c1e24, 0.3);
    const key = new THREE.DirectionalLight(0xfff8ef, 2.1);
    key.position.set(2.6, 4.2, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.00025;
    key.shadow.radius = 5;
    const fill = new THREE.DirectionalLight(0xdce1eb, 0.28);
    fill.position.set(-2.2, 1.6, 2.8);
    const rim = new THREE.DirectionalLight(0xc6ccd8, 0.3);
    rim.position.set(-3.2, 2.4, -2.4);
    this.scene.add(hemi, key, fill, rim);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.3 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.095;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private buildLaptop(): THREE.MeshBasicMaterial {
    const alu = new THREE.MeshPhysicalMaterial({
      color: ALU,
      metalness: 1.0,
      roughness: 0.3,
      clearcoat: 0.25,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.15,
    });
    const bezel = new THREE.MeshStandardMaterial({ color: BEZEL, roughness: 0.35, metalness: 0.2, envMapIntensity: 0.6 });
    const deck = new THREE.MeshStandardMaterial({
      color: 0x1c1d21,
      roughness: 0.7,
      metalness: 0.3,
      envMapIntensity: 0.35,
    });
    const keycap = new THREE.MeshStandardMaterial({ color: 0x0e0f12, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.5 });
    const trackpad = new THREE.MeshPhysicalMaterial({
      color: TRACKPAD,
      roughness: 0.3,
      metalness: 1.0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.1,
    });

    // ── Base ──────────────────────────────────────────────────────
    const base = new THREE.Mesh(new RoundedBoxGeometry(W, BASE_HEIGHT, BASE_DEPTH, 3, 0.055), alu);
    base.position.y = 0;
    this.floatGroup.add(base);

    const keyboardDeck = new THREE.Mesh(
      new RoundedBoxGeometry(W - 0.3, 0.024, BASE_DEPTH * 0.6, 2, 0.012),
      deck,
    );
    keyboardDeck.position.set(0, BASE_HEIGHT / 2 + 0.013, -BASE_DEPTH * 0.16);
    this.floatGroup.add(keyboardDeck);

    const rows = 4;
    const cols = 14;
    const keyW = 0.17;
    const keyD = 0.17;
    const gapX = 0.035;
    const gapZ = 0.045;
    const startX = -((cols * keyW + (cols - 1) * gapX) / 2);
    const startZ = -0.69;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cap = new THREE.Mesh(new RoundedBoxGeometry(keyW, 0.018, keyD, 2, 0.012), keycap);
        cap.position.set(startX + col * (keyW + gapX), BASE_HEIGHT / 2 + 0.031, startZ + row * (keyD + gapZ));
        cap.castShadow = true;
        this.floatGroup.add(cap);
      }
    }

    const trackpadMesh = new THREE.Mesh(
      new RoundedBoxGeometry(W * 0.3, 0.012, BASE_DEPTH * 0.24, 2, 0.02),
      trackpad,
    );
    trackpadMesh.position.set(0, BASE_HEIGHT / 2 + 0.021, BASE_DEPTH * 0.3);
    this.floatGroup.add(trackpadMesh);

    // ── Dobradiça + tampa ────────────────────────────────────────
    this.hinge.position.set(0, BASE_HEIGHT / 2, -BASE_DEPTH / 2);
    this.hinge.rotation.x = 0;
    this.floatGroup.add(this.hinge);

    const lidShell = new THREE.Mesh(new RoundedBoxGeometry(W, LID_THICKNESS, LID_HEIGHT, 3, 0.045), alu);
    lidShell.position.set(0, LID_THICKNESS / 2, LID_HEIGHT / 2);
    this.hinge.add(lidShell);

    const bezelPanel = new THREE.Mesh(new THREE.BoxGeometry(W - 0.05, 0.01, LID_HEIGHT - 0.05), bezel);
    bezelPanel.position.set(0, -0.004, LID_HEIGHT / 2);
    this.hinge.add(bezelPanel);

    const screenW = W - SIDE_MARGIN * 2;
    const screenH = screenW / this.screenAspect;
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMaterial);
    screenPlane.rotation.x = Math.PI / 2;
    screenPlane.position.set(0, -0.011, BOTTOM_MARGIN + screenH / 2);
    this.hinge.add(screenPlane);
    this.screenPlane = screenPlane;

    // Webcam
    const webcam = new THREE.Mesh(
      new THREE.CircleGeometry(0.018, 16),
      new THREE.MeshBasicMaterial({ color: 0x2c2d33 }),
    );
    webcam.rotation.x = Math.PI / 2;
    webcam.position.set(0, -0.0095, LID_HEIGHT - 0.045);
    this.hinge.add(webcam);

    this.floatGroup.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return screenMaterial;
  }

  private loadScreenVideo(url: string) {
    const video = document.createElement("video");
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    this.video = video;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.videoTexture = texture;
    this.screenMaterial.map = texture;
    this.screenMaterial.needsUpdate = true;

    video.addEventListener(
      "loadedmetadata",
      () => {
        if (this.disposed || !video.videoWidth || !video.videoHeight) return;
        this.resizeScreenPlane(video.videoWidth / video.videoHeight);
        if (this.reducedMotion) {
          // Decodifica um quadro para exibir uma imagem estática, sem iniciar a reprodução.
          video.currentTime = Math.min(0.1, video.duration || 0.1);
        }
      },
      { once: true },
    );

    if (!this.reducedMotion) {
      video.play().catch(() => {});
    }
  }

  private resizeScreenPlane(aspect: number) {
    if (!this.screenPlane) return;
    const screenW = W - SIDE_MARGIN * 2;
    const screenH = screenW / aspect;
    this.screenPlane.geometry.dispose();
    this.screenPlane.geometry = new THREE.PlaneGeometry(screenW, screenH);
    this.screenPlane.position.z = BOTTOM_MARGIN + screenH / 2;
  }

  private playIntro() {
    if (this.reducedMotion) {
      this.hinge.rotation.x = OPEN_ANGLE;
      this.root.rotation.y = -0.32;
      return;
    }

    this.root.rotation.y = Math.PI * 2.6;
    this.hinge.rotation.x = 0;
    this.root.position.y = -0.25;
    this.root.scale.setScalar(0.92);

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(this.root.rotation, { y: -0.32, duration: 3.4, ease: "power3.out" }, 0)
      .to(this.root.position, { y: 0, duration: 2.2, ease: "power2.out" }, 0)
      .to(this.root.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: "power2.out" }, 0)
      .to(this.hinge.rotation, { x: OPEN_ANGLE, duration: 2.6, ease: "power2.inOut" }, 1.3);
  }

  private handleResize() {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(width * OVERSCAN_X, height * OVERSCAN_Y, false);
    this.camera.aspect = (width * OVERSCAN_X) / (height * OVERSCAN_Y);
    // Mantém o tamanho aparente do notebook igual ao do contêiner, só ampliando o campo de visão.
    this.camera.fov =
      (2 * Math.atan(Math.tan((BASE_FOV * Math.PI) / 360) * OVERSCAN_Y) * 180) / Math.PI;
    this.camera.updateProjectionMatrix();
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.isVisible) return;

    if (!this.reducedMotion) {
      this.idleT += 0.008;
      this.floatGroup.position.y = Math.sin(this.idleT) * 0.035;

      const targetTiltZ = this.pointer.x * 0.045;
      const targetTiltX = this.pointer.y * 0.022;
      this.floatGroup.rotation.z += (targetTiltZ - this.floatGroup.rotation.z) * 0.05;
      this.floatGroup.rotation.x += (targetTiltX - this.floatGroup.rotation.x) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.container.removeEventListener("pointermove", this.onPointerMove);
    this.container.removeEventListener("pointerleave", this.onPointerLeave);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach((m) => m.dispose());
      }
    });
    this.videoTexture?.dispose();
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute("src");
      this.video.load();
    }
    this.envTexture?.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
