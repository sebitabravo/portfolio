// GLSL del paisaje SB-OS. Los shaders usan sintaxis GLSL 1 y Three.js los
// traduce a GLSL ES 3.0; WebGL2 ya garantiza las derivadas (fwidth/dFdx).

const NOISE = /* glsl */ `
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float gradientNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 local = fract(p);
    vec2 blend = local * local * (3.0 - 2.0 * local);
    float a = dot(hash2(cell), local);
    float b = dot(hash2(cell + vec2(1.0, 0.0)), local - vec2(1.0, 0.0));
    float c = dot(hash2(cell + vec2(0.0, 1.0)), local - vec2(0.0, 1.0));
    float d = dot(hash2(cell + vec2(1.0, 1.0)), local - vec2(1.0, 1.0));
    return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
  }

  float ridged(vec2 p) {
    float total = 0.0;
    float amplitude = 0.55;
    float frequency = 1.0;
    for (int octave = 0; octave < 5; octave++) {
      float ridge = 1.0 - abs(gradientNoise(p * frequency));
      total += ridge * ridge * amplitude;
      frequency *= 2.03;
      amplitude *= 0.5;
    }
    return total;
  }

  // Valle central plano y cordilleras a los lados, como el fondo SVG.
  float terrainHeight(vec2 p) {
    float sides = smoothstep(1.2, 7.5, abs(p.x));
    float peaks = ridged(p * 0.11) * 4.4;
    float swell = gradientNoise(p * 0.045) * 0.9;
    return peaks * (0.12 + sides * 0.88) + swell * 0.5;
  }
`

export const TERRAIN_VERTEX = /* glsl */ `
  uniform float uOffset;
  varying float vHeight;
  varying float vDepth;
  varying vec2 vGround;
  varying vec3 vWorld;

  ${NOISE}

  void main() {
    vec3 transformed = position;
    vec2 ground = vec2(transformed.x, transformed.z - uOffset);
    float height = terrainHeight(ground);
    transformed.y += height;
    vec4 world = modelMatrix * vec4(transformed, 1.0);
    vec4 view = viewMatrix * world;
    vHeight = height;
    vGround = ground;
    vWorld = world.xyz;
    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
  }
`

export const TERRAIN_FRAGMENT = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uPulse;
  varying float vHeight;
  varying float vDepth;
  varying vec2 vGround;
  varying vec3 vWorld;

  float gridLine(float coordinate, float width) {
    float distanceToLine = abs(fract(coordinate - 0.5) - 0.5) / max(fwidth(coordinate), 1e-4);
    return 1.0 - min(distanceToLine / width, 1.0);
  }

  void main() {
    // Normal facetada desde derivadas: relieve low-poly sin atributos extra.
    vec3 normal = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    float light = clamp(dot(normal, normalize(vec3(0.35, 1.0, 0.55))), 0.0, 1.0);
    vec3 base = mix(vec3(0.018, 0.012, 0.05), vec3(0.15, 0.055, 0.22), light * light);

    float ridgeLines = gridLine(vGround.y / 1.15, 1.15);
    float crossLines = gridLine(vGround.x / 1.6, 0.8) * 0.35;
    float contour = gridLine(vHeight * 2.1, 0.9) * 0.4;

    vec3 violet = vec3(0.56, 0.38, 0.91);
    vec3 pink = vec3(1.0, 0.31, 0.85);
    vec3 peach = vec3(1.0, 0.7, 0.54);
    vec3 lineColor = mix(violet, pink, smoothstep(0.2, 2.4, vHeight));
    lineColor = mix(lineColor, peach, smoothstep(2.6, 4.2, vHeight));

    float glow = ridgeLines + crossLines + contour;
    vec3 color = base + lineColor * glow * (0.85 + uPulse * 0.35);
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    gl_FragColor = vec4(mix(color, uFogColor, fog), 1.0);
  }
`

export const SKY_VERTEX = /* glsl */ `
  varying vec3 vDirection;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDirection = world.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uSunDirection;
  uniform float uTime;
  varying vec3 vDirection;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  }

  void main() {
    vec3 direction = normalize(vDirection);
    float elevation = direction.y;
    vec3 zenith = vec3(0.02, 0.02, 0.04);
    vec3 dusk = vec3(0.08, 0.05, 0.18);
    vec3 horizon = vec3(0.7, 0.23, 0.54);
    vec3 color = mix(horizon, dusk, smoothstep(0.0, 0.22, elevation));
    color = mix(color, zenith, smoothstep(0.22, 0.75, elevation));

    // Sol a franjas: cada corte crece hacia el horizonte (póster de 1986).
    vec3 sunDirection = normalize(uSunDirection);
    float angle = acos(clamp(dot(direction, sunDirection), -1.0, 1.0));
    float disc = 1.0 - smoothstep(0.188, 0.195, angle);
    float below = clamp((sunDirection.y - elevation) / 0.19, 0.0, 1.0);
    float stripes = step(below * 0.6, fract((sunDirection.y - elevation) * 30.0));
    float cut = mix(1.0, stripes, step(0.02, below));
    vec3 sunColor = mix(vec3(0.93, 0.7, 0.2), vec3(0.92, 0.47, 0.2), smoothstep(-0.12, 0.05, sunDirection.y - elevation));
    sunColor = mix(sunColor, vec3(1.0, 0.31, 0.85), smoothstep(0.02, 0.2, sunDirection.y - elevation));
    color = mix(color, sunColor, disc * cut);
    color += vec3(1.0, 0.31, 0.85) * exp(-angle * 5.5) * 0.25;

    float starField = step(0.9975, hash(floor(direction * 420.0)));
    float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + hash(floor(direction * 420.0) + 3.1) * 40.0);
    color += vec3(starField * twinkle) * smoothstep(0.12, 0.5, elevation);
    gl_FragColor = vec4(color, 1.0);
  }
`

export const CRT_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const CRT_FRAGMENT = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uAberration;
  varying vec2 vUv;

  float grain(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Curvatura leve del tubo; fuera del vidrio queda negro.
    vec2 centered = vUv - 0.5;
    vec2 uv = 0.5 + centered * (1.0 + 0.055 * dot(centered, centered));
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    vec2 direction = uv - 0.5;
    vec2 shift = direction * (uAberration + dot(direction, direction) * 0.012);
    vec3 color = vec3(
      texture2D(tScene, uv + shift).r,
      texture2D(tScene, uv).g,
      texture2D(tScene, uv - shift).b
    );

    // Brillo de fósforo barato: ocho muestras alrededor del píxel.
    vec2 texel = 2.5 / uResolution;
    vec3 bloom = vec3(0.0);
    bloom += texture2D(tScene, uv + vec2(texel.x, 0.0)).rgb;
    bloom += texture2D(tScene, uv - vec2(texel.x, 0.0)).rgb;
    bloom += texture2D(tScene, uv + vec2(0.0, texel.y)).rgb;
    bloom += texture2D(tScene, uv - vec2(0.0, texel.y)).rgb;
    bloom += texture2D(tScene, uv + texel * 2.0).rgb;
    bloom += texture2D(tScene, uv - texel * 2.0).rgb;
    bloom += texture2D(tScene, uv + vec2(texel.x, -texel.y) * 2.0).rgb;
    bloom += texture2D(tScene, uv + vec2(-texel.x, texel.y) * 2.0).rgb;
    color += max(bloom / 8.0 - 0.38, 0.0) * 0.75;

    float band = smoothstep(0.0, 0.08, 0.04 - abs(fract(uv.y * 0.35 - uTime * 0.045) - 0.5) + 0.04);
    color *= 1.0 + band * 0.06;
    // GLSL ES deja indefinido smoothstep con edge0 >= edge1: se invierte con bordes ordenados.
    color *= 1.0 - smoothstep(0.32, 0.98, length(direction) * 1.08);
    color += (grain(uv * uResolution + uTime * 61.0) - 0.5) * 0.04;
    gl_FragColor = vec4(color, 1.0);
  }
`
