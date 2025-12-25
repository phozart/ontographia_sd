// lib/examples.js
// Built-in example system dynamics models for learning

export const EXAMPLE_DOMAINS = {
  classic: {
    id: 'classic',
    name: 'Classic Models',
    description: 'Foundational system dynamics models from the literature',
    color: '#6366f1',
  },
  business: {
    id: 'business',
    name: 'Business & Management',
    description: 'Business strategy, operations, and management models',
    color: '#10b981',
  },
  project: {
    id: 'project',
    name: 'Project Management',
    description: 'Project dynamics and delivery challenges',
    color: '#f59e0b',
  },
  environment: {
    id: 'environment',
    name: 'Environment & Sustainability',
    description: 'Ecological and sustainability models',
    color: '#22c55e',
  },
};

export const EXAMPLES = {
  // === CLASSIC MODELS ===
  'population-growth': {
    id: 'population-growth',
    name: 'Population Growth',
    domain: 'classic',
    difficulty: 'beginner',
    type: 'stockflow',
    description: 'The foundational stock-flow model showing exponential growth dynamics.',
    situation: 'A population grows based on birth rate. The larger the population, the more births occur, creating a reinforcing feedback loop.',
    keyLessons: [
      'Stocks accumulate over time',
      'Flows are rates of change',
      'Reinforcing loops create exponential growth',
    ],
    elements: [
      { id: 'population', type: 'stock', label: 'Population', x: 300, y: 200, value: 100 },
      { id: 'births', type: 'flow', label: 'Births', x: 150, y: 200 },
      { id: 'birth-rate', type: 'converter', label: 'Birth Rate', x: 150, y: 100, value: 0.03 },
      { id: 'source', type: 'cloud', label: '', x: 50, y: 200 },
    ],
    connections: [
      { id: 'c1', source: 'source', target: 'births', type: 'flow_pipe' },
      { id: 'c2', source: 'births', target: 'population', type: 'flow_pipe' },
      { id: 'c3', source: 'birth-rate', target: 'births', type: 'connector' },
      { id: 'c4', source: 'population', target: 'births', type: 'connector' },
    ],
    loops: [
      { id: 'R1', name: 'Population Growth', type: 'reinforcing', nodes: ['population', 'births'], description: 'More people leads to more births, which increases population' },
    ],
  },

  'bathtub': {
    id: 'bathtub',
    name: 'Bathtub Dynamics',
    domain: 'classic',
    difficulty: 'beginner',
    type: 'stockflow',
    description: 'The classic bathtub model demonstrating inflow and outflow balancing.',
    situation: 'A bathtub fills with water from a faucet and drains through the drain. The water level represents a stock that changes based on these two flows.',
    keyLessons: [
      'Stocks can have multiple inflows and outflows',
      'Equilibrium occurs when inflows equal outflows',
      'The stock level persists even when flows stop',
    ],
    elements: [
      { id: 'water-level', type: 'stock', label: 'Water Level', x: 300, y: 200, value: 50 },
      { id: 'inflow', type: 'flow', label: 'Faucet', x: 150, y: 200 },
      { id: 'outflow', type: 'flow', label: 'Drain', x: 450, y: 200 },
      { id: 'source', type: 'cloud', label: '', x: 50, y: 200 },
      { id: 'sink', type: 'cloud', label: '', x: 550, y: 200 },
      { id: 'faucet-rate', type: 'parameter', label: 'Faucet Rate', x: 150, y: 100, value: 10 },
      { id: 'drain-rate', type: 'parameter', label: 'Drain Rate', x: 450, y: 100, value: 0.1 },
    ],
    connections: [
      { id: 'c1', source: 'source', target: 'inflow', type: 'flow_pipe' },
      { id: 'c2', source: 'inflow', target: 'water-level', type: 'flow_pipe' },
      { id: 'c3', source: 'water-level', target: 'outflow', type: 'flow_pipe' },
      { id: 'c4', source: 'outflow', target: 'sink', type: 'flow_pipe' },
      { id: 'c5', source: 'faucet-rate', target: 'inflow', type: 'connector' },
      { id: 'c6', source: 'drain-rate', target: 'outflow', type: 'connector' },
      { id: 'c7', source: 'water-level', target: 'outflow', type: 'connector' },
    ],
    loops: [
      { id: 'B1', name: 'Draining', type: 'balancing', nodes: ['water-level', 'outflow'], description: 'Higher water level increases drain rate, reducing water level' },
    ],
  },

  'limits-to-growth': {
    id: 'limits-to-growth',
    name: 'Limits to Growth',
    domain: 'classic',
    difficulty: 'intermediate',
    type: 'cld',
    description: 'The S-curve growth pattern when reinforcing growth meets limiting factors.',
    situation: 'Initial exponential growth eventually slows as the system approaches carrying capacity limits.',
    keyLessons: [
      'Reinforcing loops dominate early growth',
      'Balancing loops dominate as limits approach',
      'S-curve behavior is common in real systems',
      'Delays can cause overshoot',
    ],
    elements: [
      { id: 'population', type: 'variable', label: 'Population', x: 300, y: 200 },
      { id: 'growth-rate', type: 'variable', label: 'Growth Rate', x: 150, y: 200 },
      { id: 'resources', type: 'variable', label: 'Available Resources', x: 450, y: 200 },
      { id: 'carrying-capacity', type: 'variable', label: 'Carrying Capacity', x: 450, y: 100 },
      { id: 'resource-consumption', type: 'variable', label: 'Resource Consumption', x: 300, y: 350 },
    ],
    connections: [
      { id: 'c1', source: 'growth-rate', target: 'population', type: 'positive' },
      { id: 'c2', source: 'population', target: 'growth-rate', type: 'positive' },
      { id: 'c3', source: 'population', target: 'resource-consumption', type: 'positive' },
      { id: 'c4', source: 'resource-consumption', target: 'resources', type: 'negative' },
      { id: 'c5', source: 'resources', target: 'growth-rate', type: 'positive' },
      { id: 'c6', source: 'carrying-capacity', target: 'resources', type: 'positive' },
    ],
    loops: [
      { id: 'R1', name: 'Growth Engine', type: 'reinforcing', nodes: ['population', 'growth-rate'], description: 'Population drives growth rate which increases population' },
      { id: 'B1', name: 'Resource Limits', type: 'balancing', nodes: ['population', 'resource-consumption', 'resources', 'growth-rate'], description: 'Population depletes resources, limiting future growth' },
    ],
  },

  // === BUSINESS MODELS ===
  'market-growth': {
    id: 'market-growth',
    name: 'Market Growth & Saturation',
    domain: 'business',
    difficulty: 'intermediate',
    type: 'cld',
    description: 'Product adoption dynamics showing how word-of-mouth drives growth until market saturation.',
    situation: 'A new product enters the market. Early adopters spread word-of-mouth, attracting new customers. As the potential market shrinks, growth slows.',
    keyLessons: [
      'Word-of-mouth creates reinforcing growth',
      'Market saturation creates natural limits',
      'The gap between potential and actual customers matters',
    ],
    elements: [
      { id: 'customers', type: 'variable', label: 'Customers', x: 300, y: 200 },
      { id: 'word-of-mouth', type: 'variable', label: 'Word of Mouth', x: 150, y: 300 },
      { id: 'adoption-rate', type: 'variable', label: 'Adoption Rate', x: 300, y: 350 },
      { id: 'potential-customers', type: 'variable', label: 'Potential Customers', x: 450, y: 200 },
      { id: 'market-size', type: 'variable', label: 'Total Market Size', x: 450, y: 80 },
    ],
    connections: [
      { id: 'c1', source: 'customers', target: 'word-of-mouth', type: 'positive' },
      { id: 'c2', source: 'word-of-mouth', target: 'adoption-rate', type: 'positive' },
      { id: 'c3', source: 'adoption-rate', target: 'customers', type: 'positive' },
      { id: 'c4', source: 'adoption-rate', target: 'potential-customers', type: 'negative' },
      { id: 'c5', source: 'potential-customers', target: 'adoption-rate', type: 'positive' },
      { id: 'c6', source: 'market-size', target: 'potential-customers', type: 'positive' },
    ],
    loops: [
      { id: 'R1', name: 'Word of Mouth', type: 'reinforcing', nodes: ['customers', 'word-of-mouth', 'adoption-rate'], description: 'Customers spread the word, attracting more customers' },
      { id: 'B1', name: 'Market Saturation', type: 'balancing', nodes: ['adoption-rate', 'potential-customers'], description: 'Fewer potential customers means slower adoption' },
    ],
  },

  'service-quality': {
    id: 'service-quality',
    name: 'Service Quality Trap',
    domain: 'business',
    difficulty: 'intermediate',
    type: 'cld',
    description: 'How success can undermine the very factors that created it.',
    situation: 'A successful service attracts more customers, but without proportional capacity increase, service quality degrades, eventually driving customers away.',
    keyLessons: [
      'Success can carry the seeds of its own decline',
      'Capacity investments may lag behind demand',
      'Quality is often sacrificed for quantity under pressure',
    ],
    elements: [
      { id: 'customers', type: 'variable', label: 'Customers', x: 300, y: 150 },
      { id: 'service-quality', type: 'variable', label: 'Service Quality', x: 150, y: 250 },
      { id: 'capacity', type: 'variable', label: 'Service Capacity', x: 300, y: 350 },
      { id: 'revenue', type: 'variable', label: 'Revenue', x: 450, y: 150 },
      { id: 'capacity-investment', type: 'variable', label: 'Capacity Investment', x: 450, y: 350 },
      { id: 'workload', type: 'variable', label: 'Workload per Staff', x: 150, y: 350 },
    ],
    connections: [
      { id: 'c1', source: 'service-quality', target: 'customers', type: 'positive' },
      { id: 'c2', source: 'customers', target: 'revenue', type: 'positive' },
      { id: 'c3', source: 'customers', target: 'workload', type: 'positive' },
      { id: 'c4', source: 'workload', target: 'service-quality', type: 'negative' },
      { id: 'c5', source: 'revenue', target: 'capacity-investment', type: 'positive' },
      { id: 'c6', source: 'capacity-investment', target: 'capacity', type: 'positive' },
      { id: 'c7', source: 'capacity', target: 'workload', type: 'negative' },
    ],
    loops: [
      { id: 'R1', name: 'Growth Loop', type: 'reinforcing', nodes: ['service-quality', 'customers', 'revenue', 'capacity-investment', 'capacity', 'workload'], description: 'Quality attracts customers, funds capacity, improves quality' },
      { id: 'B1', name: 'Quality Erosion', type: 'balancing', nodes: ['service-quality', 'customers', 'workload'], description: 'More customers overload capacity, degrading quality' },
    ],
  },

  // === PROJECT MANAGEMENT ===
  'brooks-law': {
    id: 'brooks-law',
    name: "Brooks's Law",
    domain: 'project',
    difficulty: 'advanced',
    type: 'cld',
    description: '"Adding people to a late project makes it later" - the classic software project trap.',
    situation: 'A software project falls behind schedule. Management adds more developers, but training overhead and communication complexity initially slow progress further.',
    keyLessons: [
      'New team members need ramp-up time',
      'Communication overhead grows with team size',
      'Short-term fixes can worsen long-term problems',
      'There are no silver bullets in project management',
    ],
    elements: [
      { id: 'schedule-pressure', type: 'variable', label: 'Schedule Pressure', x: 150, y: 150 },
      { id: 'team-size', type: 'variable', label: 'Team Size', x: 300, y: 100 },
      { id: 'productivity', type: 'variable', label: 'Productivity', x: 450, y: 150 },
      { id: 'progress', type: 'variable', label: 'Progress', x: 450, y: 280 },
      { id: 'training-overhead', type: 'variable', label: 'Training Overhead', x: 300, y: 230 },
      { id: 'communication-overhead', type: 'variable', label: 'Communication Overhead', x: 300, y: 350 },
      { id: 'experienced-devs', type: 'variable', label: 'Experienced Developers', x: 150, y: 280 },
    ],
    connections: [
      { id: 'c1', source: 'schedule-pressure', target: 'team-size', type: 'positive' },
      { id: 'c2', source: 'team-size', target: 'training-overhead', type: 'positive' },
      { id: 'c3', source: 'team-size', target: 'communication-overhead', type: 'positive' },
      { id: 'c4', source: 'training-overhead', target: 'productivity', type: 'negative' },
      { id: 'c5', source: 'training-overhead', target: 'experienced-devs', type: 'negative' },
      { id: 'c6', source: 'communication-overhead', target: 'productivity', type: 'negative' },
      { id: 'c7', source: 'productivity', target: 'progress', type: 'positive' },
      { id: 'c8', source: 'progress', target: 'schedule-pressure', type: 'negative' },
      { id: 'c9', source: 'experienced-devs', target: 'training-overhead', type: 'negative' },
    ],
    loops: [
      { id: 'B1', name: 'Intended Fix', type: 'balancing', nodes: ['schedule-pressure', 'team-size', 'productivity', 'progress'], description: 'Pressure leads to hiring, should increase progress' },
      { id: 'R1', name: 'Training Burden', type: 'reinforcing', nodes: ['team-size', 'training-overhead', 'experienced-devs'], description: 'New hires burden experienced devs, slowing training' },
      { id: 'B2', name: 'Communication Tax', type: 'balancing', nodes: ['team-size', 'communication-overhead', 'productivity', 'progress', 'schedule-pressure'], description: 'Larger teams have more overhead' },
    ],
  },

  'technical-debt': {
    id: 'technical-debt',
    name: 'Technical Debt Trap',
    domain: 'project',
    difficulty: 'intermediate',
    type: 'cld',
    description: 'How taking shortcuts accumulates hidden costs that slow future development.',
    situation: 'Under schedule pressure, teams take technical shortcuts. These accumulate as "debt" that makes future changes harder, creating more pressure.',
    keyLessons: [
      'Short-term gains often have long-term costs',
      'Technical debt compounds over time',
      'Paying down debt requires deliberate investment',
    ],
    elements: [
      { id: 'schedule-pressure', type: 'variable', label: 'Schedule Pressure', x: 150, y: 150 },
      { id: 'shortcuts', type: 'variable', label: 'Shortcuts Taken', x: 300, y: 100 },
      { id: 'tech-debt', type: 'variable', label: 'Technical Debt', x: 450, y: 150 },
      { id: 'dev-velocity', type: 'variable', label: 'Development Velocity', x: 450, y: 300 },
      { id: 'feature-delivery', type: 'variable', label: 'Feature Delivery', x: 300, y: 350 },
      { id: 'code-quality', type: 'variable', label: 'Code Quality', x: 300, y: 200 },
    ],
    connections: [
      { id: 'c1', source: 'schedule-pressure', target: 'shortcuts', type: 'positive' },
      { id: 'c2', source: 'shortcuts', target: 'tech-debt', type: 'positive' },
      { id: 'c3', source: 'shortcuts', target: 'code-quality', type: 'negative' },
      { id: 'c4', source: 'tech-debt', target: 'dev-velocity', type: 'negative' },
      { id: 'c5', source: 'code-quality', target: 'dev-velocity', type: 'positive' },
      { id: 'c6', source: 'dev-velocity', target: 'feature-delivery', type: 'positive' },
      { id: 'c7', source: 'feature-delivery', target: 'schedule-pressure', type: 'negative' },
    ],
    loops: [
      { id: 'B1', name: 'Quick Fix', type: 'balancing', nodes: ['schedule-pressure', 'shortcuts', 'feature-delivery'], description: 'Shortcuts speed delivery, reducing pressure (short-term)' },
      { id: 'R1', name: 'Debt Spiral', type: 'reinforcing', nodes: ['shortcuts', 'tech-debt', 'dev-velocity', 'feature-delivery', 'schedule-pressure'], description: 'Shortcuts create debt, slowing velocity, increasing pressure for more shortcuts' },
    ],
  },
};

/**
 * Get all examples as an array
 */
export function getAllExamples() {
  return Object.values(EXAMPLES);
}

/**
 * Get examples by domain
 */
export function getExamplesByDomain(domain) {
  return Object.values(EXAMPLES).filter(ex => ex.domain === domain);
}

/**
 * Get examples by difficulty
 */
export function getExamplesByDifficulty(difficulty) {
  return Object.values(EXAMPLES).filter(ex => ex.difficulty === difficulty);
}

/**
 * Search examples by text
 */
export function searchExamples(query) {
  const q = query.toLowerCase();
  return Object.values(EXAMPLES).filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    ex.description.toLowerCase().includes(q) ||
    ex.keyLessons.some(l => l.toLowerCase().includes(q))
  );
}

/**
 * Get a specific example by ID
 */
export function getExample(id) {
  return EXAMPLES[id] || null;
}
