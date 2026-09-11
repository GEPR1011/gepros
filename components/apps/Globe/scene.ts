import type * as ThreeApi from "three";
import {
  AUTO_ROTATE_SPEED,
  CAMERA,
  COLORS,
  GLOBE_RADIUS,
  IDLE_BEFORE_AUTO_ROTATE_MS,
  MARKER_SIZE,
  MAX_TILT,
  ORBIT,
  PLACE_REVEAL_ZOOM,
  PLACE_SIZE,
} from "components/apps/Globe/config";
import {
  type GlobeLocation,
  type GlobeOrbit,
  type LandRings,
} from "components/apps/Globe/types";

type Three = typeof ThreeApi;

const DEG_TO_RAD = Math.PI / 180;
const DRAG_SLOP_PX = 4;
const FOCUS_EASING = 0.12;
const ROTATE_SENSITIVITY = 0.005;
const ZOOM_SENSITIVITY = 0.0016;
/** How far a point must face the camera before its label is drawn. */
const FACING_THRESHOLD = 0.12;
/** Labels closer than this on screen collapse into the first one placed. */
const LABEL_MIN_GAP_PX = 26;

type Vec = { x: number; y: number; z: number };

/** Equirectangular lon/lat to a point on the sphere. */
const toPoint = (lon: number, lat: number, radius: number): Vec => {
  const phi = (90 - lat) * DEG_TO_RAD;
  const theta = (lon + 180) * DEG_TO_RAD;

  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
};

/** Wraps an angle delta into [-PI, PI] so focusing takes the short way round. */
const shortestAngle = (delta: number): number =>
  Math.atan2(Math.sin(delta), Math.cos(delta));

const buildSegments = (
  three: Three,
  rings: LandRings,
  radius: number,
  closed: boolean
): ThreeApi.BufferGeometry => {
  const positions: number[] = [];

  rings.forEach((ring) => {
    const count = ring.length / 2;

    for (let i = 0; i < count; i += 1) {
      const next = i + 1;

      if (next === count && !closed) break;

      const j = next % count;
      const a = toPoint(ring[i * 2], ring[i * 2 + 1], radius);
      const b = toPoint(ring[j * 2], ring[j * 2 + 1], radius);

      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  });

  const geometry = new three.BufferGeometry();

  geometry.setAttribute(
    "position",
    new three.Float32BufferAttribute(positions, 3)
  );

  return geometry;
};

/** Meridians and parallels every 30 degrees. */
const graticuleRings = (): LandRings => {
  const rings: LandRings = [];

  for (let lon = -180; lon < 180; lon += 30) {
    const ring: number[] = [];

    for (let lat = -90; lat <= 90; lat += 5) ring.push(lon, lat);
    rings.push(ring);
  }

  for (let lat = -60; lat <= 60; lat += 30) {
    const ring: number[] = [];

    for (let lon = -180; lon <= 180; lon += 5) ring.push(lon, lat);
    rings.push(ring);
  }

  return rings;
};

/** Swaps a couple of characters for symbols, so the name never settles. */
const glitchName = (name: string): string => {
  const chars = [...name];
  const swaps = 1 + Math.floor(Math.random() * 2);

  for (let i = 0; i < swaps; i += 1) {
    const at = Math.floor(Math.random() * chars.length);

    chars[at] =
      ORBIT.glitchPool[Math.floor(Math.random() * ORBIT.glitchPool.length)];
  }

  return chars.join("");
};

export type GlobeScene = {
  destroy: () => void;
  focus: (target: { lat: number; lon: number }, zoom?: number) => void;
  /** Brings the remote-work planet front and centre, like the globe. */
  focusOrbit: () => void;
  /** Back to the wide shot: globe centred, default distance. */
  resetView: () => void;
  setActive: (id?: string) => void;
};

type SceneOptions = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  labelLayer: HTMLElement;
  land: LandRings;
  locations: GlobeLocation[];
  onPick: (id?: string) => void;
  orbit?: GlobeOrbit;
};

const createGlobeScene = ({
  canvas,
  container,
  labelLayer,
  land,
  locations,
  onPick,
  orbit,
}: SceneOptions): GlobeScene => {
  const three = window.THREE as Three;
  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(
    CAMERA.fov,
    1,
    CAMERA.near,
    CAMERA.far
  );

  const renderer = new three.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const root = new three.Group();

  scene.add(root);

  const oceanGeometry = new three.SphereGeometry(GLOBE_RADIUS, 64, 48);
  const oceanMaterial = new three.MeshBasicMaterial({ color: COLORS.ocean });
  const ocean = new three.Mesh(oceanGeometry, oceanMaterial);

  root.add(ocean);

  const graticuleGeometry = buildSegments(
    three,
    graticuleRings(),
    GLOBE_RADIUS * 1.001,
    false
  );
  const graticuleMaterial = new three.LineBasicMaterial({
    color: COLORS.meridian,
  });

  root.add(new three.LineSegments(graticuleGeometry, graticuleMaterial));

  const landGeometry = buildSegments(three, land, GLOBE_RADIUS * 1.003, true);
  const landMaterial = new three.LineBasicMaterial({ color: COLORS.land });

  root.add(new three.LineSegments(landGeometry, landMaterial));

  const disposables: { dispose: () => void }[] = [
    oceanGeometry,
    oceanMaterial,
    graticuleGeometry,
    graticuleMaterial,
    landGeometry,
    landMaterial,
  ];

  const makeLabel = (text: string, extraClass: string): HTMLDivElement => {
    const el = document.createElement("div");

    el.className = `globe-label ${extraClass}`;
    el.textContent = text;
    el.hidden = true;
    labelLayer.append(el);

    return el;
  };

  const addMarker = (
    lon: number,
    lat: number,
    size: number,
    color: number,
    id: string
  ): ThreeApi.Mesh => {
    const geometry = new three.SphereGeometry(size, 16, 16);
    const material = new three.MeshBasicMaterial({ color });
    const mesh = new three.Mesh(geometry, material);
    const { x, y, z } = toPoint(lon, lat, GLOBE_RADIUS * 1.01);

    mesh.position.set(x, y, z);
    mesh.userData = { id };
    root.add(mesh);
    disposables.push(geometry, material);

    return mesh;
  };

  const countryMarkers = locations.map((location) => ({
    hasPlaces: (location.places?.length ?? 0) > 0,
    mesh: addMarker(
      location.lon,
      location.lat,
      MARKER_SIZE,
      COLORS.marker,
      location.id
    ),
  }));

  type PlaceEntry = { el: HTMLDivElement; mesh: ThreeApi.Mesh };

  // States are shown, not selected: their markers answer with the country's id,
  // so clicking one opens the country rather than a page of its own.
  const placeEntries: PlaceEntry[] = locations.flatMap(
    (location) =>
      location.places?.map((place) => ({
        el: makeLabel(place.name, "place"),
        mesh: addMarker(
          place.lon,
          place.lat,
          PLACE_SIZE,
          COLORS.place,
          location.id
        ),
      })) ?? []
  );

  // The remote-work planet sits outside the globe and does not rotate with it.
  let orbitPlanet: ThreeApi.Mesh | undefined;
  let orbitLabel: HTMLDivElement | undefined;
  let orbitGroup: ThreeApi.Group | undefined;
  /** Empty node under the ring; anchoring the label here scales it with zoom. */
  let orbitLabelAnchor: ThreeApi.Object3D | undefined;

  if (orbit) {
    orbitGroup = new three.Group();
    orbitGroup.position.set(
      ORBIT.position.x,
      ORBIT.position.y,
      ORBIT.position.z
    );

    const planetGeometry = new three.SphereGeometry(ORBIT.planetRadius, 32, 24);
    const planetMaterial = new three.MeshBasicMaterial({
      color: COLORS.orbitPlanet,
    });

    orbitPlanet = new three.Mesh(planetGeometry, planetMaterial);
    orbitPlanet.userData = { id: "orbit" };

    const wireGeometry = new three.SphereGeometry(
      ORBIT.planetRadius * 1.02,
      16,
      12
    );
    const wireMaterial = new three.MeshBasicMaterial({
      color: COLORS.ocean,
      wireframe: true,
    });
    const wire = new three.Mesh(wireGeometry, wireMaterial);

    const ringGeometry = new three.RingGeometry(
      ORBIT.ringInner,
      ORBIT.ringOuter,
      64
    );
    const ringMaterial = new three.MeshBasicMaterial({
      color: COLORS.orbitRing,
      opacity: 0.7,
      side: three.DoubleSide,
      transparent: true,
    });
    const ring = new three.Mesh(ringGeometry, ringMaterial);

    ring.rotation.x = ORBIT.tilt;
    ring.rotation.y = 0.35;

    orbitGroup.add(orbitPlanet, wire, ring);
    scene.add(orbitGroup);
    disposables.push(
      planetGeometry,
      planetMaterial,
      wireGeometry,
      wireMaterial,
      ringGeometry,
      ringMaterial
    );

    orbitLabelAnchor = new three.Object3D();
    // The ring is steeply tilted, so its vertical reach is far less than its
    // radius; the planet itself is what sets how low the label has to sit.
    orbitLabelAnchor.position.set(0, -(ORBIT.planetRadius + 0.13), 0);
    orbitGroup.add(orbitLabelAnchor);

    orbitLabel = makeLabel(orbit.name, "orbit");
  }

  const raycaster = new three.Raycaster();
  const pointer = new three.Vector2();
  const worldPosition = new three.Vector3();

  // The camera always sits `distance` in front of `focus`, looking at it.
  // Moving `focus` onto the planet is what puts it centre stage.
  const focus = new three.Vector3(0, 0, 0);
  const focusTarget = new three.Vector3(0, 0, 0);

  let distance = CAMERA.start;
  let distanceTarget = CAMERA.start;
  let onOrbit = false;
  // Idle spin only while nothing is selected, so a focused place stays put.
  let autoRotate = true;
  let frame = 0;
  let dragging = false;
  let moved = 0;
  let lastX = 0;
  let lastY = 0;
  let lastInteraction = performance.now();
  let lastGlitch = 0;
  let rotationTarget: { x: number; y: number } | undefined;

  const resize = (): void => {
    const { clientHeight: height, clientWidth: width } = container;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  /** Screen position for a label, or undefined when it should stay hidden.
   *  The anchor offset lives in CSS so each label kind can sit differently. */
  const labelPoint = (
    object: ThreeApi.Object3D,
    allowed: boolean
  ): { x: number; y: number } | undefined => {
    if (!allowed) return undefined;

    object.getWorldPosition(worldPosition);
    worldPosition.project(camera);

    // Behind the camera, or outside the viewport: no label.
    if (
      worldPosition.z > 1 ||
      Math.abs(worldPosition.x) > 1 ||
      Math.abs(worldPosition.y) > 1
    ) {
      return undefined;
    }

    return {
      x: (worldPosition.x * 0.5 + 0.5) * container.clientWidth,
      y: (-worldPosition.y * 0.5 + 0.5) * container.clientHeight,
    };
  };

  /** True when the point is on the hemisphere turned toward the camera. */
  const facesCamera = (object: ThreeApi.Object3D): boolean => {
    object.getWorldPosition(worldPosition);

    return worldPosition.z > FACING_THRESHOLD;
  };

  const updateLabels = (now: number): void => {
    const zoomedIn = !onOrbit && distance < PLACE_REVEAL_ZOOM;

    for (const { hasPlaces, mesh } of countryMarkers) {
      mesh.visible = !(zoomedIn && hasPlaces);
    }

    // The active label is placed first so a crowded cluster never hides it.
    const ordered = [...placeEntries].sort(
      (a, b) =>
        Number(b.el.classList.contains("active")) -
        Number(a.el.classList.contains("active"))
    );
    const placed: { x: number; y: number }[] = [];

    for (const { el, mesh } of ordered) {
      mesh.visible = zoomedIn;

      const point = labelPoint(mesh, zoomedIn && facesCamera(mesh));
      const crowded = Boolean(
        point &&
          placed.some(
            (other) =>
              Math.abs(other.x - point.x) < LABEL_MIN_GAP_PX &&
              Math.abs(other.y - point.y) < LABEL_MIN_GAP_PX
          )
      );

      el.hidden = !point || crowded;

      if (point && !crowded) {
        placed.push(point);
        el.style.left = `${point.x}px`;
        el.style.top = `${point.y}px`;
      }
    }

    if (orbitLabel && orbitLabelAnchor && orbit) {
      if (now - lastGlitch > ORBIT.glitchIntervalMs) {
        orbitLabel.textContent = glitchName(orbit.name);
        lastGlitch = now;
      }

      const point = labelPoint(orbitLabelAnchor, true);

      orbitLabel.hidden = !point;

      if (point) {
        orbitLabel.style.left = `${point.x}px`;
        orbitLabel.style.top = `${point.y}px`;
      }
    }
  };

  const render = (): void => {
    const now = performance.now();

    if (rotationTarget) {
      const dx = shortestAngle(rotationTarget.x - root.rotation.x);
      const dy = shortestAngle(rotationTarget.y - root.rotation.y);

      root.rotation.x += dx * FOCUS_EASING;
      root.rotation.y += dy * FOCUS_EASING;

      if (Math.abs(dx) < 0.002 && Math.abs(dy) < 0.002) {
        rotationTarget = undefined;
      }
    } else if (
      autoRotate &&
      !dragging &&
      now - lastInteraction > IDLE_BEFORE_AUTO_ROTATE_MS
    ) {
      root.rotation.y += AUTO_ROTATE_SPEED;
    }

    focus.lerp(focusTarget, FOCUS_EASING);
    distance += (distanceTarget - distance) * FOCUS_EASING;
    camera.position.set(focus.x, focus.y, focus.z + distance);
    camera.lookAt(focus);
    camera.updateMatrixWorld();

    if (orbitGroup) orbitGroup.rotation.y += ORBIT.spinSpeed;

    updateLabels(now);
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(render);
  };

  const pick = (event: PointerEvent): void => {
    const rect = container.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // The ocean occludes markers on the far side; the planet is always pickable.
    const pickables: ThreeApi.Object3D[] = [
      ...countryMarkers
        .filter(({ mesh }) => mesh.visible)
        .map(({ mesh }) => mesh),
      ...placeEntries
        .filter(({ mesh }) => mesh.visible)
        .map(({ mesh }) => mesh),
      ocean,
    ];

    if (orbitPlanet) pickables.push(orbitPlanet);

    const [hit] = raycaster.intersectObjects(pickables, false);

    onPick(hit?.object.userData.id as string | undefined);
  };

  const onPointerDown = (event: PointerEvent): void => {
    dragging = true;
    moved = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    lastInteraction = performance.now();
    canvas.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!dragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;

    moved += Math.abs(dx) + Math.abs(dy);
    lastX = event.clientX;
    lastY = event.clientY;
    rotationTarget = undefined;
    root.rotation.y += dx * ROTATE_SENSITIVITY;
    root.rotation.x = Math.max(
      -MAX_TILT,
      Math.min(MAX_TILT, root.rotation.x + dy * ROTATE_SENSITIVITY)
    );
    lastInteraction = performance.now();
  };

  const onPointerUp = (event: PointerEvent): void => {
    if (dragging && moved < DRAG_SLOP_PX) pick(event);

    dragging = false;
    lastInteraction = performance.now();
    canvas.releasePointerCapture(event.pointerId);
  };

  const onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    rotationTarget = undefined;

    const min = onOrbit ? ORBIT.minZoom : CAMERA.minZoom;
    const max = onOrbit ? ORBIT.maxZoom : CAMERA.maxZoom;

    distanceTarget = Math.max(
      min,
      Math.min(max, distanceTarget + event.deltaY * ZOOM_SENSITIVITY)
    );
    lastInteraction = performance.now();
  };

  const observer = new ResizeObserver(resize);

  observer.observe(container);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  resize();
  render();

  return {
    destroy: () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      labelLayer.replaceChildren();
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
    },
    focus: ({ lat, lon }, zoom) => {
      const { x, z } = toPoint(lon, lat, GLOBE_RADIUS);

      onOrbit = false;
      focusTarget.set(0, 0, 0);
      distanceTarget = zoom ?? CAMERA.focusZoom;
      rotationTarget = { x: lat * DEG_TO_RAD, y: -Math.atan2(x, z) };
      lastInteraction = performance.now();
    },
    focusOrbit: () => {
      if (!orbitGroup) return;

      onOrbit = true;
      rotationTarget = undefined;
      focusTarget.copy(orbitGroup.position);
      distanceTarget = ORBIT.viewDistance;
      lastInteraction = performance.now();
    },
    resetView: () => {
      onOrbit = false;
      rotationTarget = undefined;
      focusTarget.set(0, 0, 0);
      distanceTarget = CAMERA.start;
      lastInteraction = performance.now();
    },
    setActive: (id) => {
      autoRotate = !id;

      for (const { mesh } of countryMarkers) {
        const isActive = mesh.userData.id === id;

        (mesh.material as ThreeApi.MeshBasicMaterial).color.setHex(
          isActive ? COLORS.markerActive : COLORS.marker
        );
        mesh.scale.setScalar(isActive ? 1.6 : 1);
      }

      for (const { el, mesh } of placeEntries) {
        const isActive = mesh.userData.id === id;

        (mesh.material as ThreeApi.MeshBasicMaterial).color.setHex(
          isActive ? COLORS.markerActive : COLORS.place
        );
        mesh.scale.setScalar(isActive ? 1.7 : 1);
        el.classList.toggle("active", isActive);
      }

      orbitLabel?.classList.toggle("active", id === "orbit");
    },
  };
};

export default createGlobeScene;
