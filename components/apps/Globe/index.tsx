import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DATA_PATH,
  FALLBACK_DATA,
  LAND_URL,
} from "components/apps/Globe/config";
import createGlobeScene, { type GlobeScene } from "components/apps/Globe/scene";
import StyledGlobe from "components/apps/Globe/StyledGlobe";
import {
  type GlobeData,
  type GlobeLocation,
  type GlobeProject,
  type LandRings,
} from "components/apps/Globe/types";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Apps/StyledLoading";
import { useFileSystemActions } from "contexts/fileSystem";
import { loadFiles } from "utils/functions";

const THREE_LIB = ["/System/three.js/three.min.js"];

const orbitLabel = (data?: GlobeData): string =>
  data?.orbit?.label || data?.orbit?.name || "trabalho remoto";

type Selection =
  | { kind: "location"; location: GlobeLocation }
  | { kind: "orbit" }
  | { kind: "project"; project: GlobeProject };

const Globe: FC<ComponentProcessProps> = () => {
  const { exists, readFile } = useFileSystemActions();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GlobeScene>(undefined);
  const [data, setData] = useState<GlobeData>();
  const [activeId, setActiveId] = useState<string>();

  const selection = useMemo<Selection | undefined>(() => {
    if (!data || !activeId) return undefined as Selection | undefined;
    if (activeId === "orbit" && data.orbit) return { kind: "orbit" };

    const location = data.locations.find(({ id }) => id === activeId);

    if (location) return { kind: "location", location };

    const project = data.orbit?.projects.find(({ id }) => id === activeId);

    return project ? { kind: "project", project } : undefined;
  }, [activeId, data]);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      let loaded = FALLBACK_DATA;

      try {
        if (await exists(DATA_PATH)) {
          const parsed = JSON.parse(
            (await readFile(DATA_PATH)).toString()
          ) as GlobeData;

          if (Array.isArray(parsed?.locations) && parsed.locations.length > 0) {
            loaded = parsed;
          }
        }
      } catch {
        // Fall back to the bundled locations
      }

      if (!cancelled) setData(loaded);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [exists, readFile]);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const labelLayer = labelRef.current;

    const build = async (): Promise<void> => {
      if (!data || !container || !canvas || !labelLayer) return;

      const [land] = await Promise.all([
        fetch(LAND_URL).then(
          (response) => response.json() as Promise<LandRings>
        ),
        loadFiles(THREE_LIB),
      ]);

      if (cancelled || !window.THREE) return;

      sceneRef.current = createGlobeScene({
        canvas,
        container,
        labelLayer,
        land,
        locations: data.locations,
        onPick: (id) => {
          setActiveId(id);
          // Picking the planet on the canvas centres it, same as the list does.
          if (id === "orbit") sceneRef.current?.focusOrbit();
        },
        orbit: data.orbit,
      });
    };

    build();

    return () => {
      cancelled = true;
      sceneRef.current?.destroy();
      sceneRef.current = undefined;
    };
  }, [data]);

  useEffect(() => {
    sceneRef.current?.setActive(activeId);
  }, [activeId]);

  const select = useCallback(
    (id: string, coords?: { lat: number; lon: number }): void => {
      setActiveId(id);
      if (coords) sceneRef.current?.focus(coords);
    },
    []
  );

  /** The planet takes centre stage whenever it or one of its projects is open. */
  const selectOrbit = useCallback((id: string): void => {
    setActiveId(id);
    sceneRef.current?.focusOrbit();
  }, []);

  /** Steps back one level: a project returns to the planet, anything else to
   *  the wide shot. States have no page of their own, so they never appear. */
  const goBack = useCallback((): void => {
    if (selection?.kind === "project") {
      selectOrbit("orbit");
    } else {
      setActiveId(undefined);
      sceneRef.current?.resetView();
    }
  }, [selectOrbit, selection]);

  const backLabel =
    selection?.kind === "project" ? orbitLabel(data) : "visão geral";

  if (!data) return <StyledLoading />;

  const { orbit } = data;

  return (
    <StyledGlobe>
      <div ref={containerRef} className="stage">
        <canvas ref={canvasRef} aria-label="Interactive globe" />
        <div ref={labelRef} className="labels" />
        <div className="banner">
          <h1>{data.title || FALLBACK_DATA.title}</h1>
          <p>{data.subtitle || FALLBACK_DATA.subtitle}</p>
        </div>
        <div className="hint">
          Arraste para girar · role para aproximar e ver os estados · clique num
          marcador
        </div>
      </div>
      <div className="panel">
        {selection && (
          <button className="back" onClick={goBack} type="button">
            ← Voltar para {backLabel}
          </button>
        )}

        {selection?.kind === "location" && (
          <>
            <h2>{selection.location.city}</h2>
            <div className="country">{selection.location.country}</div>
            <div className="meta">
              {[selection.location.role, selection.location.period]
                .filter(Boolean)
                .join(" · ")}
            </div>
            {selection.location.summary && (
              <p className="summary">{selection.location.summary}</p>
            )}
            {selection.location.highlights &&
              selection.location.highlights.length > 0 && (
                <>
                  <h3>Highlights</h3>
                  <ul>
                    {selection.location.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            {selection.location.places &&
              selection.location.places.length > 0 && (
                <>
                  <h3>Estados e províncias</h3>
                  <div className="places">
                    {selection.location.places.map((place) => (
                      <div key={place.id}>
                        {place.name}
                        {place.note && <small>{place.note}</small>}
                      </div>
                    ))}
                  </div>
                </>
              )}
          </>
        )}

        {selection?.kind === "orbit" && orbit && (
          <>
            <h2>{orbit.label || orbit.name}</h2>
            <div className="country">{orbit.name}</div>
            {orbit.summary && <p className="summary">{orbit.summary}</p>}
            <h3>Projetos</h3>
            <div className="list">
              {orbit.projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => selectOrbit(project.id)}
                  type="button"
                >
                  {project.name}
                  {project.role && <small>{project.role}</small>}
                </button>
              ))}
            </div>
          </>
        )}

        {selection?.kind === "project" && (
          <>
            <h2>{selection.project.name}</h2>
            <div className="country">{orbitLabel(data)}</div>
            <div className="meta">
              {[selection.project.role, selection.project.period]
                .filter(Boolean)
                .join(" · ")}
            </div>
            {selection.project.tagline && (
              <div className="tagline">{selection.project.tagline}</div>
            )}
            {selection.project.summary && (
              <p className="summary">{selection.project.summary}</p>
            )}
            {selection.project.sections?.map((section) => (
              <div key={section.title}>
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
            {selection.project.stack && selection.project.stack.length > 0 && (
              <>
                <h3>Stack</h3>
                <div className="stack">
                  {selection.project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </>
            )}
            {selection.project.url && (
              <div className="list">
                <a
                  href={selection.project.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver repositório ↗
                </a>
              </div>
            )}
          </>
        )}

        {!selection && (
          <p className="empty">
            Clique num marcador do globo, ou escolha abaixo. Aproxime o zoom
            para ver os estados e províncias de cada país.
          </p>
        )}

        <h3>Lugares</h3>
        <div className="list">
          {data.locations.map((location) => (
            <button
              key={location.id}
              className={location.id === activeId ? "active" : undefined}
              onClick={() => select(location.id, location)}
              type="button"
            >
              {location.city}
              <small>{location.country}</small>
            </button>
          ))}
        </div>

        {orbit && (
          <>
            <h3>Remoto</h3>
            <div className="list">
              <button
                className={activeId === "orbit" ? "active" : undefined}
                onClick={() => selectOrbit("orbit")}
                type="button"
              >
                {orbit.label || orbit.name}
                <small>{orbit.projects.length} projetos</small>
              </button>
            </div>
          </>
        )}
      </div>
    </StyledGlobe>
  );
};

export default memo(Globe);
