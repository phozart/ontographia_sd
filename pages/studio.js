// pages/studio.js
// System Dynamics Studio - Main workspace

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import {
  getSavedModels,
  saveModel,
  deleteModel,
  getModel,
  getCurrentModelId,
  setCurrentModelId,
  exportModel,
  importModel,
  createNewModel,
  generateModelId,
} from '../lib/storage';
import { getAllExamples, getExample, EXAMPLE_DOMAINS } from '../lib/examples';
import { FONT_FAMILIES, BLOCK_COLORS } from '../components/SDCanvas';
import SDGuideModal from '../components/SDGuideModal';

// MUI Icons
import Logo from '../components/Logo';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CloseIcon from '@mui/icons-material/Close';
import LoopIcon from '@mui/icons-material/Loop';
import TimelineIcon from '@mui/icons-material/Timeline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

// Dynamic import for canvas (client-side only)
const SDCanvas = dynamic(() => import('../components/SDCanvas'), { ssr: false });

// Combined element palette - all elements available
const ELEMENT_PALETTE = [
  { type: 'variable', name: 'Variable', color: '#64748b', icon: 'V', desc: 'CLD variable', shortcut: 'V' },
  { type: 'stock', name: 'Stock', color: '#475569', icon: '▭', desc: 'Accumulation', shortcut: 'S' },
  { type: 'flow', name: 'Flow', color: '#64748b', icon: '⟿', desc: 'Rate of change', shortcut: 'F' },
  { type: 'converter', name: 'Auxiliary', color: '#94a3b8', icon: '◯', desc: 'Helper variable', shortcut: 'A' },
  { type: 'cloud', name: 'Cloud', color: '#cbd5e1', icon: '☁', desc: 'Source/Sink', shortcut: 'C' },
];

// Loop markers palette
const LOOP_MARKERS = [
  { type: 'loop_r', name: 'Reinforcing', color: '#3b82f6', icon: 'R', desc: 'Reinforcing loop (R)', shortcut: 'R' },
  { type: 'loop_b', name: 'Balancing', color: '#64748b', icon: 'B', desc: 'Balancing loop (B)', shortcut: 'B' },
];

// Connection types - all available
const CONNECTION_TYPES = [
  { type: 'positive', name: '+', label: 'Positive (+)', desc: 'Same direction', style: 'solid' },
  { type: 'negative', name: '−', label: 'Negative (−)', desc: 'Opposite direction', style: 'dashed' },
  { type: 'flow_pipe', name: '→', label: 'Flow', desc: 'Material flow', style: 'solid' },
  { type: 'connector', name: '⋯', label: 'Info Link', desc: 'Information', style: 'dashed' },
];

export default function Studio() {
  // Model state
  const [model, setModel] = useState(null);
  const [savedModels, setSavedModels] = useState([]);
  const [diagramType, setDiagramType] = useState('cld');

  // UI state
  const [selectedElement, setSelectedElement] = useState(null);
  const [connectMode, setConnectMode] = useState(null);
  const [connectSource, setConnectSource] = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pendingPlacement, setPendingPlacement] = useState(null); // Element type waiting to be placed
  const [exportBackground, setExportBackground] = useState('white'); // white, transparent, gray
  const [showGuide, setShowGuide] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Canvas methods (received via callback due to dynamic import ref issues)
  const [canvasMethods, setCanvasMethods] = useState(null);

  // Load saved models on mount
  useEffect(() => {
    const models = getSavedModels();
    setSavedModels(models);

    // Load current model or create new
    const currentId = getCurrentModelId();
    if (currentId) {
      const current = getModel(currentId);
      if (current) {
        setModel(current);
        setDiagramType(current.type || 'cld');
        return;
      }
    }

    // Create new model if none exists
    const newModel = createNewModel('Untitled Model', 'cld');
    setModel(newModel);
    setCurrentModelId(newModel.id);
  }, []);

  // Save to history for undo/redo
  const pushHistory = useCallback((newModel) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.stringify(newModel));
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Handle model changes
  const handleModelChange = useCallback((newModel) => {
    setModel(newModel);
    pushHistory(newModel);
  }, [pushHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setModel(JSON.parse(history[historyIndex - 1]));
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setModel(JSON.parse(history[historyIndex + 1]));
    }
  }, [history, historyIndex]);

  // Save model
  const handleSave = useCallback(() => {
    if (!model) return;
    const success = saveModel(model);
    if (success) {
      setSavedModels(getSavedModels());
      showNotification('Model saved!', 'success');
    } else {
      showNotification('Failed to save model', 'error');
    }
  }, [model]);

  // Create new model
  const handleNew = useCallback((type = 'cld') => {
    const newModel = createNewModel('Untitled Model', type);
    setModel(newModel);
    setDiagramType(type);
    setCurrentModelId(newModel.id);
    setHistory([]);
    setHistoryIndex(-1);
    setShowModels(false);
  }, []);

  // Clear canvas (reset current model)
  const handleClearCanvas = useCallback(() => {
    if (!model) return;
    if (model.elements.length === 0 && model.connections.length === 0) return;

    if (window.confirm('Clear all elements from the canvas? This cannot be undone.')) {
      handleModelChange({
        ...model,
        elements: [],
        connections: [],
        loops: [],
      });
      setSelectedElement(null);
      showNotification('Canvas cleared', 'success');
    }
  }, [model, handleModelChange]);

  // Load model
  const handleLoadModel = useCallback((loadedModel) => {
    setModel(loadedModel);
    setDiagramType(loadedModel.type || 'cld');
    setCurrentModelId(loadedModel.id);
    setHistory([]);
    setHistoryIndex(-1);
    setShowModels(false);
    showNotification('Model loaded!', 'success');
  }, []);

  // Delete model
  const handleDeleteModel = useCallback((modelId) => {
    if (window.confirm('Delete this model? This cannot be undone.')) {
      deleteModel(modelId);
      setSavedModels(getSavedModels());
      if (model?.id === modelId) {
        handleNew('cld');
      }
      showNotification('Model deleted', 'success');
    }
  }, [model, handleNew]);

  // Load example
  const handleLoadExample = useCallback((example) => {
    const newModel = {
      id: generateModelId(),
      name: example.name,
      type: example.type,
      description: example.description,
      elements: example.elements || [],
      connections: example.connections || [],
      loops: example.loops || [],
      annotations: [],
      isExample: true,
      exampleId: example.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setModel(newModel);
    setDiagramType(example.type);
    setCurrentModelId(newModel.id);
    setHistory([]);
    setHistoryIndex(-1);
    setShowExamples(false);
    showNotification(`Loaded: ${example.name}`, 'success');
  }, []);

  // Export model
  const handleExport = useCallback(() => {
    if (model) {
      exportModel(model);
      showNotification('Model exported!', 'success');
    }
  }, [model]);

  // Import model
  const handleImport = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importModel(file);
      handleLoadModel(imported);
      showNotification('Model imported!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }

    event.target.value = '';
  }, [handleLoadModel]);

  // Add element to canvas
  const handleAddElement = useCallback((position, elementType = null) => {
    if (!model) return;

    // Use provided type, pending placement, or default
    const type = elementType || pendingPlacement || (diagramType === 'cld' ? 'variable' : 'stock');

    // Get label based on type
    const allItems = [...ELEMENT_PALETTE, ...LOOP_MARKERS];
    const itemConfig = allItems.find(item => item.type === type);
    const label = itemConfig?.name || 'New Element';

    const newElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label,
      x: position.x,
      y: position.y,
    };

    handleModelChange({
      ...model,
      elements: [...model.elements, newElement],
    });

    // Clear pending placement after adding
    if (pendingPlacement) {
      setPendingPlacement(null);
    }
  }, [model, diagramType, handleModelChange, pendingPlacement]);

  // Start connection mode
  const handleStartConnect = useCallback((type) => {
    if (selectedElement && selectedElement.type === 'node') {
      setConnectMode(type);
      setConnectSource(selectedElement.id);
      showNotification(`Click another element to connect with ${type}`, 'info');
    } else {
      showNotification('Select an element first', 'warning');
    }
  }, [selectedElement]);

  // Handle element selection (for connections via toolbar)
  const handleSelectElement = useCallback((element) => {
    if (connectMode && connectSource && element && element.type === 'node') {
      // Create connection
      const newConnection = {
        id: `conn-${Date.now()}`,
        source: connectSource,
        target: element.id,
        type: connectMode,
      };

      handleModelChange({
        ...model,
        connections: [...model.connections, newConnection],
      });

      setConnectMode(null);
      setConnectSource(null);
      showNotification('Connection created!', 'success');
    } else {
      setSelectedElement(element);
    }
  }, [connectMode, connectSource, model, handleModelChange]);

  // Handle connection creation from drag-to-connect
  const handleCreateConnection = useCallback(({ source, target, type }) => {
    if (!model) return;

    const newConnection = {
      id: `conn-${Date.now()}`,
      source,
      target,
      type,
    };

    handleModelChange({
      ...model,
      connections: [...model.connections, newConnection],
    });

    showNotification('Connection created!', 'success');
  }, [model, handleModelChange]);

  // Delete selected element
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElement || !model) return;

    if (selectedElement.elementType === 'node') {
      handleModelChange({
        ...model,
        elements: model.elements.filter(el => el.id !== selectedElement.id),
        connections: model.connections.filter(
          conn => conn.source !== selectedElement.id && conn.target !== selectedElement.id
        ),
      });
    } else if (selectedElement.elementType === 'edge') {
      handleModelChange({
        ...model,
        connections: model.connections.filter(conn => conn.id !== selectedElement.id),
      });
    }

    setSelectedElement(null);
    showNotification('Deleted!', 'success');
  }, [selectedElement, model, handleModelChange]);

  // Update element label
  const handleUpdateLabel = useCallback((newLabel) => {
    if (!selectedElement || !model) return;

    handleModelChange({
      ...model,
      elements: model.elements.map(el =>
        el.id === selectedElement.id ? { ...el, label: newLabel } : el
      ),
    });
  }, [selectedElement, model, handleModelChange]);

  // Update element property (for formatting options)
  const handleUpdateElementProperty = useCallback((property, value) => {
    if (!selectedElement || !model) return;

    handleModelChange({
      ...model,
      elements: model.elements.map(el =>
        el.id === selectedElement.id ? { ...el, [property]: value } : el
      ),
    });
  }, [selectedElement, model, handleModelChange]);

  // Get selected element data
  const selectedElementData = useMemo(() => {
    if (!selectedElement || !model || selectedElement.elementType === 'edge') return null;
    return model.elements.find(el => el.id === selectedElement.id);
  }, [selectedElement, model]);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Modifier key shortcuts
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
        return;
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
        return;
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement) {
          e.preventDefault();
          handleDeleteSelected();
        }
        return;
      } else if (e.key === 'Escape') {
        setConnectMode(null);
        setConnectSource(null);
        setSelectedElement(null);
        return;
      }

      // Don't trigger shortcuts if modifier keys are held
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Escape cancels placement mode
      if (e.key === 'Escape' && pendingPlacement) {
        e.preventDefault();
        setPendingPlacement(null);
        return;
      }

      // Element shortcuts (single key presses) - activate placement mode
      const key = e.key.toUpperCase();
      const allItems = [...ELEMENT_PALETTE, ...LOOP_MARKERS];
      const matchedItem = allItems.find(item => item.shortcut === key);

      if (matchedItem) {
        e.preventDefault();
        setPendingPlacement(matchedItem.type);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, undo, redo, selectedElement, handleDeleteSelected, pendingPlacement]);

  // Use combined palette
  const palette = ELEMENT_PALETTE;

  return (
    <>
      <Head>
        <title>{`${model?.name || 'Studio'} - Systems Thinking Studio`}</title>
        <meta name="description" content="Systems thinking and dynamics modeling studio by Ontographia" />
      </Head>

      <div className="studio-container">
        {/* Header */}
        <header className="studio-header">
          <div className="header-left">
            <Link href="/" className="logo-link">
              <div className="logo">
                <Logo size={28} />
                <div className="logo-text">
                  <span className="logo-brand">Ontographia</span>
                  <span className="logo-product">Systems Thinking</span>
                </div>
              </div>
            </Link>

            <div className="model-info">
              {editingName ? (
                <input
                  type="text"
                  className="model-name-input"
                  value={model?.name || ''}
                  onChange={(e) => setModel({ ...model, name: e.target.value })}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                  autoFocus
                />
              ) : (
                <h1 className="model-name" onClick={() => setEditingName(true)}>
                  {model?.name || 'Untitled'}
                  <EditIcon fontSize="small" />
                </h1>
              )}
              <span className="diagram-type">{diagramType === 'cld' ? 'Causal Loop Diagram' : 'Stock & Flow'}</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-btn" onClick={() => setShowExamples(true)} title="Examples">
              <MenuBookIcon />
              <span>Examples</span>
            </button>
            <button className="header-btn" onClick={() => setShowModels(true)} title="My Models">
              <FolderOpenIcon />
              <span>My Models</span>
            </button>
            <button className="header-btn primary" onClick={handleSave} title="Save (Ctrl+S)">
              <SaveIcon />
              <span>Save</span>
            </button>
            <button className="header-btn" onClick={() => setShowGuide(true)} title="Systems Thinking Guide">
              <HelpOutlineIcon />
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="studio-main">
          {/* Left Toolbar */}
          <div className="left-toolbar">
            <div className="toolbar-section">
              <div className="toolbar-label">Elements</div>
              {palette.map((item) => (
                <button
                  key={item.type}
                  className={`palette-btn ${pendingPlacement === item.type ? 'active' : ''}`}
                  onClick={() => setPendingPlacement(pendingPlacement === item.type ? null : item.type)}
                  title={`${item.name} - ${item.desc} [${item.shortcut}]`}
                  style={{ '--accent': item.color }}
                >
                  <span className="palette-icon">{item.icon}</span>
                  <span className="palette-name">{item.name}</span>
                  <span className="palette-shortcut">{item.shortcut}</span>
                </button>
              ))}
            </div>

            <div className="toolbar-section">
              <div className="toolbar-label">Loop Markers</div>
              {LOOP_MARKERS.map((item) => (
                <button
                  key={item.type}
                  className={`palette-btn ${pendingPlacement === item.type ? 'active' : ''}`}
                  onClick={() => setPendingPlacement(pendingPlacement === item.type ? null : item.type)}
                  title={`${item.name} - ${item.desc} [${item.shortcut}]`}
                  style={{ '--accent': item.color }}
                >
                  <span className="palette-icon loop-icon">{item.icon}</span>
                  <span className="palette-name">{item.name}</span>
                  <span className="palette-shortcut">{item.shortcut}</span>
                </button>
              ))}
            </div>

            <div className="toolbar-section">
              <div className="toolbar-label">Connect</div>
              <div className="toolbar-hint">
                <strong>Click element</strong>
                then drag from edge handles to connect
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="canvas-container">
            {model && (
              <SDCanvas
                ref={canvasRef}
                model={model}
                onModelChange={handleModelChange}
                selectedElement={selectedElement}
                onSelectElement={handleSelectElement}
                onAddElement={handleAddElement}
                pendingPlacement={pendingPlacement}
                setPendingPlacement={setPendingPlacement}
                onCanvasReady={setCanvasMethods}
              />
            )}

            {/* Canvas toolbar */}
            <div className="canvas-toolbar">
              <button onClick={() => canvasMethods?.zoomIn?.()} title="Zoom In">
                <ZoomInIcon />
              </button>
              <button onClick={() => canvasMethods?.zoomOut?.()} title="Zoom Out">
                <ZoomOutIcon />
              </button>
              <button onClick={() => canvasMethods?.fitToContent?.()} title="Fit to Content">
                <CenterFocusStrongIcon />
              </button>
              <div className="toolbar-divider" />
              <button onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
                <UndoIcon />
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)">
                <RedoIcon />
              </button>
              <div className="toolbar-divider" />
              <button onClick={handleDeleteSelected} disabled={!selectedElement} title="Delete Selected">
                <DeleteIcon />
              </button>
            </div>

            {/* Connect mode indicator */}
            {connectMode && (
              <div className="connect-indicator">
                Click another element to connect, or press Escape to cancel
              </div>
            )}
          </div>

          {/* Right Panel - Properties */}
          <div className="right-panel">
            <h3>Properties</h3>
            {selectedElement ? (
              <div className="property-form">
                <div className="property-group">
                  <label>Type</label>
                  <div className="property-value">
                    {selectedElement.elementType === 'edge' ? 'Connection' : (selectedElement.type || 'Element')}
                  </div>
                </div>
                {selectedElement.elementType !== 'edge' && selectedElementData && (
                  <>
                    <div className="property-group">
                      <label>Label</label>
                      <input
                        type="text"
                        value={selectedElementData.label || ''}
                        onChange={(e) => handleUpdateLabel(e.target.value)}
                        placeholder="Enter label..."
                      />
                    </div>

                    {/* Text Formatting */}
                    <div className="property-group">
                      <label>Text Style</label>
                      <div className="format-row">
                        <button
                          className={`format-btn ${selectedElementData.fontWeight === 'bold' ? 'active' : ''}`}
                          onClick={() => handleUpdateElementProperty('fontWeight', selectedElementData.fontWeight === 'bold' ? 'normal' : 'bold')}
                          title="Bold"
                        >
                          <FormatBoldIcon fontSize="small" />
                        </button>
                        <button
                          className={`format-btn ${selectedElementData.fontStyle === 'italic' ? 'active' : ''}`}
                          onClick={() => handleUpdateElementProperty('fontStyle', selectedElementData.fontStyle === 'italic' ? 'normal' : 'italic')}
                          title="Italic"
                        >
                          <FormatItalicIcon fontSize="small" />
                        </button>
                        <select
                          className="size-select"
                          value={selectedElementData.fontSize || 13}
                          onChange={(e) => handleUpdateElementProperty('fontSize', parseInt(e.target.value))}
                          title="Font Size"
                        >
                          {[8, 10, 12, 13, 14, 16, 18, 20, 24, 28, 32].map(size => (
                            <option key={size} value={size}>{size}px</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Font Family */}
                    <div className="property-group">
                      <label>Font</label>
                      <select
                        className="font-select"
                        value={selectedElementData.fontFamily || 'system-ui'}
                        onChange={(e) => handleUpdateElementProperty('fontFamily', e.target.value)}
                      >
                        {FONT_FAMILIES.map(font => (
                          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Block Color */}
                    <div className="property-group">
                      <label>Block Color</label>
                      <div className="color-grid">
                        {BLOCK_COLORS.map(color => (
                          <button
                            key={color.value}
                            className={`color-btn ${selectedElementData.fillColor === color.value ? 'active' : ''}`}
                            style={{
                              background: color.value === 'transparent'
                                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
                                : color.color,
                              backgroundSize: color.value === 'transparent' ? '8px 8px' : 'auto',
                              backgroundPosition: color.value === 'transparent' ? '0 0, 4px 4px' : 'auto',
                            }}
                            onClick={() => handleUpdateElementProperty('fillColor', color.value)}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Copy/Duplicate actions */}
                    <div className="property-group">
                      <label>Actions</label>
                      <div className="action-row">
                        <button className="action-btn" onClick={() => {
                          const el = model?.elements.find(e => e.id === selectedElement.id);
                          if (el) {
                            const newEl = { ...el, id: `el-${Date.now()}`, x: el.x + 30, y: el.y + 30 };
                            handleModelChange({ ...model, elements: [...model.elements, newEl] });
                            showNotification('Element duplicated!', 'success');
                          }
                        }} title="Duplicate (Ctrl+D)">
                          <ContentCopyIcon fontSize="small" /> Duplicate
                        </button>
                      </div>
                    </div>

                    <button className="delete-btn" onClick={handleDeleteSelected}>
                      <DeleteIcon /> Delete Element
                    </button>
                  </>
                )}
                {selectedElement.elementType === 'edge' && (
                  <>
                    <p className="hint" style={{ marginBottom: 12 }}>Drag the arrow to adjust its curve</p>
                    <p className="hint" style={{ marginBottom: 12 }}>Drag orange handles to change anchor points</p>

                    {/* Delay toggle for connections */}
                    <div className="property-group">
                      <label>Time Delay</label>
                      <button
                        className={`delay-toggle ${model?.connections.find(c => c.id === selectedElement.id)?.hasDelay ? 'active' : ''}`}
                        onClick={() => {
                          const conn = model?.connections.find(c => c.id === selectedElement.id);
                          if (conn) {
                            handleModelChange({
                              ...model,
                              connections: model.connections.map(c =>
                                c.id === conn.id ? { ...c, hasDelay: !c.hasDelay } : c
                              ),
                            });
                          }
                        }}
                      >
                        <span className="delay-icon">||</span>
                        {model?.connections.find(c => c.id === selectedElement.id)?.hasDelay ? 'Delay On' : 'Add Delay'}
                      </button>
                    </div>

                    <button className="delete-btn" onClick={handleDeleteSelected}>
                      <DeleteIcon /> Delete Connection
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="no-selection">
                <p>Direct manipulation:</p>
                <p className="hint">Click element → drag handles to connect</p>
                <p className="hint">Double-click to edit labels</p>
                <p className="hint">Drag arrow to adjust curve</p>
                <p className="hint">Ctrl+C/V to copy/paste</p>
                <p className="hint">Ctrl+D to duplicate</p>
                <p className="hint">Delete key to remove</p>
              </div>
            )}

            {/* Model stats */}
            <div className="model-stats">
              <h4>Model Stats</h4>
              <div className="stat-row">
                <span>Elements:</span>
                <span>{model?.elements?.length || 0}</span>
              </div>
              <div className="stat-row">
                <span>Connections:</span>
                <span>{model?.connections?.length || 0}</span>
              </div>
              <div className="stat-row">
                <span>Loops:</span>
                <span>{model?.loops?.length || 0}</span>
              </div>
            </div>

            {/* Export/Import */}
            <div className="io-section">
              <div className="io-label">Export Background</div>
              <div className="bg-selector">
                <button
                  className={`bg-option ${exportBackground === 'white' ? 'active' : ''}`}
                  onClick={() => setExportBackground('white')}
                  title="White background"
                >
                  <span className="bg-preview white"></span>
                  White
                </button>
                <button
                  className={`bg-option ${exportBackground === 'transparent' ? 'active' : ''}`}
                  onClick={() => setExportBackground('transparent')}
                  title="Transparent background"
                >
                  <span className="bg-preview transparent"></span>
                  Clear
                </button>
                <button
                  className={`bg-option ${exportBackground === 'gray' ? 'active' : ''}`}
                  onClick={() => setExportBackground('gray')}
                  title="Gray background (matches canvas)"
                >
                  <span className="bg-preview gray"></span>
                  Gray
                </button>
              </div>
              <div className="io-label">Export Diagram</div>
              <div className="io-row">
                <button className="io-btn" onClick={() => canvasMethods?.exportPNG?.(model?.name || 'diagram', exportBackground)} title="Export as PNG image">
                  <ImageIcon /> PNG
                </button>
                <button className="io-btn" onClick={() => canvasMethods?.exportSVG?.(model?.name || 'diagram', exportBackground)} title="Export as SVG vector">
                  <CodeIcon /> SVG
                </button>
              </div>
              <div className="io-label">Model Data</div>
              <div className="io-row">
                <button className="io-btn" onClick={handleExport} title="Export model as JSON">
                  <DownloadIcon /> JSON
                </button>
                <button className="io-btn" onClick={() => fileInputRef.current?.click()} title="Import model from JSON">
                  <UploadIcon /> Import
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImport}
              />
              <div className="io-divider" />
              <button className="io-btn danger full" onClick={handleClearCanvas} title="Clear all elements from canvas">
                <DeleteIcon /> Clear Canvas
              </button>
            </div>
          </div>
        </div>

        {/* Examples Modal */}
        {showExamples && (
          <div className="modal-backdrop" onClick={() => setShowExamples(false)}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><MenuBookIcon /> Examples Library</h2>
                <button className="close-btn" onClick={() => setShowExamples(false)}>
                  <CloseIcon />
                </button>
              </div>
              <div className="examples-grid">
                {getAllExamples().map((example) => (
                  <div key={example.id} className="example-card" onClick={() => handleLoadExample(example)}>
                    <div className="example-badges">
                      <span className="domain-badge" style={{ background: EXAMPLE_DOMAINS[example.domain]?.color }}>
                        {EXAMPLE_DOMAINS[example.domain]?.name}
                      </span>
                      <span className={`difficulty-badge ${example.difficulty}`}>
                        {example.difficulty}
                      </span>
                    </div>
                    <h3>{example.name}</h3>
                    <p>{example.description}</p>
                    <div className="example-meta">
                      <span><TimelineIcon fontSize="small" /> {example.elements?.length || 0} elements</span>
                      <span><LoopIcon fontSize="small" /> {example.loops?.length || 0} loops</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Models Modal */}
        {showModels && (
          <div className="modal-backdrop" onClick={() => setShowModels(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FolderOpenIcon /> My Models</h2>
                <button className="close-btn" onClick={() => setShowModels(false)}>
                  <CloseIcon />
                </button>
              </div>

              <div className="new-model-btns">
                <button className="new-model-btn" onClick={() => handleNew('cld')}>
                  <AddIcon /> New CLD
                </button>
                <button className="new-model-btn" onClick={() => handleNew('stockflow')}>
                  <AddIcon /> New Stock & Flow
                </button>
              </div>

              {savedModels.length === 0 ? (
                <div className="no-models">
                  <p>No saved models yet.</p>
                  <p>Your models are saved locally in your browser.</p>
                </div>
              ) : (
                <div className="models-list">
                  {savedModels.map((m) => (
                    <div key={m.id} className={`model-item ${m.id === model?.id ? 'active' : ''}`}>
                      <div className="model-item-info" onClick={() => handleLoadModel(m)}>
                        <h4>{m.name}</h4>
                        <span className="model-type">{m.type === 'cld' ? 'CLD' : 'Stock & Flow'}</span>
                        <span className="model-date">
                          {new Date(m.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        className="delete-model-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModel(m.id);
                        }}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Systems Thinking Guide Modal */}
        <SDGuideModal open={showGuide} onClose={() => setShowGuide(false)} />

        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>

      <style jsx>{`
        .studio-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f1f5f9;
        }

        /* Header - Light theme */
        .studio-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #ffffff;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .logo-link {
          text-decoration: none;
          color: inherit;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .logo-brand {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }

        .logo-product {
          font-size: 11px;
          font-weight: 500;
          color: #3b82f6;
        }

        .model-info {
          display: flex;
          flex-direction: column;
        }

        .model-name {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }

        .model-name:hover {
          color: #3b82f6;
        }

        .model-name-input {
          padding: 4px 8px;
          font-size: 16px;
          font-weight: 600;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          color: #1e293b;
          outline: none;
        }

        .model-name-input:focus {
          border-color: #3b82f6;
        }

        .diagram-type {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #475569;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .header-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }

        .header-btn.primary {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .header-btn.primary:hover {
          background: #2563eb;
        }

        /* Main content */
        .studio-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Left Toolbar */
        .left-toolbar {
          width: 180px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 16px;
          overflow-y: auto;
        }

        .toolbar-section {
          margin-bottom: 20px;
        }

        .toolbar-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .palette-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          margin-bottom: 4px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          font-size: 12px;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .palette-btn:hover {
          border-color: var(--accent, #6366f1);
          background: #f8fafc;
        }

        .palette-btn.active {
          border-color: var(--accent, #6366f1);
          background: #eef2ff;
          color: var(--accent, #6366f1);
        }

        .palette-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent, #6366f1);
          color: white;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }

        .palette-icon.loop-icon {
          border-radius: 50%;
          width: 22px;
          height: 22px;
        }

        .palette-shortcut {
          margin-left: auto;
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          background: #f1f5f9;
          padding: 2px 5px;
          border-radius: 3px;
        }

        .palette-btn:hover .palette-shortcut {
          background: #e2e8f0;
          color: #64748b;
        }

        .toolbar-hint {
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
          padding: 8px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .toolbar-hint strong {
          display: block;
          color: #3b82f6;
          margin-bottom: 2px;
        }

        .type-select {
          width: 100%;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          color: #334155;
        }

        /* Canvas */
        .canvas-container {
          flex: 1;
          position: relative;
          padding: 16px;
        }

        .canvas-toolbar {
          position: absolute;
          top: 24px;
          right: 24px;
          display: flex;
          gap: 4px;
          padding: 6px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .canvas-toolbar button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .canvas-toolbar button:hover:not(:disabled) {
          background: #f1f5f9;
          color: #334155;
        }

        .canvas-toolbar button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .toolbar-divider {
          width: 1px;
          background: #e2e8f0;
          margin: 4px 2px;
        }

        .zoom-hint {
          font-size: 11px;
          color: #94a3b8;
          padding: 0 8px;
        }

        .connect-indicator {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 16px;
          background: #1e293b;
          color: white;
          border-radius: 6px;
          font-size: 13px;
          z-index: 10;
        }

        /* Right Panel */
        .right-panel {
          width: 260px;
          background: white;
          border-left: 1px solid #e2e8f0;
          padding: 16px;
          overflow-y: auto;
        }

        .right-panel h3 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .property-group {
          margin-bottom: 12px;
        }

        .property-group label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 4px;
        }

        .property-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 13px;
        }

        .property-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 12px;
          background: white;
          cursor: pointer;
        }

        .property-value {
          padding: 8px;
          background: #f8fafc;
          border-radius: 4px;
          font-size: 13px;
          color: #64748b;
          text-transform: capitalize;
        }

        .format-row {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .format-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .format-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .format-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .size-select {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 12px;
          background: white;
          cursor: pointer;
        }

        .font-select {
          width: 100%;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 12px;
          background: white;
          cursor: pointer;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 4px;
        }

        .color-btn {
          width: 28px;
          height: 28px;
          border: 2px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .color-btn:hover {
          transform: scale(1.1);
        }

        .color-btn.active {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }

        .action-row {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: white;
          color: #475569;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .delay-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #64748b;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .delay-toggle:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .delay-toggle.active {
          border-color: #f59e0b;
          background: #fffbeb;
          color: #b45309;
        }

        .delay-icon {
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 2px;
        }

        .curve-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .curve-control input[type="range"] {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          background: #e2e8f0;
          border-radius: 2px;
          outline: none;
        }

        .curve-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
        }

        .curve-value {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          min-width: 32px;
          text-align: right;
        }

        .delete-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 8px;
          margin-top: 12px;
          border: 1px solid #fecaca;
          border-radius: 4px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }

        .delete-btn:hover {
          background: #fee2e2;
        }

        .no-selection {
          text-align: center;
          padding: 24px;
          color: #94a3b8;
        }

        .no-selection p {
          margin: 0 0 8px;
          font-size: 13px;
        }

        .hint {
          font-size: 11px;
          color: #cbd5e1;
        }

        .model-stats {
          margin-top: 24px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .model-stats h4 {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
          color: #475569;
        }

        .io-section {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .io-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-top: 8px;
        }

        .io-label:first-child {
          margin-top: 0;
        }

        .io-row {
          display: flex;
          gap: 6px;
        }

        .io-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #475569;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
          flex: 1;
        }

        .io-btn.full {
          flex: none;
          width: 100%;
          padding: 8px 12px;
          font-size: 12px;
        }

        .io-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .io-btn.danger {
          border-color: #fecaca;
          color: #dc2626;
          background: #fef2f2;
        }

        .io-btn.danger:hover {
          background: #fee2e2;
          border-color: #f87171;
        }

        .io-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 12px 0;
        }

        .bg-selector {
          display: flex;
          gap: 6px;
        }

        .bg-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 4px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          font-size: 10px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .bg-option:hover {
          border-color: #cbd5e1;
        }

        .bg-option.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1e40af;
        }

        .bg-preview {
          width: 24px;
          height: 16px;
          border-radius: 3px;
          border: 1px solid #cbd5e1;
        }

        .bg-preview.white {
          background: #ffffff;
        }

        .bg-preview.gray {
          background: #fafafa;
        }

        .bg-preview.transparent {
          background: linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }

        /* Modals */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }

        .modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-lg {
          max-width: 800px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .close-btn:hover {
          background: #f1f5f9;
        }

        /* Examples */
        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          padding: 20px;
          overflow-y: auto;
        }

        .example-card {
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .example-card:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .example-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .domain-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: white;
        }

        .difficulty-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        .difficulty-badge.beginner { background: #dcfce7; color: #16a34a; }
        .difficulty-badge.intermediate { background: #fef3c7; color: #d97706; }
        .difficulty-badge.advanced { background: #fee2e2; color: #dc2626; }

        .example-card h3 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .example-card p {
          margin: 0 0 12px;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }

        .example-meta {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #94a3b8;
        }

        .example-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Models list */
        .new-model-btns {
          display: flex;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .new-model-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .new-model-btn:hover {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
        }

        .no-models {
          padding: 40px 20px;
          text-align: center;
          color: #94a3b8;
        }

        .models-list {
          padding: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .model-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .model-item:hover {
          border-color: #6366f1;
        }

        .model-item.active {
          background: #eef2ff;
          border-color: #6366f1;
        }

        .model-item-info {
          flex: 1;
        }

        .model-item-info h4 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .model-type {
          font-size: 10px;
          font-weight: 600;
          color: #6366f1;
          margin-right: 8px;
        }

        .model-date {
          font-size: 11px;
          color: #94a3b8;
        }

        .delete-model-btn {
          padding: 6px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }

        .delete-model-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Help */
        .help-content {
          padding: 20px;
          overflow-y: auto;
        }

        .help-content h3 {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .help-content ul, .help-content ol {
          margin: 0 0 24px;
          padding: 0 0 0 20px;
        }

        .help-content li {
          margin-bottom: 8px;
          font-size: 13px;
          color: #475569;
        }

        .help-content kbd {
          padding: 2px 6px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 11px;
          font-family: monospace;
        }

        .help-content p {
          margin: 0 0 12px;
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
        }

        /* Notification */
        .notification {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          z-index: 2000;
          animation: slideUp 0.3s ease;
        }

        .notification.success {
          background: #22c55e;
          color: white;
        }

        .notification.error {
          background: #ef4444;
          color: white;
        }

        .notification.info {
          background: #6366f1;
          color: white;
        }

        .notification.warning {
          background: #f59e0b;
          color: white;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
