import * as THREE from "three";

export type GlassPose = { x: number; y: number };
export type GlassRenderer = {
  resize: (width: number, height: number, devicePixelRatio: number) => void;
  render: (pose: GlassPose) => void;
  dispose: () => void;
};

/** Original geometry and studio lighting. No models, HDRs, or textures are fetched. */
export function createGlassRenderer(canvas: HTMLCanvasElement): GlassRenderer | null {
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (!context) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.transmissionResolutionScale = 0.55;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.z = 7.2;
  const resources: { dispose: () => void }[] = [];
  const own = <T extends { dispose: () => void }>(resource: T): T => {
    resources.push(resource);
    return resource;
  };
  const dispose = () => {
    scene.clear();
    for (const resource of resources.splice(0).reverse()) resource.dispose();
    renderer.dispose();
  };

  try {
    // A miniature equirectangular studio gives the glass readable highlights.
    const studio = document.createElement("canvas");
    studio.width = 512;
    studio.height = 256;
    const light = studio.getContext("2d");
    if (!light) { dispose(); return null; }
    const wash = light.createLinearGradient(0, 0, 512, 256);
    wash.addColorStop(0, "#11162d");
    wash.addColorStop(0.35, "#667590");
    wash.addColorStop(0.65, "#333450");
    wash.addColorStop(1, "#17152e");
    light.fillStyle = wash;
    light.fillRect(0, 0, 512, 256);
    light.fillStyle = "#ffffff";
    light.fillRect(72, 28, 54, 142);
    light.fillRect(320, 8, 92, 72);
    light.fillStyle = "#bcefff";
    light.fillRect(438, 70, 26, 128);
    const environmentSource = own(new THREE.CanvasTexture(studio));
    environmentSource.mapping = THREE.EquirectangularReflectionMapping;
    environmentSource.colorSpace = THREE.SRGBColorSpace;
    const pmrem = own(new THREE.PMREMGenerator(renderer));
    const environment = own(pmrem.fromEquirectangular(environmentSource));
    scene.environment = environment.texture;

    // Transmission refracts this original painted backdrop, never page text.
    const backdrop = document.createElement("canvas");
    backdrop.width = 512;
    backdrop.height = 512;
    const paint = backdrop.getContext("2d")!;
    const gradient = paint.createLinearGradient(0, 512, 512, 0);
    gradient.addColorStop(0, "#d8eafb");
    gradient.addColorStop(0.5, "#f3edf9");
    gradient.addColorStop(1, "#e5f4f4");
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 512, 512);
    const halo = paint.createRadialGradient(140, 205, 0, 140, 205, 250);
    halo.addColorStop(0, "rgba(166, 147, 243, 0.55)");
    halo.addColorStop(1, "rgba(166, 147, 243, 0)");
    paint.fillStyle = halo;
    paint.fillRect(0, 0, 512, 512);
    const backdropTexture = own(new THREE.CanvasTexture(backdrop));
    backdropTexture.colorSpace = THREE.SRGBColorSpace;
    const backdropGeometry = own(new THREE.PlaneGeometry(12, 12));
    const backdropMaterial = own(new THREE.MeshBasicMaterial({ map: backdropTexture, toneMapped: false }));
    const backdropMesh = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdropMesh.position.z = -2.5;
    scene.add(backdropMesh);

    const sculpture = new THREE.Group();
    const geometry = own(new THREE.TorusKnotGeometry(1.12, 0.3, 160, 24, 2, 3));
    const material = own(new THREE.MeshPhysicalMaterial({
      color: "#e8e2ff",
      metalness: 0,
      roughness: 0.055,
      transmission: 0.97,
      thickness: 1.25,
      ior: 1.45,
      attenuationColor: new THREE.Color("#849fd4"),
      attenuationDistance: 2.2,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      dispersion: 0.11,
      envMapIntensity: 1.45,
    }));
    sculpture.add(new THREE.Mesh(geometry, material));
    sculpture.scale.setScalar(0.92);
    scene.add(sculpture);
    const key = new THREE.DirectionalLight("#ffffff", 2);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const edge = new THREE.DirectionalLight("#a9e5ff", 1.5);
    edge.position.set(4, -2, 3);
    scene.add(edge, new THREE.AmbientLight("#d8dcff", 0.3));

    let disposed = false;
    return {
      resize(width, height, dpr) {
        if (disposed) return;
        // Bound both the main canvas and the additional transmission pass.
        const ratio = Math.min(1.5, dpr, Math.sqrt(900_000 / Math.max(1, width * height)));
        renderer.setPixelRatio(ratio);
        renderer.setSize(Math.max(1, width), Math.max(1, height), false);
        camera.aspect = width / Math.max(1, height);
        camera.position.z = camera.aspect < 1 ? 7.2 / camera.aspect : 7.2;
        camera.updateProjectionMatrix();
      },
      render(pose) {
        if (disposed) return;
        sculpture.rotation.set(0.35 + pose.y * 0.34, -0.4 + pose.x * 0.62, -0.24 - pose.x * 0.1);
        renderer.render(scene, camera);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        dispose();
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
