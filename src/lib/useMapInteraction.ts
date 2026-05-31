import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

export type MapView = {
  scale: number;
  x: number;
  y: number;
};

export type MapInteractionOptions = {
  maxScale?: number;
  minScale?: number;
};

const defaultMapView: MapView = { scale: 1, x: 0, y: 0 };
const defaultMinScale = 1;
const defaultMaxScale = 2.65;
const horizontalPanAllowanceRatio = 0.42;
const verticalPanAllowanceRatio = 0.42;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampOffset(value: number, scale: number, size: number, baseAllowance = 0) {
  const overflow = Math.max(0, size * (scale - 1));
  if (overflow === 0 && baseAllowance === 0) {
    return 0;
  }

  return clamp(value, -overflow - baseAllowance, baseAllowance);
}

export function useMapInteraction(
  width: number,
  height: number,
  resetKey?: string | number,
  initialMapView: MapView = defaultMapView,
  options: MapInteractionOptions = {}
) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [mapView, setMapView] = useState<MapView>(initialMapView);
  const [isMapDragging, setIsMapDragging] = useState(false);
  const minScale = options.minScale ?? defaultMinScale;
  const maxScale = options.maxScale ?? defaultMaxScale;

  const clampView = useCallback(
    (view: MapView) => {
      const scale = clamp(view.scale, minScale, maxScale);
      return {
        scale,
        x: clampOffset(view.x, scale, width, width * horizontalPanAllowanceRatio),
        y: clampOffset(view.y, scale, height, height * verticalPanAllowanceRatio)
      };
    },
    [height, maxScale, minScale, width]
  );

  useEffect(() => {
    dragRef.current = null;
    setIsMapDragging(false);
    setMapView(clampView(initialMapView));
  }, [clampView, initialMapView, resetKey]);

  const pointFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      const matrix = svg?.getScreenCTM()?.inverse();

      if (!svg || !matrix) {
        return { x: width / 2, y: height / 2 };
      }

      const point = svg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      return point.matrixTransform(matrix);
    },
    [height, width]
  );

  const zoomAtPoint = useCallback(
    (zoomFactor: number, point = { x: width / 2, y: height / 2 }) => {
      setMapView((current) => {
        const scale = clamp(current.scale * zoomFactor, minScale, maxScale);
        const ratio = scale / current.scale;
        return clampView({
          scale,
          x: point.x - (point.x - current.x) * ratio,
          y: point.y - (point.y - current.y) * ratio
        });
      });
    },
    [clampView, height, width]
  );

  const handleMapWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (!event.ctrlKey && !event.metaKey) {
        const rect = svgRef.current?.getBoundingClientRect();
        const unitX = rect ? width / rect.width : 1;
        const unitY = rect ? height / rect.height : 1;
        const isHorizontalPan = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
        const horizontalDelta = event.deltaX || event.deltaY;

        setMapView((current) =>
          clampView({
            ...current,
            x: isHorizontalPan ? current.x - horizontalDelta * unitX : current.x,
            y: isHorizontalPan ? current.y : current.y - event.deltaY * unitY
          })
        );
        return;
      }

      zoomAtPoint(Math.exp(-event.deltaY * 0.0012), pointFromEvent(event.clientX, event.clientY));
    },
    [clampView, pointFromEvent, zoomAtPoint]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    stage.addEventListener("wheel", handleMapWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleMapWheel);
  }, [handleMapWheel]);

  const handleMapPointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0 || !event.isPrimary) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: mapView.x,
        startY: mapView.y
      };
      setIsMapDragging(true);
    },
    [mapView.x, mapView.y]
  );

  const handleMapPointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      const svg = svgRef.current;
      if (!drag || drag.pointerId !== event.pointerId || !svg) {
        return;
      }

      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const dx = ((event.clientX - drag.startClientX) * width) / rect.width;
      const dy = ((event.clientY - drag.startClientY) * height) / rect.height;
      setMapView((current) =>
        clampView({
          ...current,
          x: drag.startX + dx,
          y: drag.startY + dy
        })
      );
    },
    [clampView, height, width]
  );

  const endDrag = useCallback((event: PointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragRef.current = null;
      setIsMapDragging(false);
    }
  }, []);

  const resetMapView = useCallback(() => {
    dragRef.current = null;
    setIsMapDragging(false);
    setMapView(clampView(initialMapView));
  }, [clampView, initialMapView]);

  const zoomIn = useCallback(() => zoomAtPoint(1.22), [zoomAtPoint]);
  const zoomOut = useCallback(() => zoomAtPoint(1 / 1.22), [zoomAtPoint]);

  return {
    canZoomIn: mapView.scale < maxScale - 0.01,
    canZoomOut: mapView.scale > minScale + 0.01,
    isMapDragging,
    mapView,
    mapInteractionProps: {
      onDoubleClick: resetMapView,
      onPointerCancel: endDrag,
      onPointerDown: handleMapPointerDown,
      onPointerMove: handleMapPointerMove,
      onPointerUp: endDrag
    },
    mapTransform: `translate(${mapView.x.toFixed(2)} ${mapView.y.toFixed(2)}) scale(${mapView.scale.toFixed(3)})`,
    resetMapView,
    stageRef,
    svgRef,
    zoomIn,
    zoomOut
  };
}
