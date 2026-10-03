import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "../../lib/gsap";

export type NotebookSceneOptions = {
  container: HTMLDivElement;
  screenTextureUrl: string;
  screenAspect: number;
  reducedMotion: boolean;
};

// ── Paleta ──────────────────────────────────────────────────────────
const ALU = 0xd3d5db;
const BEZEL = 0x09090b;
const TRACKPAD = 0xe6e7ec;
const ACCENT = 0x8b93ff;
const EMERALD = 0x10b981;

// ── Dimensões (unidades arbitrárias, proporção ~macbook) ───────────
const W = 3.4;
const BASE_DEPTH = 2.1;
const BASE_HEIGHT = 0.16;
const LID_THICKNESS = 0.09;
const LID_HEIGHT = BASE_DEPTH;
const SIDE_MARGIN = 0.075;
const BOTTOM_MARGIN = 0.1;

const OPEN_ANGLE = -1.832; // ~-105°, inclinação natural de notebook aberto

function makeKeyboardTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 416;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#101116";
  ctx.fillRect(0, 0, w, h);

  const cols = 15;
  const rows = 5;
  const pad = 14;
  const gap = 7;
  const cellW = (w - pad * 2 - gap * (cols - 1)) / cols;
  const cellH = (h - pad * 2 - gap * (rows - 1)) / rows;

  const drawKey = (x: number, y: number, kw: number, kh: number) => {
    const r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + kw, y, x + kw, y + kh, r);
    ctx.arcTo(x + kw, y + kh, x, y + kh, r);
    ctx.arcTo(x, y + kh, x, y, r);
    ctx.arcTo(x, y, x + kw, y, r);
    ctx.closePath();

    const grad = ctx.createLinearGradient(x, y, x, y + kh);
    grad.addColorStop(0, "#2c2e37");
    grad.addColorStop(1, "#1d1e25");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  for (let row = 0; row < rows; row++) {
    const y = pad + row * (cellH + gap);
    if (row === rows - 1) {
      // Linha inferior: espaçadeira larga ao centro
      drawKey(pad, y, cellW * 2.6, cellH);
      drawKey(pad + (cellW * 2.6 + gap), y, cellW * 6.2, cellH);
      drawKey(pad + (cellW * 2.6 + gap) + (cellW * 6.2 + gap), y, cellW * 2.6, cellH);
      continue;
    }
    for (let col = 0; col < cols; col++) {
      const x = pad + col * (cellW + gap);
      drawKey(x, y, cellW, cellH);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class NotebookScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private root = new THREE.Group();
  private floatGroup = new THREE.Group();
  private hinge = new THREE.Group();
  private screenMaterial: THREE.MeshStandardMaterial;
  private texture: THREE.Texture | null = null;
  private keyboardTexture: THREE.CanvasTexture | null = null;
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
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 1.08, 6.1);
    this.camera.lookAt(0, 1.02, 0);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    pmrem.dispose();

    this.buildLights();
    this.root.add(this.floatGroup);
    this.screenMaterial = this.buildLaptop();
    this.loadScreenTexture(opts.screenTextureUrl);

    this.scene.add(this.root);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    this.handleResize();

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0]?.isIntersecting ?? true;
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
    const hemi = new THREE.HemisphereLight(0x8890ff, 0x05050f, 0.45);
    const key = new THREE.DirectionalLight(0xfff7ec, 1.5);
    key.position.set(2.6, 4.2, 3.4);
    const fill = new THREE.DirectionalLight(0xaeb6ff, 0.4);
    fill.position.set(-2.2, 1.6, 2.8);
    const rim = new THREE.DirectionalLight(ACCENT, 1.2);
    rim.position.set(-3.2, 2.4, -2.4);
    const kiss = new THREE.PointLight(EMERALD, 0.7, 6, 2);
    kiss.position.set(0.6, -0.1, 2.2);

    this.scene.add(hemi, key, fill, rim, kiss);
  }

  private buildLaptop(): THREE.MeshStandardMaterial {
    const alu = new THREE.MeshPhysicalMaterial({
      color: ALU,
      metalness: 0.9,
      roughness: 0.28,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.1,
    });
    const bezel = new THREE.MeshStandardMaterial({ color: BEZEL, roughness: 0.8, metalness: 0.15, envMapIntensity: 0.4 });
    this.keyboardTexture = makeKeyboardTexture();
    const deck = new THREE.MeshStandardMaterial({
      map: this.keyboardTexture,
      roughness: 0.75,
      metalness: 0.15,
      envMapIntensity: 0.35,
    });
    const trackpad = new THREE.MeshPhysicalMaterial({
      color: TRACKPAD,
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1,
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
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffffff,
      emissiveIntensity: 1.08,
      roughness: 0.42,
      metalness: 0,
      envMapIntensity: 0.25,
    });
    const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMaterial);
    screenPlane.rotation.x = Math.PI / 2;
    screenPlane.position.set(0, -0.011, BOTTOM_MARGIN + screenH / 2);
    this.hinge.add(screenPlane);

    // Webcam
    const webcam = new THREE.Mesh(
      new THREE.CircleGeometry(0.018, 16),
      new THREE.MeshBasicMaterial({ color: 0x2c2d33 }),
    );
    webcam.rotation.x = Math.PI / 2;
    webcam.position.set(0, -0.0095, LID_HEIGHT - 0.045);
    this.hinge.add(webcam);

    return screenMaterial;
  }

  private loadScreenTexture(url: string) {
    new THREE.TextureLoader().load(url, (tex) => {
      if (this.disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      this.texture = tex;
      this.screenMaterial.emissiveMap = tex;
      this.screenMaterial.needsUpdate = true;
    });
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
    tl.to(this.root.rotation, { y: -0.32, duration: 1.7, ease: "power3.out" }, 0)
      .to(this.root.position, { y: 0, duration: 1.1, ease: "power2.out" }, 0)
      .to(this.root.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: "power2.out" }, 0)
      .to(this.hinge.rotation, { x: OPEN_ANGLE, duration: 1.05, ease: "power2.inOut" }, 0.65);
  }

  private handleResize() {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
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
    this.texture?.dispose();
    this.keyboardTexture?.dispose();
    this.envTexture?.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
