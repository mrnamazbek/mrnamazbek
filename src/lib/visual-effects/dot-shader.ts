export type DotEffect = "ripple";

type DotFrame = {
  elapsed: number;
  pointer: { x: number; y: number; active: boolean };
  lightTheme: boolean;
};

export interface DotRenderer {
  resize(widthCss: number, heightCss: number, dpr: number): void;
  /** Draw once and report whether ripple wakes still need animation. */
  render(frame: DotFrame): boolean;
  dispose(): void;
}

const MAX_DOTS = 4_000;
const WAKE_COUNT = 8;
const WAKE_LIFETIME = 3.2;

// All geometry uses CSS pixels, so the cursor's influence has the same shape
// on a tall phone, a wide desktop, and a high-density display.
const VERTEX_SHADER = `
  precision highp float;

  attribute vec3 aDot;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uTime;
  uniform float uDpr;
  uniform vec4 uWakes[8];
  varying float vAlpha;

  void main() {
    vec2 point = aDot.xy;
    float seed = aDot.z;
    vec2 displacement = vec2(0.0);
    float wakeEnergy = 0.0;
    for (int i = 0; i < 8; i++) {
      vec4 wake = uWakes[i];
      float age = max(uTime - wake.z, 0.0);
      vec2 fromWake = point - wake.xy;
      float distanceToWake = length(fromWake);
      float radius = 24.0 + age * 112.0;
      float width = 23.0 + age * 5.0;
      float ringDistance = (distanceToWake - radius) / width;
      float ring = exp(-ringDistance * ringDistance) * exp(-age * 1.55) * wake.w;
      displacement += fromWake / max(distanceToWake, 1.0) * ring * 15.0;
      wakeEnergy += ring;
    }
    float displacementLength = length(displacement);
    point += displacement * min(1.0, 48.0 / max(displacementLength, 1.0));

    vec2 fromPointer = point - uPointer;
    float pointerGlow = exp(-dot(fromPointer, fromPointer) / 15000.0) * uPointerActive;
    float energy = min(wakeEnergy * 0.72 + pointerGlow * 0.45, 1.0);

    vec2 clip = point / uResolution * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = (2.3 + energy * 2.7 + seed * 0.35) * uDpr;
    vAlpha = 0.20 + seed * 0.06 + energy * 0.55;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  uniform vec3 uColor;
  uniform float uThemeOpacity;
  varying float vAlpha;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float circle = 1.0 - smoothstep(0.27, 0.5, distanceFromCenter);
    gl_FragColor = vec4(uColor, circle * vAlpha * uThemeOpacity);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate the dot shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const details = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Unable to compile the dot shader: ${details ?? "unknown error"}`);
  }
  return shader;
}

function finite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function createDotRenderer(canvas: HTMLCanvasElement): DotRenderer {
  const context = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });
  if (!context || context.isContextLost()) throw new Error("WebGL is unavailable for the dot background.");
  const gl = context;

  let vertexShader: WebGLShader | null = null;
  let fragmentShader: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;

  try {
    vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = gl.createProgram();
    if (!program) throw new Error("Unable to allocate the dot shader program.");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Unable to link the dot shader: ${gl.getProgramInfoLog(program) ?? "unknown error"}`);
    }
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("Unable to allocate the dot geometry.");
  } catch (error) {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    throw error;
  }

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  const dotAttribute = gl.getAttribLocation(program, "aDot");
  const uniforms = {
    resolution: gl.getUniformLocation(program, "uResolution"),
    pointer: gl.getUniformLocation(program, "uPointer"),
    active: gl.getUniformLocation(program, "uPointerActive"),
    time: gl.getUniformLocation(program, "uTime"),
    dpr: gl.getUniformLocation(program, "uDpr"),
    wakes: gl.getUniformLocation(program, "uWakes[0]"),
    color: gl.getUniformLocation(program, "uColor"),
    themeOpacity: gl.getUniformLocation(program, "uThemeOpacity"),
  };
  if (dotAttribute < 0 || Object.values(uniforms).some((location) => location === null)) {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    throw new Error("The dot shader is missing a required input.");
  }

  const wakes = new Float32Array(WAKE_COUNT * 4);
  let wakeIndex = 0;
  let lastWakeTime = -1;
  let lastWakeX = 0;
  let lastWakeY = 0;
  let wasActive = false;
  let lastElapsed = 0;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let spacing = 30;
  let dotCount = 0;
  let disposed = false;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(dotAttribute);
  gl.vertexAttribPointer(dotAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function clearWakes() {
    wakes.fill(0);
    wakeIndex = 0;
    lastWakeTime = -1;
    wasActive = false;
  }

  function resize(widthCss: number, heightCss: number, dpr: number) {
    if (disposed || gl.isContextLost()) return;
    width = Math.max(1, finite(widthCss, 1));
    height = Math.max(1, finite(heightCss, 1));
    pixelRatio = Math.min(1.5, Math.max(0.1, finite(dpr, 1)));
    const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
    const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    gl.viewport(0, 0, pixelWidth, pixelHeight);

    // The extra edge rows keep displaced dots inside the viewport. Raising the
    // spacing on very large displays caps both vertex work and buffer memory.
    spacing = Math.max(30, Math.sqrt((width * height) / 3_600));
    let columns = Math.ceil(width / spacing) + 3;
    let rows = Math.ceil(height / spacing) + 3;
    while (columns * rows > MAX_DOTS) {
      spacing *= 1.06;
      columns = Math.ceil(width / spacing) + 3;
      rows = Math.ceil(height / spacing) + 3;
    }
    dotCount = columns * rows;
    const vertices = new Float32Array(dotCount * 3);
    const startX = (width - (columns - 1) * spacing) * 0.5;
    const startY = (height - (rows - 1) * spacing) * 0.5;
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const offset = (row * columns + column) * 3;
        vertices[offset] = startX + column * spacing;
        vertices[offset + 1] = startY + row * spacing;
        // Deterministic size variation avoids random frame flicker.
        const hash = Math.sin(column * 127.1 + row * 311.7) * 43_758.5453;
        vertices[offset + 2] = hash - Math.floor(hash);
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  function render({ elapsed, pointer, lightTheme }: DotFrame) {
    if (disposed || gl.isContextLost()) return false;
    const time = Math.max(0, finite(elapsed, 0));
    const pointerX = finite(pointer.x, width * 0.5);
    const pointerY = finite(pointer.y, height * 0.5);
    if (time < lastElapsed) clearWakes();

    for (let index = 0; index < WAKE_COUNT; index++) {
      const offset = index * 4;
      if (time - wakes[offset + 2] > WAKE_LIFETIME) wakes[offset + 3] = 0;
    }
    if (pointer.active) {
      const movement = Math.hypot(pointerX - lastWakeX, pointerY - lastWakeY);
      const moved = movement >= 14 && (time - lastWakeTime >= 0.035 || movement >= 36);
      if (!wasActive || moved) {
        const offset = wakeIndex * 4;
        wakes[offset] = pointerX;
        wakes[offset + 1] = pointerY;
        wakes[offset + 2] = time;
        wakes[offset + 3] = wasActive ? Math.min(1.3, 0.5 + movement / 65) : 0.9;
        wakeIndex = (wakeIndex + 1) % WAKE_COUNT;
        lastWakeX = pointerX;
        lastWakeY = pointerY;
        lastWakeTime = time;
      }
    }
    wasActive = pointer.active;
    lastElapsed = time;

    gl.useProgram(program);
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform2f(uniforms.pointer, pointerX, pointerY);
    gl.uniform1f(uniforms.active, pointer.active ? 1 : 0);
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.dpr, pixelRatio);
    gl.uniform4fv(uniforms.wakes, wakes);
    if (lightTheme) gl.uniform3f(uniforms.color, 58 / 255, 92 / 255, 27 / 255);
    else gl.uniform3f(uniforms.color, 208 / 255, 236 / 255, 147 / 255);
    gl.uniform1f(uniforms.themeOpacity, lightTheme ? 0.8 : 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, dotCount);
    // A stationary glow is already drawn. Only a live wake needs another frame.
    return wakes.some((value, index) => index % 4 === 3 && value > 0);
  }

  // A renderer is immediately drawable, even before the first ResizeObserver.
  resize(canvas.clientWidth || canvas.width || 1, canvas.clientHeight || canvas.height || 1, 1);

  return {
    resize,
    render,
    dispose() {
      if (disposed) return;
      disposed = true;
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Keep the canvas context reusable when the visitor toggles motion off
      // and on. Explicitly losing it would break that same-canvas lifecycle.
    },
  };
}
