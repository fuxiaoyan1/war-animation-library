import { useEffect, useMemo, useRef } from "react";
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer
} from "three";
import {
  campFortifications,
  fieldworks,
  terrainReliefSurfaces,
  type GaixiaFieldwork,
  type GaixiaReliefSurface
} from "../data/gaixiaAmbush";
import { createCampaignProjection, projectPoint } from "../lib/geoMap";

type GaixiaTerrain3DProps = {
  height: number;
  mapTransform: string;
  width: number;
};

type TacticalPoint = [number, number];

const terrainSegmentsX = 156;
const terrainSegmentsY = 320;
const terrainBaseMeters = 26;
const terrainVerticalScale = 9.5;
const terrainViewScale = 0.55;
const terrainCameraDistance = 1650;
const reliefInfluence: Record<GaixiaReliefSurface["kind"], number> = {
  corridor: 0.72,
  lowland: 0.84,
  ridge: 0.88,
  slope: 0.92
};

const projection = createCampaignProjection(1180, 1408, "gaixiaBattle");

function projectTactical(point: TacticalPoint, height: number): Vector2 {
  const [x, y] = projectPoint(projection, point);
  return new Vector2(x - 590, y * 2 - height / 2);
}

function pointInPolygon(point: Vector2, polygon: Vector2[]) {
  let inside = false;
  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
    const current = polygon[index];
    const previous = polygon[previousIndex];
    const intersects =
      current.y > point.y !== previous.y > point.y &&
      point.x < ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y + Number.EPSILON) + current.x;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToSegment(point: Vector2, start: Vector2, end: Vector2) {
  const segment = end.clone().sub(start);
  const lengthSq = segment.lengthSq();
  if (lengthSq === 0) {
    return point.distanceTo(start);
  }
  const ratio = Math.max(0, Math.min(1, point.clone().sub(start).dot(segment) / lengthSq));
  return point.distanceTo(start.clone().add(segment.multiplyScalar(ratio)));
}

function distanceToPolygon(point: Vector2, polygon: Vector2[]) {
  return polygon.reduce((minimum, current, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return Math.min(minimum, distanceToSegment(point, current, next));
  }, Number.POSITIVE_INFINITY);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function makeReliefProfiles(height: number) {
  return terrainReliefSurfaces.map((surface) => ({
    ...surface,
    polygon: surface.points.map((point) => projectTactical(point, height))
  }));
}

function reliefHeightAt(point: Vector2, reliefProfiles: ReturnType<typeof makeReliefProfiles>) {
  let heightMeters = 29.2;
  heightMeters += Math.sin(point.x * 0.009 + point.y * 0.004) * 1.15;
  heightMeters += Math.cos(point.x * 0.005 - point.y * 0.006) * 0.75;

  for (const surface of reliefProfiles) {
    const inside = pointInPolygon(point, surface.polygon);
    const distance = distanceToPolygon(point, surface.polygon);
    const falloff = inside ? 1 : 1 - smoothstep(0, surface.kind === "ridge" ? 135 : 95, distance);
    if (falloff <= 0) {
      continue;
    }
    const influence = reliefInfluence[surface.kind];
    const target = surface.kind === "lowland" ? Math.min(heightMeters, surface.elevation - 1.8) : surface.elevation;
    heightMeters += (target - heightMeters) * falloff * influence;
  }

  return heightMeters;
}

function colorForTerrain(heightMeters: number, point: Vector2, reliefProfiles: ReturnType<typeof makeReliefProfiles>) {
  const lowland = reliefProfiles.find((surface) => surface.kind === "lowland" && pointInPolygon(point, surface.polygon));
  const corridor = reliefProfiles.find((surface) => surface.kind === "corridor" && distanceToPolygon(point, surface.polygon) < 36);
  const camp = reliefProfiles.find((surface) => surface.tacticalRole === "camp-shelf" && pointInPolygon(point, surface.polygon));

  if (lowland) {
    return new Color("#789f76").lerp(new Color("#5d9190"), 0.32);
  }
  if (camp) {
    return new Color("#b58657");
  }
  if (corridor) {
    return new Color("#b7b76f");
  }
  if (heightMeters > 37) {
    return new Color("#9f9960").lerp(new Color("#c1b16e"), Math.min(1, (heightMeters - 37) / 9));
  }
  return new Color("#bda56b").lerp(new Color("#7e9a5b"), Math.max(0, Math.min(1, (heightMeters - 29) / 8)));
}

function createTerrainTexture(reliefProfiles: ReturnType<typeof makeReliefProfiles>) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const image = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const world = new Vector2((x / (canvas.width - 1) - 0.5) * 1180, (y / (canvas.height - 1) - 0.5) * 2816);
      const heightMeters = reliefHeightAt(world, reliefProfiles);
      const color = colorForTerrain(heightMeters, world, reliefProfiles);
      const grain = (Math.sin(x * 0.13 + y * 0.07) + Math.sin(x * 0.031 - y * 0.047)) * 7;
      const index = (y * canvas.width + x) * 4;
      image.data[index] = Math.max(0, Math.min(255, Math.round(color.r * 255 + grain)));
      image.data[index + 1] = Math.max(0, Math.min(255, Math.round(color.g * 255 + grain * 0.72)));
      image.data[index + 2] = Math.max(0, Math.min(255, Math.round(color.b * 255 + grain * 0.42)));
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  context.globalAlpha = 0.18;
  context.strokeStyle = "#efe0a4";
  context.lineWidth = 1.4;
  for (let y = 80; y < canvas.height; y += 132) {
    context.beginPath();
    for (let x = -40; x <= canvas.width + 40; x += 24) {
      const waveY = y + Math.sin(x * 0.018 + y * 0.02) * 16;
      if (x === -40) {
        context.moveTo(x, waveY);
      } else {
        context.lineTo(x, waveY);
      }
    }
    context.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function createTerrainMesh(width: number, height: number, reliefProfiles: ReturnType<typeof makeReliefProfiles>) {
  const geometry = new PlaneGeometry(width, height, terrainSegmentsX, terrainSegmentsY);
  geometry.rotateX(-Math.PI / 2);

  const position = geometry.attributes.position as BufferAttribute;
  const colors: number[] = [];
  for (let index = 0; index < position.count; index += 1) {
    const point = new Vector2(position.getX(index), position.getZ(index));
    const heightMeters = reliefHeightAt(point, reliefProfiles);
    const elevation = (heightMeters - terrainBaseMeters) * terrainVerticalScale;
    position.setY(index, elevation);
    const color = colorForTerrain(heightMeters, point, reliefProfiles);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new BufferAttribute(new Float32Array(colors), 3));
  geometry.computeVertexNormals();

  const texture = createTerrainTexture(reliefProfiles);
  const material = new MeshStandardMaterial({
    color: "#d5c283",
    map: texture ?? undefined,
    metalness: 0,
    roughness: 0.86,
    side: DoubleSide,
    vertexColors: true
  });

  const mesh = new Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

function terrainYAt(point: Vector2, reliefProfiles: ReturnType<typeof makeReliefProfiles>, offset = 0) {
  return (reliefHeightAt(point, reliefProfiles) - terrainBaseMeters) * terrainVerticalScale + offset;
}

function createRiverMesh(points: TacticalPoint[], height: number, width: number, reliefProfiles: ReturnType<typeof makeReliefProfiles>) {
  const projected = points.map((point) => projectTactical(point, height));
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: Vector2[] = projected.map((point, index) => {
    const previous = projected[Math.max(0, index - 1)];
    const next = projected[Math.min(projected.length - 1, index + 1)];
    const direction = next.clone().sub(previous).normalize();
    return new Vector2(-direction.y, direction.x);
  });

  projected.forEach((point, index) => {
    const normal = normals[index].multiplyScalar(width / 2);
    const left = point.clone().add(normal);
    const right = point.clone().sub(normal);
    vertices.push(left.x, terrainYAt(left, reliefProfiles, 4), left.y, right.x, terrainYAt(right, reliefProfiles, 4), right.y);
    if (index < projected.length - 1) {
      const base = index * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return new Mesh(
    geometry,
    new MeshStandardMaterial({
      color: "#4aa8b2",
      emissive: "#103b45",
      emissiveIntensity: 0.18,
      metalness: 0,
      roughness: 0.38,
      transparent: true,
      opacity: 0.86,
      side: DoubleSide
    })
  );
}

function createPolylineMesh(points: TacticalPoint[], height: number, width: number, color: string, yOffset: number, reliefProfiles: ReturnType<typeof makeReliefProfiles>) {
  const projected = points.map((point) => projectTactical(point, height));
  const vertices: number[] = [];
  const indices: number[] = [];

  projected.forEach((point, index) => {
    const previous = projected[Math.max(0, index - 1)];
    const next = projected[Math.min(projected.length - 1, index + 1)];
    const direction = next.clone().sub(previous).normalize();
    const normal = new Vector2(-direction.y, direction.x).multiplyScalar(width / 2);
    const left = point.clone().add(normal);
    const right = point.clone().sub(normal);
    vertices.push(left.x, terrainYAt(left, reliefProfiles, yOffset), left.y, right.x, terrainYAt(right, reliefProfiles, yOffset), right.y);
    if (index < projected.length - 1) {
      const base = index * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new Mesh(
    geometry,
    new MeshStandardMaterial({
      color,
      roughness: 0.76,
      metalness: 0,
      side: DoubleSide
    })
  );
}

function createCampWall(points: TacticalPoint[], height: number, reliefProfiles: ReturnType<typeof makeReliefProfiles>, color = "#8b4c30") {
  const shape = new Group();
  shape.add(createPolylineMesh([...points, points[0]], height, 12, color, 16, reliefProfiles));
  points.forEach((point) => {
    const projected = projectTactical(point, height);
    const groundY = terrainYAt(projected, reliefProfiles, 14);
    const towerGeometry = new BufferGeometry();
    const size = 16;
    const towerHeight = 30;
    const vertices = new Float32Array([
      projected.x - size,
      groundY,
      projected.y - size,
      projected.x + size,
      groundY,
      projected.y - size,
      projected.x,
      groundY + towerHeight,
      projected.y,
      projected.x + size,
      groundY,
      projected.y + size,
      projected.x - size,
      groundY,
      projected.y + size
    ]);
    towerGeometry.setAttribute("position", new BufferAttribute(vertices, 3));
    towerGeometry.setIndex([0, 1, 2, 1, 3, 2, 3, 4, 2, 4, 0, 2, 0, 4, 3, 0, 3, 1]);
    towerGeometry.computeVertexNormals();
    shape.add(
      new Mesh(
        towerGeometry,
        new MeshStandardMaterial({
          color,
          roughness: 0.9
        })
      )
    );
  });
  return shape;
}

function createFieldworkMesh(fieldwork: GaixiaFieldwork, height: number, reliefProfiles: ReturnType<typeof makeReliefProfiles>) {
  if (fieldwork.kind === "earthwork") {
    return createCampWall(fieldwork.coordinates, height, reliefProfiles, "#845336");
  }
  if (fieldwork.kind === "ditch") {
    return createPolylineMesh(fieldwork.coordinates, height, 18, "#37616b", 7, reliefProfiles);
  }
  return createPolylineMesh(fieldwork.coordinates, height, fieldwork.kind === "gate" ? 16 : 10, "#93633c", 20, reliefProfiles);
}

function applySvgTransformToGroup(transform: string, group: Group, width: number, height: number) {
  const match = transform.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\) scale\((\d+(?:\.\d+)?)\)/);
  const x = match ? Number(match[1]) : 0;
  const y = match ? Number(match[2]) : 0;
  const scale = match ? Number(match[3]) : 1;
  group.scale.setScalar(terrainViewScale * scale);
  group.position.x = (x + (scale - 1) * width * 0.5) * terrainViewScale;
  group.position.z = (y + (scale - 1) * height * 0.5) * terrainViewScale;
}

export function GaixiaTerrain3D({ height, mapTransform, width }: GaixiaTerrain3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const sceneGroupRef = useRef<Group | null>(null);
  const reliefProfiles = useMemo(() => makeReliefProfiles(height), [height]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.domElement.dataset.testid = "gaixia-terrain-3d-canvas";
    renderer.domElement.setAttribute("aria-label", "垓下三维地形网格");
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    scene.background = null;
    const camera = new PerspectiveCamera(39, Math.max(1, mount.clientWidth) / Math.max(1, mount.clientHeight), 1, 5000);
    camera.position.set(0, 1130, terrainCameraDistance);
    camera.lookAt(new Vector3(0, 0, 0));

    const terrainGroup = new Group();
    terrainGroup.rotation.x = -0.18;
    terrainGroup.scale.setScalar(terrainViewScale);
    applySvgTransformToGroup(mapTransform, terrainGroup, width, height);
    scene.add(terrainGroup);
    sceneGroupRef.current = terrainGroup;

    terrainGroup.add(createTerrainMesh(width, height, reliefProfiles));
    terrainGroup.add(
      createRiverMesh(
        [
          [117.12, 33.52],
          [117.18, 33.49],
          [117.33, 33.47],
          [117.48, 33.49],
          [117.62, 33.45],
          [117.8, 33.42]
        ],
        height,
        30,
        reliefProfiles
      )
    );
    terrainGroup.add(
      createRiverMesh(
        [
          [117.25, 33.23],
          [117.36, 33.27],
          [117.48, 33.25],
          [117.6, 33.19],
          [117.77, 33.13]
        ],
        height,
        22,
        reliefProfiles
      )
    );
    campFortifications.forEach((fortification) => {
      terrainGroup.add(createCampWall(fortification.coordinates, height, reliefProfiles, fortification.id === "inner-camp" ? "#774029" : "#8d5633"));
    });
    fieldworks.forEach((fieldwork) => {
      terrainGroup.add(createFieldworkMesh(fieldwork, height, reliefProfiles));
    });

    scene.add(new AmbientLight(0xfff0d0, 1.85));
    const keyLight = new DirectionalLight(0xffebbd, 2.45);
    keyLight.position.set(-520, 980, 840);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new DirectionalLight(0x8fd7ff, 0.72);
    fillLight.position.set(760, 420, -460);
    scene.add(fillLight);

    const shadowPlane = new Mesh(
      new PlaneGeometry(width * 1.08, height * 1.04),
      new MeshBasicMaterial({ color: "#6b5d3b", transparent: true, opacity: 0.14, side: DoubleSide })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -8;
    terrainGroup.add(shadowPlane);

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = mount.clientWidth || 1;
      const nextHeight = mount.clientHeight || 1;
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderRef.current?.();
    });
    resizeObserver.observe(mount);

    renderRef.current = () => {
      renderer.render(scene, camera);
    };
    renderRef.current();

    return () => {
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      renderRef.current = null;
      sceneGroupRef.current = null;
    };
  }, [height, reliefProfiles, width]);

  useEffect(() => {
    if (sceneGroupRef.current) {
      applySvgTransformToGroup(mapTransform, sceneGroupRef.current, width, height);
      renderRef.current?.();
    }
  }, [height, mapTransform, width]);

  return (
    <div
      ref={mountRef}
      className="gaixia-terrain-3d"
      data-testid="gaixia-terrain-3d"
      data-renderer="three-webgl"
      data-terrain-model="heightfield-mesh"
      data-heightfield-segments={`${terrainSegmentsX}x${terrainSegmentsY}`}
      data-projection="webgl-perspective"
    />
  );
}
