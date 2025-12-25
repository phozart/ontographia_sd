// components/SDCanvas.js
// Custom lightweight canvas for System Dynamics diagrams
// No external dependencies - pure React + SVG

import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';

// Element type configurations
export const ELEMENT_TYPES = {
  variable: { shape: 'text', defaultLabel: 'Variable' },
  stock: { shape: 'rect', defaultLabel: 'Stock' },
  flow: { shape: 'valve', defaultLabel: 'Flow' },
  converter: { shape: 'circle', defaultLabel: 'Aux' },
  cloud: { shape: 'cloud', defaultLabel: '' },
  loop_r: { shape: 'loop', defaultLabel: 'R' },
  loop_b: { shape: 'loop', defaultLabel: 'B' },
};

// Available font families
export const FONT_FAMILIES = [
  { value: 'system-ui', label: 'System Default' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
  { value: 'Palatino Linotype, serif', label: 'Palatino' },
];

// Preset colors for blocks
export const BLOCK_COLORS = [
  { value: 'transparent', label: 'None', color: 'transparent' },
  { value: '#ffffff', label: 'White', color: '#ffffff' },
  { value: '#fef3c7', label: 'Amber', color: '#fef3c7' },
  { value: '#dcfce7', label: 'Green', color: '#dcfce7' },
  { value: '#dbeafe', label: 'Blue', color: '#dbeafe' },
  { value: '#fce7f3', label: 'Pink', color: '#fce7f3' },
  { value: '#f3e8ff', label: 'Purple', color: '#f3e8ff' },
  { value: '#fed7aa', label: 'Orange', color: '#fed7aa' },
  { value: '#e5e7eb', label: 'Gray', color: '#e5e7eb' },
  { value: '#fecaca', label: 'Red', color: '#fecaca' },
  { value: '#a5f3fc', label: 'Cyan', color: '#a5f3fc' },
];

const SDCanvas = forwardRef(function SDCanvas({
  model,
  onModelChange,
  selectedElement,
  onSelectElement,
  onAddElement,
  pendingPlacement = null,
  setPendingPlacement = null,
  readOnly = false,
  onCanvasReady = null, // Callback for when canvas methods are ready
}, ref) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Canvas state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null); // { x, y, canvasX, canvasY }
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Drag state
  const [dragging, setDragging] = useState(null); // { id, startX, startY, offsetX, offsetY }
  const [dragTarget, setDragTarget] = useState(null); // Node being dragged over

  // Connection curve dragging
  const [draggingCurve, setDraggingCurve] = useState(null); // { id, startY }

  // Connection creation by edge drag
  const [drawingConnection, setDrawingConnection] = useState(null); // { sourceId, startX, startY, currentX, currentY }

  // Resize state
  const [resizing, setResizing] = useState(null); // { id, corner, startX, startY, startWidth, startHeight }

  // Editing state
  const [editingLabel, setEditingLabel] = useState(null); // { id, x, y }

  // Connection popup state
  const [connectionPopup, setConnectionPopup] = useState(null); // { sourceId, targetId, x, y, sourceAnchor, targetAnchor }

  // Dragging connection endpoint
  const [draggingEndpoint, setDraggingEndpoint] = useState(null); // { connId, endpoint: 'source' | 'target', x, y }

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState(null); // copied element data

  // Track if we just finished panning (to prevent click after pan)
  const justPannedRef = useRef(false);
  // Track if we actually moved during pan (to distinguish click from drag)
  const didPanMoveRef = useRef(false);

  // Convert screen coords to canvas coords
  const screenToCanvas = useCallback((screenX, screenY) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Determine which anchor side of an element is closest to a point
  const getClosestAnchor = useCallback((element, pointX, pointY) => {
    const config = ELEMENT_TYPES[element.type] || ELEMENT_TYPES.variable;
    let width = element.width || 100;
    let height = element.height || 44;
    if (config.shape === 'text' && !element.width) { width = 80; height = 24; }
    else if (config.shape === 'valve' && !element.width) { width = 40; height = 34; }
    else if (config.shape === 'loop' && !element.width) { width = 44; height = 44; }
    else if (config.shape === 'cloud' && !element.width) { width = 50; height = 36; }
    else if (config.shape === 'circle' && !element.width) { width = 40; height = 40; }

    const halfW = width / 2;
    const halfH = height / 2;

    // Calculate distances to each side
    const anchors = {
      top: { x: element.x, y: element.y - halfH },
      bottom: { x: element.x, y: element.y + halfH },
      left: { x: element.x - halfW, y: element.y },
      right: { x: element.x + halfW, y: element.y },
    };

    let closest = 'right';
    let minDist = Infinity;
    for (const [side, pos] of Object.entries(anchors)) {
      const dist = Math.sqrt((pointX - pos.x) ** 2 + (pointY - pos.y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = side;
      }
    }
    return closest;
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    // Check if click is on canvas background
    const target = e.target;
    const isSvg = target === svgRef.current;
    const hasCanvasBgClass = target.classList && target.classList.contains('canvas-bg');
    const hasDataAttr = target.getAttribute && target.getAttribute('data-canvas-bg') === 'true';
    if (!isSvg && !hasCanvasBgClass && !hasDataAttr) return;

    // Skip if we just finished panning
    if (justPannedRef.current) {
      justPannedRef.current = false;
      return;
    }

    // Close any popup
    if (connectionPopup) {
      setConnectionPopup(null);
      return;
    }

    const pos = screenToCanvas(e.clientX, e.clientY);

    if (pendingPlacement) {
      onAddElement?.({ x: pos.x, y: pos.y });
    } else {
      onSelectElement?.(null);
    }
  }, [screenToCanvas, pendingPlacement, onAddElement, onSelectElement, connectionPopup]);

  // Handle canvas double-click
  const handleCanvasDoubleClick = useCallback((e) => {
    const target = e.target;
    const isSvg = target === svgRef.current;
    const hasCanvasBgClass = target.classList && target.classList.contains('canvas-bg');
    const hasDataAttr = target.getAttribute && target.getAttribute('data-canvas-bg') === 'true';
    if (!isSvg && !hasCanvasBgClass && !hasDataAttr) return;
    if (pendingPlacement) return;

    const pos = screenToCanvas(e.clientX, e.clientY);
    onAddElement?.({ x: pos.x, y: pos.y });
  }, [screenToCanvas, pendingPlacement, onAddElement]);

  // Handle pan start - left click on empty grid, middle click, or Alt+click
  const handlePanStart = useCallback((e) => {
    const target = e.target;
    const isSvg = target === svgRef.current;
    const hasCanvasBgClass = target.classList && target.classList.contains('canvas-bg');
    const hasDataAttr = target.getAttribute && target.getAttribute('data-canvas-bg') === 'true';
    if (!isSvg && !hasCanvasBgClass && !hasDataAttr) return;

    // Don't start panning if we're in placement mode - let click handler place the element
    if (pendingPlacement && e.button === 0) return;

    // Left click on grid (when not placing), middle click, or Alt+click all start panning
    if (e.button === 0 || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      didPanMoveRef.current = false; // Reset move tracker
    }
  }, [pan, pendingPlacement]);

  // Handle mouse move (pan + drag)
  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      didPanMoveRef.current = true; // Mark that we actually moved
      return;
    }

    // Dragging a connection endpoint to change anchor
    if (draggingEndpoint && model) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setDraggingEndpoint(prev => ({ ...prev, x: pos.x, y: pos.y }));
      return;
    }

    // Drawing a new connection
    if (drawingConnection && model) {
      const pos = screenToCanvas(e.clientX, e.clientY);

      // Check if hovering over a target node
      const targetNode = model.elements.find(el => {
        if (el.id === drawingConnection.sourceId) return false;
        const dx = Math.abs(el.x - pos.x);
        const dy = Math.abs(el.y - pos.y);
        return dx < 60 && dy < 40;
      });
      setDragTarget(targetNode?.id || null);

      setDrawingConnection(prev => ({
        ...prev,
        currentX: pos.x,
        currentY: pos.y,
      }));
      return;
    }

    if (dragging && model) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const newX = pos.x - dragging.offsetX;
      const newY = pos.y - dragging.offsetY;

      // Check if dragging over another node
      const targetNode = model.elements.find(el => {
        if (el.id === dragging.id) return false;
        const dx = Math.abs(el.x - newX);
        const dy = Math.abs(el.y - newY);
        return dx < 60 && dy < 40;
      });
      setDragTarget(targetNode?.id || null);

      // Update element position
      onModelChange?.({
        ...model,
        elements: model.elements.map(el =>
          el.id === dragging.id ? { ...el, x: newX, y: newY } : el
        ),
      });
    }

    if (draggingCurve && model) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const conn = model.connections.find(c => c.id === draggingCurve.id);
      if (conn) {
        const source = model.elements.find(el => el.id === conn.source);
        const target = model.elements.find(el => el.id === conn.target);
        if (source && target) {
          // Calculate perpendicular distance for curve
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const perpX = -dy / len;
          const perpY = dx / len;
          const offsetX = pos.x - midX;
          const offsetY = pos.y - midY;
          const curve = Math.round(offsetX * perpX + offsetY * perpY);

          onModelChange?.({
            ...model,
            connections: model.connections.map(c =>
              c.id === draggingCurve.id ? { ...c, curve: Math.max(-200, Math.min(200, curve)) } : c
            ),
          });
        }
      }
    }

    // Handle resizing
    if (resizing && model) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const el = model.elements.find(el => el.id === resizing.id);
      if (el) {
        const deltaX = pos.x - resizing.startX;
        const deltaY = pos.y - resizing.startY;

        let newWidth = resizing.startWidth;
        let newHeight = resizing.startHeight;

        // Calculate new size based on which corner is being dragged
        if (resizing.corner.includes('e')) newWidth = Math.max(60, resizing.startWidth + deltaX * 2);
        if (resizing.corner.includes('w')) newWidth = Math.max(60, resizing.startWidth - deltaX * 2);
        if (resizing.corner.includes('s')) newHeight = Math.max(30, resizing.startHeight + deltaY * 2);
        if (resizing.corner.includes('n')) newHeight = Math.max(30, resizing.startHeight - deltaY * 2);

        onModelChange?.({
          ...model,
          elements: model.elements.map(elem =>
            elem.id === resizing.id ? { ...elem, width: newWidth, height: newHeight } : elem
          ),
        });
      }
    }
  }, [isPanning, panStart, dragging, draggingCurve, drawingConnection, draggingEndpoint, resizing, model, screenToCanvas, onModelChange]);

  // Handle mouse up
  const handleMouseUp = useCallback((e) => {
    // Completing endpoint drag - update the anchor
    if (draggingEndpoint && model) {
      const conn = model.connections.find(c => c.id === draggingEndpoint.connId);
      if (conn) {
        const elementId = draggingEndpoint.endpoint === 'source' ? conn.source : conn.target;
        const element = model.elements.find(el => el.id === elementId);
        if (element) {
          const newAnchor = getClosestAnchor(element, draggingEndpoint.x, draggingEndpoint.y);
          const anchorKey = draggingEndpoint.endpoint === 'source' ? 'sourceAnchor' : 'targetAnchor';
          onModelChange?.({
            ...model,
            connections: model.connections.map(c =>
              c.id === conn.id ? { ...c, [anchorKey]: newAnchor } : c
            ),
          });
        }
      }
      setDraggingEndpoint(null);
      return;
    }

    // Completing a drawn connection
    if (drawingConnection && dragTarget && model) {
      const sourceEl = model.elements.find(el => el.id === drawingConnection.sourceId);
      const targetEl = model.elements.find(el => el.id === dragTarget);
      if (sourceEl && targetEl) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          // Use 'auto' anchors by default - they'll be calculated dynamically
          setConnectionPopup({
            sourceId: drawingConnection.sourceId,
            targetId: dragTarget,
            sourceAnchor: 'auto',
            targetAnchor: 'auto',
            x: rect.left + pan.x + targetEl.x * zoom,
            y: rect.top + pan.y + targetEl.y * zoom - 40,
          });
        }
      }
      setDrawingConnection(null);
      setDragTarget(null);
      return;
    }

    if (drawingConnection) {
      setDrawingConnection(null);
      setDragTarget(null);
      return;
    }

    if (dragging && dragTarget && model) {
      // Dropped on another node - show connection type popup
      const sourceEl = model.elements.find(el => el.id === dragging.id);
      const targetEl = model.elements.find(el => el.id === dragTarget);
      if (sourceEl && targetEl) {
        // Reset dragged element position
        onModelChange?.({
          ...model,
          elements: model.elements.map(el =>
            el.id === dragging.id ? { ...el, x: dragging.startX, y: dragging.startY } : el
          ),
        });

        // Show popup at target element position - use 'auto' anchors by default
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setConnectionPopup({
            sourceId: dragging.id,
            targetId: dragTarget,
            sourceAnchor: 'auto',
            targetAnchor: 'auto',
            x: rect.left + pan.x + targetEl.x * zoom,
            y: rect.top + pan.y + targetEl.y * zoom - 40,
          });
        }
      }
    }
    // Set flag if we were panning AND actually moved to prevent click handler
    if (isPanning && didPanMoveRef.current) {
      justPannedRef.current = true;
    }
    setIsPanning(false);
    setDragging(null);
    setDragTarget(null);
    setDraggingCurve(null);
    setResizing(null);
    setDraggingEndpoint(null);
  }, [dragging, dragTarget, drawingConnection, draggingEndpoint, isPanning, model, onModelChange, pan, zoom, getClosestAnchor]);

  // Create connection with selected type
  const handleCreateConnection = useCallback((type) => {
    if (!connectionPopup || !model) return;

    const newConn = {
      id: `conn-${Date.now()}`,
      source: connectionPopup.sourceId,
      target: connectionPopup.targetId,
      type,
      curve: 50,
      sourceAnchor: connectionPopup.sourceAnchor || 'auto',
      targetAnchor: connectionPopup.targetAnchor || 'auto',
    };

    onModelChange?.({
      ...model,
      connections: [...model.connections, newConn],
    });

    setConnectionPopup(null);
  }, [connectionPopup, model, onModelChange]);

  // Handle wheel zoom and pan - needs to be attached as non-passive to prevent browser zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); // This works because we use { passive: false }

      // Pinch-to-zoom (trackpad) or Ctrl+scroll
      if (e.ctrlKey || e.metaKey) {
        const rect = container.getBoundingClientRect();
        // Mouse position relative to container
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate zoom factor
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

        setZoom(prevZoom => {
          const newZoom = Math.max(0.05, Math.min(5, prevZoom * zoomFactor));
          const actualFactor = newZoom / prevZoom;

          // Adjust pan to keep the point under the mouse fixed
          setPan(prevPan => ({
            x: mouseX - (mouseX - prevPan.x) * actualFactor,
            y: mouseY - (mouseY - prevPan.y) * actualFactor,
          }));

          return newZoom;
        });
      } else {
        // Regular scroll = pan
        setPan(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY,
        }));
      }
    };

    // Add as non-passive to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Element drag start
  const handleElementMouseDown = useCallback((e, element) => {
    if (readOnly) return;
    e.stopPropagation();

    const pos = screenToCanvas(e.clientX, e.clientY);
    setDragging({
      id: element.id,
      startX: element.x,
      startY: element.y,
      offsetX: pos.x - element.x,
      offsetY: pos.y - element.y,
    });
    onSelectElement?.({ elementType: 'node', ...element });
  }, [readOnly, screenToCanvas, onSelectElement]);

  // Start drawing a connection from element edge
  const handleEdgeDragStart = useCallback((e, element) => {
    if (readOnly) return;
    e.stopPropagation();

    const pos = screenToCanvas(e.clientX, e.clientY);
    setDrawingConnection({
      sourceId: element.id,
      startX: element.x,
      startY: element.y,
      currentX: pos.x,
      currentY: pos.y,
    });
  }, [readOnly, screenToCanvas]);

  // Start resizing an element
  const handleResizeStart = useCallback((e, element, corner) => {
    if (readOnly) return;
    e.stopPropagation();

    const pos = screenToCanvas(e.clientX, e.clientY);
    const config = ELEMENT_TYPES[element.type] || ELEMENT_TYPES.variable;

    // Default sizes based on type
    let defaultWidth = 100;
    let defaultHeight = 44;
    if (config.shape === 'text') { defaultWidth = 80; defaultHeight = 24; }
    else if (config.shape === 'valve') { defaultWidth = 40; defaultHeight = 34; }
    else if (config.shape === 'loop') { defaultWidth = 40; defaultHeight = 40; }
    else if (config.shape === 'cloud') { defaultWidth = 50; defaultHeight = 36; }

    setResizing({
      id: element.id,
      corner,
      startX: pos.x,
      startY: pos.y,
      startWidth: element.width || defaultWidth,
      startHeight: element.height || defaultHeight,
    });
  }, [readOnly, screenToCanvas]);

  // Element double-click for label editing
  const handleElementDoubleClick = useCallback((e, element) => {
    if (readOnly) return;
    if (element.type === 'loop_r' || element.type === 'loop_b' || element.type === 'cloud') return;
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setEditingLabel({
      id: element.id,
      x: rect.left + pan.x + element.x * zoom,
      y: rect.top + pan.y + element.y * zoom,
    });
  }, [readOnly, pan, zoom]);

  // Save label
  const handleLabelSave = useCallback((newLabel) => {
    if (editingLabel && model) {
      onModelChange?.({
        ...model,
        elements: model.elements.map(el =>
          el.id === editingLabel.id ? { ...el, label: newLabel } : el
        ),
      });
    }
    setEditingLabel(null);
  }, [editingLabel, model, onModelChange]);

  // Connection click
  const handleConnectionClick = useCallback((e, conn) => {
    e.stopPropagation();
    onSelectElement?.({ elementType: 'edge', ...conn });
  }, [onSelectElement]);

  // Connection curve drag start
  const handleConnectionMouseDown = useCallback((e, conn) => {
    if (readOnly) return;
    e.stopPropagation();
    setDraggingCurve({ id: conn.id });
  }, [readOnly]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement && selectedElement.elementType !== 'edge' && model) {
        e.preventDefault();
        const el = model.elements.find(el => el.id === selectedElement.id);
        if (el) {
          setClipboard({ ...el });
        }
        return;
      }

      // Paste (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard && model) {
        e.preventDefault();
        const newElement = {
          ...clipboard,
          id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: clipboard.x + 30,
          y: clipboard.y + 30,
        };
        onModelChange?.({
          ...model,
          elements: [...model.elements, newElement],
        });
        // Update clipboard position for next paste
        setClipboard({ ...clipboard, x: clipboard.x + 30, y: clipboard.y + 30 });
        // Select the new element
        onSelectElement?.({ elementType: 'node', ...newElement });
        return;
      }

      // Duplicate (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement && selectedElement.elementType !== 'edge' && model) {
        e.preventDefault();
        const el = model.elements.find(el => el.id === selectedElement.id);
        if (el) {
          const newElement = {
            ...el,
            id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: el.x + 30,
            y: el.y + 30,
          };
          onModelChange?.({
            ...model,
            elements: [...model.elements, newElement],
          });
          onSelectElement?.({ elementType: 'node', ...newElement });
        }
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && model) {
        e.preventDefault();
        if (selectedElement.elementType === 'edge') {
          onModelChange?.({
            ...model,
            connections: model.connections.filter(c => c.id !== selectedElement.id),
          });
        } else {
          onModelChange?.({
            ...model,
            elements: model.elements.filter(el => el.id !== selectedElement.id),
            connections: model.connections.filter(c =>
              c.source !== selectedElement.id && c.target !== selectedElement.id
            ),
          });
        }
        onSelectElement?.(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, model, onModelChange, onSelectElement, clipboard]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(z => Math.min(5, z * 1.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(z => Math.max(0.05, z / 1.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const fitToContent = useCallback(() => {
    if (!model?.elements?.length || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const padding = 50;

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    model.elements.forEach(el => {
      minX = Math.min(minX, el.x - 60);
      minY = Math.min(minY, el.y - 30);
      maxX = Math.max(maxX, el.x + 60);
      maxY = Math.max(maxY, el.y + 30);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = (rect.width - padding * 2) / contentWidth;
    const scaleY = (rect.height - padding * 2) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom,
    });
  }, [model]);

  // Export functions
  const generateSVGContent = useCallback((background = 'white') => {
    if (!model?.elements?.length) return null;

    // Calculate bounding box with padding
    const padding = 50;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    model.elements.forEach(el => {
      const config = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.variable;
      let w = el.width || 100, h = el.height || 44;
      if (config.shape === 'text' && !el.width) { w = 80; h = 24; }
      else if (config.shape === 'loop' && !el.width) { w = 44; h = 44; }
      else if (config.shape === 'cloud' && !el.width) { w = 50; h = 36; }
      else if (config.shape === 'valve' && !el.width) { w = 40; h = 34; }

      minX = Math.min(minX, el.x - w/2 - 20);
      minY = Math.min(minY, el.y - h/2 - 20);
      maxX = Math.max(maxX, el.x + w/2 + 20);
      maxY = Math.max(maxY, el.y + h/2 + 20);
    });

    const width = Math.max(200, maxX - minX + padding * 2);
    const height = Math.max(150, maxY - minY + padding * 2);
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    // Background fill based on option
    let bgFill = '';
    if (background === 'white') {
      bgFill = '<rect width="100%" height="100%" fill="#ffffff"/>';
    } else if (background === 'gray') {
      bgFill = '<rect width="100%" height="100%" fill="#fafafa"/>';
    }
    // transparent = no fill

    // Helper to get element dimensions
    const getElDims = (el) => {
      const config = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.variable;
      let w = el.width || 100, h = el.height || 44;
      if (config.shape === 'text' && !el.width) { w = 80; h = 24; }
      else if (config.shape === 'loop' && !el.width) { w = 44; h = 44; }
      else if (config.shape === 'cloud' && !el.width) { w = 50; h = 36; }
      else if (config.shape === 'valve' && !el.width) { w = 40; h = 34; }
      else if (config.shape === 'circle' && !el.width) { w = 40; h = 40; }
      return { w, h, halfW: w/2, halfH: h/2 };
    };

    // Generate elements with custom styling
    const elementsMarkup = model.elements.map(el => {
      const config = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.variable;
      const x = el.x + offsetX;
      const y = el.y + offsetY;
      const { w, h, halfW, halfH } = getElDims(el);

      // Get custom styles
      const fillColor = el.fillColor || (config.shape === 'text' ? 'transparent' : '#fafafa');
      const strokeColor = el.strokeColor || '#475569';
      const fontSize = el.fontSize || Math.min(13, h * 0.4);
      const fontFamily = el.fontFamily || 'system-ui, -apple-system, sans-serif';
      const fontWeight = el.fontWeight || (config.shape === 'text' ? '600' : '500');
      const fontStyle = el.fontStyle || 'normal';
      const textColor = el.textColor || '#1e293b';

      if (config.shape === 'text') {
        let bg = '';
        if (fillColor !== 'transparent') {
          bg = `<rect x="${x - halfW}" y="${y - halfH}" width="${w}" height="${h}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1" rx="4"/>`;
        }
        return `${bg}<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${textColor}" font-family="${fontFamily}">${el.label || config.defaultLabel}</text>`;
      }
      if (config.shape === 'rect') {
        return `<g transform="translate(${x}, ${y})">
          <rect x="${-halfW}" y="${-halfH}" width="${w}" height="${h}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" rx="2"/>
          <rect x="${-halfW + 3}" y="${-halfH + 3}" width="${w - 6}" height="${h - 6}" fill="none" stroke="${strokeColor}" stroke-width="0.5" rx="1"/>
          <text text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${textColor}" font-family="${fontFamily}">${el.label || config.defaultLabel}</text>
        </g>`;
      }
      if (config.shape === 'valve') {
        return `<g transform="translate(${x}, ${y})">
          <path d="M ${-halfW} ${-halfH} L ${halfW} ${-halfH} L ${halfW * 0.3} 0 L ${halfW} ${halfH} L ${-halfW} ${halfH} L ${-halfW * 0.3} 0 Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>
          <text text-anchor="middle" dominant-baseline="middle" font-size="${fontSize * 0.85}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${textColor}" font-family="${fontFamily}">${el.label || config.defaultLabel}</text>
        </g>`;
      }
      if (config.shape === 'circle') {
        const r = Math.min(halfW, halfH);
        return `<g transform="translate(${x}, ${y})">
          <circle cx="0" cy="0" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>
          <text text-anchor="middle" dominant-baseline="middle" font-size="${fontSize * 0.85}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${textColor}" font-family="${fontFamily}">${el.label || config.defaultLabel}</text>
        </g>`;
      }
      if (config.shape === 'cloud') {
        const cw = halfW * 0.9;
        const ch = halfH * 0.85;
        const cloudFill = el.fillColor || '#f1f5f9';
        return `<path transform="translate(${x}, ${y})" d="M ${-cw * 0.6} ${ch * 0.5} Q ${-cw} ${ch * 0.3} ${-cw * 0.8} ${-ch * 0.1} Q ${-cw * 0.9} ${-ch * 0.6} ${-cw * 0.4} ${-ch * 0.7} Q ${-cw * 0.2} ${-ch} ${cw * 0.1} ${-ch * 0.8} Q ${cw * 0.5} ${-ch * 0.9} ${cw * 0.7} ${-ch * 0.5} Q ${cw} ${-ch * 0.3} ${cw * 0.9} ${ch * 0.1} Q ${cw} ${ch * 0.5} ${cw * 0.6} ${ch * 0.6} Q ${cw * 0.3} ${ch * 0.8} 0 ${ch * 0.6} Q ${-cw * 0.3} ${ch * 0.8} ${-cw * 0.6} ${ch * 0.5} Z" fill="${cloudFill}" stroke="${strokeColor}" stroke-width="1.5" stroke-linejoin="round"/>`;
      }
      if (config.shape === 'loop') {
        const letter = el.type === 'loop_r' ? 'R' : 'B';
        const arrowPath = el.type === 'loop_r'
          ? `M ${halfW * 0.6} ${-halfH * 0.7} A ${halfW * 0.9} ${halfH * 0.9} 0 1 1 ${-halfW * 0.7} ${halfH * 0.5}`
          : `M ${-halfW * 0.6} ${-halfH * 0.7} A ${halfW * 0.9} ${halfH * 0.9} 0 1 0 ${halfW * 0.7} ${halfH * 0.5}`;
        return `<g transform="translate(${x}, ${y})">
          <path d="${arrowPath}" fill="none" stroke="${strokeColor}" stroke-width="1.5" marker-end="url(#export-loop-arrow)"/>
          <text text-anchor="middle" dominant-baseline="middle" font-size="${fontSize * 1.2}" font-weight="700" fill="${textColor}" font-family="${fontFamily}">${letter}</text>
        </g>`;
      }
      return '';
    }).join('\n');

    // Helper to get edge point for export (with anchor support)
    const getExportEdgePoint = (element, targetX, targetY, offX, offY, anchor = 'auto') => {
      const config = ELEMENT_TYPES[element.type] || ELEMENT_TYPES.variable;
      const elX = element.x + offX;
      const elY = element.y + offY;
      const { halfW, halfH } = getElDims(element);

      // If anchor is specified (not auto), use fixed position
      if (anchor && anchor !== 'auto') {
        switch (anchor) {
          case 'top':
            return { x: elX, y: elY - halfH };
          case 'bottom':
            return { x: elX, y: elY + halfH };
          case 'left':
            return { x: elX - halfW, y: elY };
          case 'right':
            return { x: elX + halfW, y: elY };
        }
      }

      const dx = targetX - elX;
      const dy = targetY - elY;
      const angle = Math.atan2(dy, dx);

      if (config.shape === 'loop' || config.shape === 'cloud' || config.shape === 'circle') {
        const r = config.shape === 'circle' ? Math.min(halfW, halfH) : halfW;
        const ry = config.shape === 'circle' ? r : halfH;
        return { x: elX + Math.cos(angle) * r, y: elY + Math.sin(angle) * ry };
      }

      const absAngle = Math.abs(angle);
      const cornerAngle = Math.atan2(halfH, halfW);
      let edgeX, edgeY;
      if (absAngle < cornerAngle || absAngle > Math.PI - cornerAngle) {
        edgeX = dx > 0 ? halfW : -halfW;
        edgeY = edgeX * Math.tan(angle);
      } else {
        edgeY = dy > 0 ? halfH : -halfH;
        edgeX = edgeY / Math.tan(angle);
      }
      return { x: elX + edgeX, y: elY + edgeY };
    };

    // Generate connections
    const connectionsMarkup = model.connections.map(conn => {
      const source = model.elements.find(el => el.id === conn.source);
      const target = model.elements.find(el => el.id === conn.target);
      if (!source || !target) return '';

      const curve = conn.curve ?? 80;
      const sx = source.x + offsetX;
      const sy = source.y + offsetY;
      const tx = target.x + offsetX;
      const ty = target.y + offsetY;

      const dx = tx - sx;
      const dy = ty - sy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const perpX = -dy / len;
      const perpY = dx / len;

      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2;
      const ctrlX = midX + perpX * curve;
      const ctrlY = midY + perpY * curve;

      const sourceEdge = getExportEdgePoint(source, ctrlX, ctrlY, offsetX, offsetY, conn.sourceAnchor);
      const targetEdge = getExportEdgePoint(target, ctrlX, ctrlY, offsetX, offsetY, conn.targetAnchor);

      const toTarget = { x: targetEdge.x - ctrlX, y: targetEdge.y - ctrlY };
      const toLen = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y) || 1;
      const endX = targetEdge.x - (toTarget.x / toLen) * 8;
      const endY = targetEdge.y - (toTarget.y / toLen) * 8;

      const pathD = `M ${sourceEdge.x} ${sourceEdge.y} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

      // Line style - solid, dashed, or dotted (default based on type for backwards compat)
      const lineStyle = conn.lineStyle || (conn.type === 'negative' ? 'dashed' : 'solid');
      const strokeDasharray = lineStyle === 'dashed' ? '6,4' : lineStyle === 'dotted' ? '2,3' : '';
      const strokeWidth = conn.strokeWidth || 1.5;
      const polarityLabel = conn.type === 'positive' ? '+' : conn.type === 'negative' ? '−' : '';

      // Label near arrow
      const t = 0.75;
      const labelX = (1-t)*(1-t)*sourceEdge.x + 2*(1-t)*t*ctrlX + t*t*endX + perpX * 12;
      const labelY = (1-t)*(1-t)*sourceEdge.y + 2*(1-t)*t*ctrlY + t*t*endY + perpY * 12;

      // Delay markers
      let delayMarkup = '';
      if (conn.hasDelay) {
        const td = 0.4;
        const delayX = (1-td)*(1-td)*sourceEdge.x + 2*(1-td)*td*ctrlX + td*td*endX;
        const delayY = (1-td)*(1-td)*sourceEdge.y + 2*(1-td)*td*ctrlY + td*td*endY;
        const tangentX = 2*(1-td)*(ctrlX - sourceEdge.x) + 2*td*(endX - ctrlX);
        const tangentY = 2*(1-td)*(ctrlY - sourceEdge.y) + 2*td*(endY - ctrlY);
        const tangentLen = Math.sqrt(tangentX*tangentX + tangentY*tangentY) || 1;
        const perpDelayX = -tangentY / tangentLen;
        const perpDelayY = tangentX / tangentLen;
        const lineLen = 8;
        const gap = 3;
        delayMarkup = `
          <line x1="${delayX + perpDelayX * lineLen - tangentX/tangentLen * gap/2}" y1="${delayY + perpDelayY * lineLen - tangentY/tangentLen * gap/2}" x2="${delayX - perpDelayX * lineLen - tangentX/tangentLen * gap/2}" y2="${delayY - perpDelayY * lineLen - tangentY/tangentLen * gap/2}" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
          <line x1="${delayX + perpDelayX * lineLen + tangentX/tangentLen * gap/2}" y1="${delayY + perpDelayY * lineLen + tangentY/tangentLen * gap/2}" x2="${delayX - perpDelayX * lineLen + tangentX/tangentLen * gap/2}" y2="${delayY - perpDelayY * lineLen + tangentY/tangentLen * gap/2}" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
        `;
      }

      return `<g>
        <path d="${pathD}" fill="none" stroke="#475569" stroke-width="${strokeWidth}" ${strokeDasharray ? `stroke-dasharray="${strokeDasharray}"` : ''} marker-end="url(#export-arrow)"/>
        <text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="#475569" font-family="system-ui, -apple-system, sans-serif">${polarityLabel}</text>
        ${delayMarkup}
      </g>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="export-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
      <polygon points="0 0, 10 4, 0 8" fill="#475569"/>
    </marker>
    <marker id="export-loop-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#475569"/>
    </marker>
  </defs>
  ${bgFill}
  ${connectionsMarkup}
  ${elementsMarkup}
</svg>`;
  }, [model]);

  const exportSVG = useCallback((filename = 'diagram', background = 'white') => {
    const svgContent = generateSVGContent(background);
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateSVGContent]);

  const exportPNG = useCallback((filename = 'diagram', background = 'white') => {
    const svgContent = generateSVGContent(background);
    if (!svgContent) return;

    // Parse SVG to get dimensions
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = svgDoc.documentElement;
    const width = parseInt(svgEl.getAttribute('width')) || 800;
    const height = parseInt(svgEl.getAttribute('height')) || 600;

    // Create canvas and draw
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x for higher resolution
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Fill background first
    if (background === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else if (background === 'gray') {
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, width, height);
    }
    // transparent = no fill (will be transparent in PNG)

    const img = new Image();
    // Encode SVG properly for image src
    const svgBase64 = btoa(unescape(encodeURIComponent(svgContent)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };

    img.onerror = (err) => {
      console.error('Error loading SVG for PNG export:', err);
    };

    img.src = dataUrl;
  }, [generateSVGContent]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    exportSVG,
    exportPNG,
    getZoom: () => zoom,
  }), [zoomIn, zoomOut, resetZoom, fitToContent, exportSVG, exportPNG, zoom]);

  // Also notify parent via callback when methods are ready (workaround for dynamic import ref issues)
  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady({
        zoomIn,
        zoomOut,
        resetZoom,
        fitToContent,
        exportSVG,
        exportPNG,
        getZoom: () => zoom,
      });
    }
  }, [onCanvasReady, zoomIn, zoomOut, resetZoom, fitToContent, exportSVG, exportPNG, zoom]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const pos = screenToCanvas(e.clientX, e.clientY);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      canvasX: pos.x,
      canvasY: pos.y,
    });
  }, [screenToCanvas]);

  // Close context menu on click elsewhere or escape
  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e) => {
      // Check if click is outside the context menu
      const menu = document.querySelector('.context-menu');
      if (menu && !menu.contains(e.target)) {
        setContextMenu(null);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };

    // Add listener after a small delay to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleEscape);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu]);

  // Context menu add element
  const handleContextAdd = useCallback((type) => {
    if (contextMenu) {
      onAddElement?.({ x: contextMenu.canvasX, y: contextMenu.canvasY }, type);
      setContextMenu(null);
    }
  }, [contextMenu, onAddElement]);

  // Render element
  const renderElement = (el) => {
    const isSelected = selectedElement?.id === el.id;
    const isDragTarget = dragTarget === el.id;
    const config = ELEMENT_TYPES[el.type] || ELEMENT_TYPES.variable;
    const showHandles = isSelected && !readOnly;

    // Get element dimensions (with defaults)
    let width = el.width || 100;
    let height = el.height || 44;
    if (config.shape === 'text' && !el.width) { width = 80; height = 24; }
    else if (config.shape === 'valve' && !el.width) { width = 40; height = 34; }
    else if (config.shape === 'loop' && !el.width) { width = 44; height = 44; }
    else if (config.shape === 'cloud' && !el.width) { width = 50; height = 36; }

    const halfW = width / 2;
    const halfH = height / 2;

    return (
      <g
        key={el.id}
        transform={`translate(${el.x}, ${el.y})`}
        onMouseDown={(e) => handleElementMouseDown(e, el)}
        onDoubleClick={(e) => handleElementDoubleClick(e, el)}
        style={{ cursor: readOnly ? 'default' : 'grab' }}
        className="element"
      >
        {/* Selection/hover indicator */}
        {(isSelected || isDragTarget) && (
          <rect
            x={-halfW - 8}
            y={-halfH - 8}
            width={width + 16}
            height={height + 16}
            fill="none"
            stroke={isDragTarget ? '#22c55e' : '#3b82f6'}
            strokeWidth={2}
            strokeDasharray={isDragTarget ? '4,4' : 'none'}
            rx={8}
          />
        )}

        {/* Resize handles - shown when selected (corner squares) */}
        {showHandles && config.shape !== 'loop' && (
          <>
            {/* SE corner */}
            <rect
              x={halfW + 2}
              y={halfH + 2}
              width={8}
              height={8}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={1}
              style={{ cursor: 'se-resize' }}
              onMouseDown={(e) => handleResizeStart(e, el, 'se')}
            />
            {/* SW corner */}
            <rect
              x={-halfW - 10}
              y={halfH + 2}
              width={8}
              height={8}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={1}
              style={{ cursor: 'sw-resize' }}
              onMouseDown={(e) => handleResizeStart(e, el, 'sw')}
            />
            {/* NE corner */}
            <rect
              x={halfW + 2}
              y={-halfH - 10}
              width={8}
              height={8}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={1}
              style={{ cursor: 'ne-resize' }}
              onMouseDown={(e) => handleResizeStart(e, el, 'ne')}
            />
            {/* NW corner */}
            <rect
              x={-halfW - 10}
              y={-halfH - 10}
              width={8}
              height={8}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={1}
              style={{ cursor: 'nw-resize' }}
              onMouseDown={(e) => handleResizeStart(e, el, 'nw')}
            />
          </>
        )}

        {/* Connection handles - shown when selected (edge circles) */}
        {showHandles && (
          <>
            {/* Right handle */}
            <circle
              cx={halfW + 6}
              cy={0}
              r={5}
              fill="#22c55e"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handleEdgeDragStart(e, el)}
            />
            {/* Left handle */}
            <circle
              cx={-halfW - 6}
              cy={0}
              r={5}
              fill="#22c55e"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handleEdgeDragStart(e, el)}
            />
            {/* Top handle */}
            <circle
              cx={0}
              cy={-halfH - 6}
              r={5}
              fill="#22c55e"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handleEdgeDragStart(e, el)}
            />
            {/* Bottom handle */}
            <circle
              cx={0}
              cy={halfH + 6}
              r={5}
              fill="#22c55e"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handleEdgeDragStart(e, el)}
            />
          </>
        )}

        {/* Element shape - with custom styling support */}
        {(() => {
          // Get custom styles from element
          const fillColor = el.fillColor || (config.shape === 'text' ? 'transparent' : '#fafafa');
          const strokeColor = el.strokeColor || '#475569';
          const fontSize = el.fontSize || Math.min(13, height * 0.4);
          const fontFamily = el.fontFamily || 'system-ui, -apple-system, sans-serif';
          const fontWeight = el.fontWeight || (config.shape === 'text' ? '600' : '500');
          const fontStyle = el.fontStyle || 'normal';
          const textColor = el.textColor || '#1e293b';

          if (config.shape === 'text') {
            return (
              <>
                {/* Background for variable if colored */}
                {fillColor !== 'transparent' && (
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={width}
                    height={height}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={1}
                    rx={4}
                  />
                )}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fontStyle={fontStyle}
                  fontFamily={fontFamily}
                  fill={textColor}
                >
                  {el.label || config.defaultLabel}
                </text>
              </>
            );
          }

          if (config.shape === 'rect') {
            return (
              <>
                {/* Stock - double-lined rectangle for accumulation */}
                <rect
                  x={-halfW}
                  y={-halfH}
                  width={width}
                  height={height}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={2}
                  rx={2}
                />
                <rect
                  x={-halfW + 3}
                  y={-halfH + 3}
                  width={width - 6}
                  height={height - 6}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={0.5}
                  rx={1}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fontStyle={fontStyle}
                  fontFamily={fontFamily}
                  fill={textColor}
                >
                  {el.label || config.defaultLabel}
                </text>
              </>
            );
          }

          if (config.shape === 'valve') {
            return (
              <>
                {/* Flow/Valve - hourglass/bowtie shape */}
                <path
                  d={`M ${-halfW} ${-halfH}
                      L ${halfW} ${-halfH}
                      L ${halfW * 0.3} 0
                      L ${halfW} ${halfH}
                      L ${-halfW} ${halfH}
                      L ${-halfW * 0.3} 0
                      Z`}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize * 0.85}
                  fontWeight={fontWeight}
                  fontStyle={fontStyle}
                  fontFamily={fontFamily}
                  fill={textColor}
                >
                  {el.label || config.defaultLabel}
                </text>
              </>
            );
          }

          if (config.shape === 'circle') {
            return (
              <>
                {/* Auxiliary/Converter - circle */}
                <circle
                  cx={0}
                  cy={0}
                  r={Math.min(halfW, halfH)}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize * 0.85}
                  fontWeight={fontWeight}
                  fontStyle={fontStyle}
                  fontFamily={fontFamily}
                  fill={textColor}
                >
                  {el.label || config.defaultLabel}
                </text>
              </>
            );
          }

          if (config.shape === 'cloud') {
            // Real cloud shape using bezier curves
            const cw = halfW * 0.9;
            const ch = halfH * 0.85;
            return (
              <path
                d={`M ${-cw * 0.6} ${ch * 0.5}
                    Q ${-cw} ${ch * 0.3} ${-cw * 0.8} ${-ch * 0.1}
                    Q ${-cw * 0.9} ${-ch * 0.6} ${-cw * 0.4} ${-ch * 0.7}
                    Q ${-cw * 0.2} ${-ch} ${cw * 0.1} ${-ch * 0.8}
                    Q ${cw * 0.5} ${-ch * 0.9} ${cw * 0.7} ${-ch * 0.5}
                    Q ${cw} ${-ch * 0.3} ${cw * 0.9} ${ch * 0.1}
                    Q ${cw} ${ch * 0.5} ${cw * 0.6} ${ch * 0.6}
                    Q ${cw * 0.3} ${ch * 0.8} ${0} ${ch * 0.6}
                    Q ${-cw * 0.3} ${ch * 0.8} ${-cw * 0.6} ${ch * 0.5}
                    Z`}
                fill={el.fillColor || '#f1f5f9'}
                stroke={strokeColor}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            );
          }

          if (config.shape === 'loop') {
            return (
              <>
                {/* Curved arrow around the letter */}
                {el.type === 'loop_r' ? (
                  <path
                    d={`M ${halfW * 0.6} ${-halfH * 0.7} A ${halfW * 0.9} ${halfH * 0.9} 0 1 1 ${-halfW * 0.7} ${halfH * 0.5}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    markerEnd="url(#loop-arrow)"
                  />
                ) : (
                  <path
                    d={`M ${-halfW * 0.6} ${-halfH * 0.7} A ${halfW * 0.9} ${halfH * 0.9} 0 1 0 ${halfW * 0.7} ${halfH * 0.5}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    markerEnd="url(#loop-arrow)"
                  />
                )}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={fontSize * 1.2}
                  fontWeight="700"
                  fontFamily={fontFamily}
                  fill={textColor}
                >
                  {el.type === 'loop_r' ? 'R' : 'B'}
                </text>
              </>
            );
          }

          return null;
        })()}
      </g>
    );
  };

  // Calculate edge intersection point for an element
  // anchor can be 'top', 'bottom', 'left', 'right', or 'auto' (default)
  const getEdgePoint = (element, targetX, targetY, anchor = 'auto') => {
    const config = ELEMENT_TYPES[element.type] || ELEMENT_TYPES.variable;

    // Get element dimensions (with defaults)
    let width = element.width || 100;
    let height = element.height || 44;
    if (config.shape === 'text' && !element.width) { width = 80; height = 24; }
    else if (config.shape === 'valve' && !element.width) { width = 40; height = 34; }
    else if (config.shape === 'loop' && !element.width) { width = 44; height = 44; }
    else if (config.shape === 'cloud' && !element.width) { width = 50; height = 36; }
    else if (config.shape === 'circle' && !element.width) { width = 40; height = 40; }

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // If anchor is specified (not auto), use fixed position
    if (anchor && anchor !== 'auto') {
      switch (anchor) {
        case 'top':
          return { x: element.x, y: element.y - halfHeight };
        case 'bottom':
          return { x: element.x, y: element.y + halfHeight };
        case 'left':
          return { x: element.x - halfWidth, y: element.y };
        case 'right':
          return { x: element.x + halfWidth, y: element.y };
      }
    }

    // Auto-calculate based on direction to target
    const dx = targetX - element.x;
    const dy = targetY - element.y;
    const angle = Math.atan2(dy, dx);

    if (config.shape === 'loop' || config.shape === 'cloud' || config.shape === 'circle') {
      // Ellipse/circle - use parametric form
      const r = config.shape === 'circle' ? Math.min(halfWidth, halfHeight) : halfWidth;
      const ry = config.shape === 'circle' ? r : halfHeight;
      return {
        x: element.x + Math.cos(angle) * r,
        y: element.y + Math.sin(angle) * ry,
      };
    }

    // Rectangle edge intersection
    const absAngle = Math.abs(angle);
    const cornerAngle = Math.atan2(halfHeight, halfWidth);

    let edgeX, edgeY;
    if (absAngle < cornerAngle || absAngle > Math.PI - cornerAngle) {
      // Hit left or right edge
      edgeX = dx > 0 ? halfWidth : -halfWidth;
      edgeY = edgeX * Math.tan(angle);
    } else {
      // Hit top or bottom edge
      edgeY = dy > 0 ? halfHeight : -halfHeight;
      edgeX = edgeY / Math.tan(angle);
    }

    return {
      x: element.x + edgeX,
      y: element.y + edgeY,
    };
  };

  // Start dragging a connection endpoint
  const handleEndpointDragStart = useCallback((e, conn, endpoint) => {
    if (readOnly) return;
    e.stopPropagation();

    const pos = screenToCanvas(e.clientX, e.clientY);
    setDraggingEndpoint({
      connId: conn.id,
      endpoint, // 'source' or 'target'
      x: pos.x,
      y: pos.y,
    });
  }, [readOnly, screenToCanvas]);

  // Render connection
  const renderConnection = (conn) => {
    const source = model?.elements.find(el => el.id === conn.source);
    const target = model?.elements.find(el => el.id === conn.target);
    if (!source || !target) return null;

    const isSelected = selectedElement?.id === conn.id;
    const curve = conn.curve ?? 80; // Larger default curve

    // Calculate direction and curve control point
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;

    // Control point for the curve
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    const ctrlX = midX + perpX * curve;
    const ctrlY = midY + perpY * curve;

    // Get edge points using anchors if specified
    const sourceEdge = getEdgePoint(source, ctrlX, ctrlY, conn.sourceAnchor);
    const targetEdge = getEdgePoint(target, ctrlX, ctrlY, conn.targetAnchor);

    // Arrow offset from target edge
    const toTarget = { x: targetEdge.x - ctrlX, y: targetEdge.y - ctrlY };
    const toLen = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y) || 1;
    const arrowOffset = 8;
    const endX = targetEdge.x - (toTarget.x / toLen) * arrowOffset;
    const endY = targetEdge.y - (toTarget.y / toLen) * arrowOffset;

    const pathD = `M ${sourceEdge.x} ${sourceEdge.y} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

    // Line style - solid, dashed, or dotted (default based on type for backwards compat)
    const lineStyle = conn.lineStyle || (conn.type === 'negative' ? 'dashed' : 'solid');
    const strokeDasharray = lineStyle === 'dashed' ? '6,4' : lineStyle === 'dotted' ? '2,3' : 'none';

    // Line thickness - default 1.5
    const strokeWidth = conn.strokeWidth || 1.5;

    // Position label near the arrow (at 80% along the curve toward target)
    const t = 0.75;
    const labelX = (1-t)*(1-t)*sourceEdge.x + 2*(1-t)*t*ctrlX + t*t*endX;
    const labelY = (1-t)*(1-t)*sourceEdge.y + 2*(1-t)*t*ctrlY + t*t*endY;
    // Offset label perpendicular to the curve
    const labelOffsetX = perpX * 12;
    const labelOffsetY = perpY * 12;

    return (
      <g key={conn.id} className="connection">
        {/* Invisible wider path for easier clicking */}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          style={{ cursor: readOnly ? 'default' : 'grab' }}
          onClick={(e) => handleConnectionClick(e, conn)}
          onMouseDown={(e) => handleConnectionMouseDown(e, conn)}
        />
        {/* Visible path */}
        <path
          d={pathD}
          fill="none"
          stroke={isSelected ? '#3b82f6' : '#475569'}
          strokeWidth={isSelected ? strokeWidth + 0.5 : strokeWidth}
          strokeDasharray={strokeDasharray}
          markerEnd="url(#arrowhead)"
          style={{ pointerEvents: 'none' }}
        />
        {/* Polarity label - near the arrow */}
        <text
          x={labelX + labelOffsetX}
          y={labelY + labelOffsetY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="700"
          fill="#475569"
        >
          {conn.type === 'positive' ? '+' : conn.type === 'negative' ? '−' : ''}
        </text>
        {/* Delay markers (||) - shown at t=0.4 along the curve */}
        {conn.hasDelay && (() => {
          const td = 0.4;
          const delayX = (1-td)*(1-td)*sourceEdge.x + 2*(1-td)*td*ctrlX + td*td*endX;
          const delayY = (1-td)*(1-td)*sourceEdge.y + 2*(1-td)*td*ctrlY + td*td*endY;
          // Calculate tangent at this point
          const tangentX = 2*(1-td)*(ctrlX - sourceEdge.x) + 2*td*(endX - ctrlX);
          const tangentY = 2*(1-td)*(ctrlY - sourceEdge.y) + 2*td*(endY - ctrlY);
          const tangentLen = Math.sqrt(tangentX*tangentX + tangentY*tangentY) || 1;
          // Perpendicular to tangent
          const perpDelayX = -tangentY / tangentLen;
          const perpDelayY = tangentX / tangentLen;
          const lineLen = 8;
          const gap = 3;
          return (
            <>
              {/* First delay line */}
              <line
                x1={delayX + perpDelayX * lineLen - tangentX/tangentLen * gap/2}
                y1={delayY + perpDelayY * lineLen - tangentY/tangentLen * gap/2}
                x2={delayX - perpDelayX * lineLen - tangentX/tangentLen * gap/2}
                y2={delayY - perpDelayY * lineLen - tangentY/tangentLen * gap/2}
                stroke={isSelected ? '#3b82f6' : '#475569'}
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* Second delay line */}
              <line
                x1={delayX + perpDelayX * lineLen + tangentX/tangentLen * gap/2}
                y1={delayY + perpDelayY * lineLen + tangentY/tangentLen * gap/2}
                x2={delayX - perpDelayX * lineLen + tangentX/tangentLen * gap/2}
                y2={delayY - perpDelayY * lineLen + tangentY/tangentLen * gap/2}
                stroke={isSelected ? '#3b82f6' : '#475569'}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </>
          );
        })()}
        {/* Draggable endpoint handles when selected */}
        {isSelected && !readOnly && (
          <>
            {/* Source endpoint handle */}
            <circle
              cx={sourceEdge.x}
              cy={sourceEdge.y}
              r={6}
              fill="#f59e0b"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'move' }}
              onMouseDown={(e) => handleEndpointDragStart(e, conn, 'source')}
            />
            {/* Target endpoint handle */}
            <circle
              cx={endX}
              cy={endY}
              r={6}
              fill="#f59e0b"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'move' }}
              onMouseDown={(e) => handleEndpointDragStart(e, conn, 'target')}
            />
          </>
        )}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`sd-canvas ${pendingPlacement ? 'placement-mode' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handlePanStart}
        style={{ cursor: pendingPlacement ? 'crosshair' : isPanning ? 'grabbing' : 'default' }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse">
            <path
              d={`M ${20 * zoom} 0 L 0 0 0 ${20 * zoom}`}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1"
            />
          </pattern>
          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="8"
            refX="9"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 10 4, 0 8" fill="#475569" />
          </marker>
          {/* Blue arrow marker for drawing connections */}
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="8"
            refX="9"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 10 4, 0 8" fill="#3b82f6" />
          </marker>
          {/* Arrow marker for loop indicators */}
          <marker
            id="loop-arrow"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#475569" />
          </marker>
        </defs>

        {/* Background with grid */}
        <rect
          className="canvas-bg"
          data-canvas-bg="true"
          width="100%"
          height="100%"
          fill="#fafafa"
        />
        <rect
          className="canvas-bg"
          data-canvas-bg="true"
          width="100%"
          height="100%"
          fill="url(#grid)"
        />

        {/* Main transform group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Connections (behind elements) */}
          {model?.connections?.map(renderConnection)}

          {/* Connection being drawn */}
          {drawingConnection && (
            <g className="drawing-connection">
              <line
                x1={drawingConnection.startX}
                y1={drawingConnection.startY}
                x2={drawingConnection.currentX}
                y2={drawingConnection.currentY}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6,4"
                markerEnd="url(#arrowhead-blue)"
              />
            </g>
          )}

          {/* Elements */}
          {model?.elements?.map(renderElement)}
        </g>
      </svg>

      {/* Placement mode indicator */}
      {pendingPlacement && (
        <div className="placement-indicator">
          Click to place {pendingPlacement}
          <span className="esc-hint">ESC to cancel</span>
        </div>
      )}

      {/* Inline label editor */}
      {editingLabel && (
        <div
          className="label-editor"
          style={{
            left: editingLabel.x,
            top: editingLabel.y,
          }}
        >
          <input
            type="text"
            autoFocus
            defaultValue={model?.elements.find(el => el.id === editingLabel.id)?.label || ''}
            onBlur={(e) => handleLabelSave(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLabelSave(e.target.value);
              if (e.key === 'Escape') setEditingLabel(null);
            }}
          />
        </div>
      )}

      {/* Connection type popup */}
      {connectionPopup && (
        <div
          className="connection-popup"
          style={{
            left: connectionPopup.x,
            top: connectionPopup.y,
          }}
        >
          <button
            className="conn-btn positive"
            onClick={() => handleCreateConnection('positive')}
          >
            + Positive
          </button>
          <button
            className="conn-btn negative"
            onClick={() => handleCreateConnection('negative')}
          >
            − Negative
          </button>
          <button
            className="conn-btn neutral"
            onClick={() => handleCreateConnection('neutral')}
          >
            ○ Neutral
          </button>
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <div className="context-menu-section">
            <div className="context-menu-label">Add Element</div>
            <button onClick={() => handleContextAdd('variable')}>
              <span className="ctx-icon">V</span> Variable
            </button>
            <button onClick={() => handleContextAdd('stock')}>
              <span className="ctx-icon">▭</span> Stock
            </button>
            <button onClick={() => handleContextAdd('flow')}>
              <span className="ctx-icon">⟿</span> Flow
            </button>
            <button onClick={() => handleContextAdd('cloud')}>
              <span className="ctx-icon">☁</span> Cloud
            </button>
          </div>
          <div className="context-menu-divider" />
          <div className="context-menu-section">
            <div className="context-menu-label">Loop Markers</div>
            <button onClick={() => handleContextAdd('loop_r')}>
              <span className="ctx-icon loop">R</span> Reinforcing
            </button>
            <button onClick={() => handleContextAdd('loop_b')}>
              <span className="ctx-icon loop">B</span> Balancing
            </button>
          </div>
          <div className="context-menu-divider" />
          <div className="context-menu-section">
            <button onClick={() => { zoomIn(); setContextMenu(null); }}>
              <span className="ctx-icon">+</span> Zoom In
            </button>
            <button onClick={() => { zoomOut(); setContextMenu(null); }}>
              <span className="ctx-icon">−</span> Zoom Out
            </button>
            <button onClick={() => { fitToContent(); setContextMenu(null); }}>
              <span className="ctx-icon">⊡</span> Fit to Content
            </button>
            <button onClick={() => { resetZoom(); setContextMenu(null); }}>
              <span className="ctx-icon">↺</span> Reset View
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .sd-canvas {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 4px;
        }

        .sd-canvas.placement-mode {
          outline: 2px dashed #3b82f6;
          outline-offset: -2px;
        }

        .placement-indicator {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .placement-indicator .esc-hint {
          font-size: 11px;
          opacity: 0.6;
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .label-editor {
          position: fixed;
          transform: translate(-50%, -50%);
          z-index: 200;
        }

        .label-editor input {
          padding: 6px 12px;
          font-size: 14px;
          border: 2px solid #3b82f6;
          border-radius: 4px;
          outline: none;
          min-width: 120px;
          text-align: center;
        }

        .connection-popup {
          position: fixed;
          transform: translate(-50%, -100%);
          display: flex;
          gap: 8px;
          background: white;
          padding: 8px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          z-index: 200;
        }

        .conn-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .conn-btn.positive {
          background: #dcfce7;
          color: #166534;
        }

        .conn-btn.positive:hover {
          background: #bbf7d0;
        }

        .conn-btn.negative {
          background: #fee2e2;
          color: #991b1b;
        }

        .conn-btn.negative:hover {
          background: #fecaca;
        }

        .conn-btn.neutral {
          background: #f1f5f9;
          color: #475569;
        }

        .conn-btn.neutral:hover {
          background: #e2e8f0;
        }

        .element {
          user-select: none;
        }

        .connection {
          user-select: none;
        }

        .context-menu {
          position: fixed;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 8px 0;
          min-width: 180px;
          z-index: 300;
        }

        .context-menu-section {
          padding: 4px 0;
        }

        .context-menu-label {
          padding: 4px 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
        }

        .context-menu button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
          text-align: left;
        }

        .context-menu button:hover {
          background: #f1f5f9;
        }

        .ctx-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          background: #64748b;
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .ctx-icon.loop {
          border-radius: 50%;
          background: #3b82f6;
        }

        .context-menu-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 6px 0;
        }
      `}</style>
    </div>
  );
});

export default SDCanvas;
