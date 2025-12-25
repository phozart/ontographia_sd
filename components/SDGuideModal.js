// components/SDGuideModal.js
// Systems Thinking & CLD Guide Modal

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Guide content for system dynamics
const GUIDE_SECTIONS = [
  {
    id: 'cld',
    title: 'Causal Loop Diagrams (CLD)',
    color: '#6366f1',
    content: `
      CLDs show how variables in a system influence each other through cause-and-effect relationships.
      They help visualize feedback loops and understand system behavior over time.
    `,
    items: [
      { term: 'Variable', desc: 'A quantity that can change over time (e.g., Population, Sales, Stress)' },
      { term: 'Causal Link', desc: 'An arrow showing that one variable affects another' },
      { term: 'Positive Link (+)', desc: 'Variables change in the SAME direction (if A increases, B increases; if A decreases, B decreases)' },
      { term: 'Negative Link (−)', desc: 'Variables change in OPPOSITE directions (if A increases, B decreases; if A decreases, B increases)' },
    ],
  },
  {
    id: 'loops',
    title: 'Feedback Loops',
    color: '#10b981',
    content: `
      Feedback loops are circular chains of cause and effect. They determine whether a system
      grows, shrinks, or stabilizes over time.
    `,
    items: [
      { term: 'Reinforcing Loop (R)', desc: 'Amplifies change - creates growth or decline. Count the negative links: EVEN number = Reinforcing. Example: More customers → More word-of-mouth → More customers' },
      { term: 'Balancing Loop (B)', desc: 'Resists change - creates stability or goal-seeking. Count the negative links: ODD number = Balancing. Example: Room temp rises → Thermostat turns on AC → Room temp falls' },
    ],
  },
  {
    id: 'stockflow',
    title: 'Stocks & Flows',
    color: '#f59e0b',
    content: `
      Stocks and flows add precision to system models by showing accumulation
      and rates of change.
    `,
    items: [
      { term: 'Stock (Rectangle)', desc: 'An accumulation - something that builds up or depletes over time (e.g., Bank Balance, Inventory, Knowledge)' },
      { term: 'Flow (Valve/Hourglass)', desc: 'A rate of change - what fills or drains a stock (e.g., Income, Sales Rate, Learning Rate)' },
      { term: 'Cloud', desc: 'Source or sink - represents the boundary of your model (where flows come from or go to)' },
      { term: 'Converter (Circle)', desc: 'Auxiliary variable - helps calculate flow rates or intermediate values' },
    ],
  },
  {
    id: 'patterns',
    title: 'Common System Patterns',
    color: '#ec4899',
    content: `
      Recognizing these patterns helps you understand and predict system behavior.
    `,
    items: [
      { term: 'Exponential Growth', desc: 'A reinforcing loop with no balancing - leads to rapid growth or collapse' },
      { term: 'Goal Seeking', desc: 'A balancing loop that moves toward a target - creates stability' },
      { term: 'S-Curve Growth', desc: 'Reinforcing loop hits limits - growth slows and stabilizes' },
      { term: 'Oscillation', desc: 'Delays in balancing loops - causes overshooting and undershooting' },
      { term: 'Limits to Growth', desc: 'Success creates conditions that slow further growth' },
      { term: 'Shifting the Burden', desc: 'Quick fixes weaken fundamental solutions' },
    ],
  },
  {
    id: 'tips',
    title: 'Modeling Tips',
    color: '#8b5cf6',
    content: `
      Best practices for creating effective system dynamics models.
    `,
    items: [
      { term: 'Start Simple', desc: 'Begin with 3-5 key variables, then add detail as needed' },
      { term: 'Name Variables Clearly', desc: 'Use nouns that can increase or decrease (not actions)' },
      { term: 'Find the Loops', desc: 'Every interesting behavior comes from feedback loops' },
      { term: 'Question Assumptions', desc: 'Ask "What else affects this?" and "Is this always true?"' },
      { term: 'Look for Delays', desc: 'Delays between cause and effect often explain surprising behavior' },
      { term: 'Test Your Mental Model', desc: 'Trace through loops to see if behavior matches reality' },
    ],
  },
];

export default function SDGuideModal({ open, onClose }) {
  const [expandedSection, setExpandedSection] = useState('cld');

  if (!open) return null;

  return (
    <>
      <div className="guide-overlay" onClick={onClose} />
      <div className="guide-modal">
        <div className="guide-header">
          <h2>Systems Thinking Guide</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="guide-content">
          <p className="guide-intro">
            Learn the fundamentals of system dynamics modeling and causal loop diagrams.
          </p>

          {GUIDE_SECTIONS.map(section => (
            <div key={section.id} className="guide-section">
              <button
                className={`section-header ${expandedSection === section.id ? 'expanded' : ''}`}
                onClick={() => setExpandedSection(prev => prev === section.id ? null : section.id)}
                style={{ borderLeftColor: section.color }}
              >
                <span className="section-dot" style={{ background: section.color }} />
                <span className="section-title">{section.title}</span>
                {expandedSection === section.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>

              {expandedSection === section.id && (
                <div className="section-content">
                  <p className="section-description">{section.content}</p>
                  <div className="terms-list">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="term-item">
                        <strong>{item.term}</strong>
                        <span>{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="guide-footer">
            <h4>Quick Reference</h4>
            <div className="quick-ref">
              <div className="ref-item">
                <span className="ref-symbol">+</span>
                <span>Same direction change</span>
              </div>
              <div className="ref-item">
                <span className="ref-symbol">−</span>
                <span>Opposite direction change</span>
              </div>
              <div className="ref-item">
                <span className="ref-symbol">R</span>
                <span>Reinforcing loop (amplifies)</span>
              </div>
              <div className="ref-item">
                <span className="ref-symbol">B</span>
                <span>Balancing loop (stabilizes)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .guide-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .guide-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 640px;
          max-height: 85vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .guide-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .guide-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .guide-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .guide-intro {
          margin: 0 0 20px;
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }

        .guide-section {
          margin-bottom: 8px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          border-left: 4px solid;
          background: #f8fafc;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }

        .section-header:hover {
          background: #f1f5f9;
        }

        .section-header.expanded {
          background: white;
        }

        .section-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .section-title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .section-content {
          padding: 16px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .section-description {
          margin: 0 0 16px;
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
        }

        .terms-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .term-item {
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.5;
        }

        .term-item strong {
          display: block;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .term-item span {
          color: #64748b;
        }

        .guide-footer {
          margin-top: 24px;
          padding: 16px;
          background: #eef2ff;
          border-radius: 8px;
        }

        .guide-footer h4 {
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: #4f46e5;
        }

        .quick-ref {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .ref-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #475569;
        }

        .ref-symbol {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: white;
          border: 1px solid #c7d2fe;
          border-radius: 4px;
          font-weight: 700;
          color: #4f46e5;
        }
      `}</style>
    </>
  );
}
