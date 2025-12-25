// lib/storage.js
// LocalStorage-based persistence for System Dynamics models

const STORAGE_KEY = 'ontographia-sd-models';
const CURRENT_MODEL_KEY = 'ontographia-sd-current';

/**
 * Get all saved models from localStorage
 */
export function getSavedModels() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load models from localStorage:', e);
    return [];
  }
}

/**
 * Save a model to localStorage
 */
export function saveModel(model) {
  if (typeof window === 'undefined') return false;
  try {
    const models = getSavedModels();
    const existingIndex = models.findIndex(m => m.id === model.id);

    const modelToSave = {
      ...model,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      models[existingIndex] = modelToSave;
    } else {
      modelToSave.createdAt = new Date().toISOString();
      models.push(modelToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    return true;
  } catch (e) {
    console.error('Failed to save model to localStorage:', e);
    return false;
  }
}

/**
 * Delete a model from localStorage
 */
export function deleteModel(modelId) {
  if (typeof window === 'undefined') return false;
  try {
    const models = getSavedModels();
    const filtered = models.filter(m => m.id !== modelId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete model from localStorage:', e);
    return false;
  }
}

/**
 * Get a specific model by ID
 */
export function getModel(modelId) {
  const models = getSavedModels();
  return models.find(m => m.id === modelId) || null;
}

/**
 * Get/set the current working model
 */
export function getCurrentModelId() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_MODEL_KEY);
}

export function setCurrentModelId(modelId) {
  if (typeof window === 'undefined') return;
  if (modelId) {
    localStorage.setItem(CURRENT_MODEL_KEY, modelId);
  } else {
    localStorage.removeItem(CURRENT_MODEL_KEY);
  }
}

/**
 * Export model as JSON file
 */
export function exportModel(model) {
  const dataStr = JSON.stringify(model, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${model.name || 'sd-model'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Import model from JSON file
 */
export function importModel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const model = JSON.parse(e.target.result);
        // Generate new ID to avoid conflicts
        model.id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        model.importedAt = new Date().toISOString();
        resolve(model);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Generate unique model ID
 */
export function generateModelId() {
  return `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new empty model
 */
export function createNewModel(name = 'Untitled Model', type = 'cld') {
  return {
    id: generateModelId(),
    name,
    type, // 'cld' or 'stockflow'
    description: '',
    elements: [],
    connections: [],
    loops: [],
    annotations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
