// components/SDGuideModal.js
// Systems Thinking Learning Journey - Step-by-step guide

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';

// Learning journey steps
const LEARNING_STEPS = [
  {
    id: 'mindset',
    title: 'The Systems Thinking Mindset',
    icon: PsychologyIcon,
    color: '#6366f1',
    subtitle: 'A different way of seeing the world',
    content: {
      intro: `Most of us are trained to think in straight lines: A causes B. But the real world is full of circles, where effects loop back to become causes. Systems thinking helps you see these hidden connections.`,
      keyInsight: {
        title: 'The Key Insight',
        text: `Everything is connected. When you change one thing, it affects other things, which can circle back and affect the original thing. This is why quick fixes often backfire and small changes can have big effects.`
      },
      mentalShifts: [
        { from: 'Looking for THE cause', to: 'Seeing webs of causation' },
        { from: 'Focusing on events', to: 'Seeing patterns over time' },
        { from: 'Blaming individuals', to: 'Understanding system structure' },
        { from: 'Seeking quick fixes', to: 'Finding leverage points' },
      ],
      reflection: `Think of a problem you face repeatedly. Could it be that your "solution" is actually part of what keeps the problem going?`
    }
  },
  {
    id: 'connections',
    title: 'See the Connections',
    icon: AccountTreeIcon,
    color: '#10b981',
    subtitle: 'Mapping cause and effect',
    content: {
      intro: `The first skill is noticing how things influence each other. We draw these as arrows between variables—things that can increase or decrease.`,
      concepts: [
        {
          term: 'Variables',
          desc: 'Things that can change: Population, Sales, Stress, Quality, Trust. Use nouns, not verbs.',
          example: 'Customer Satisfaction, Employee Morale, Inventory Level'
        },
        {
          term: 'Causal Links',
          desc: 'Arrows showing influence. Ask: "If this changes, what else changes as a result?"',
          example: 'Quality → Customer Satisfaction (better quality leads to happier customers)'
        },
      ],
      twoTypes: {
        title: 'Two Types of Influence',
        positive: {
          symbol: '+',
          name: 'Same Direction',
          rule: 'When A goes UP, B goes UP. When A goes DOWN, B goes DOWN.',
          examples: ['Advertising → Sales', 'Practice → Skill', 'Stress → Mistakes']
        },
        negative: {
          symbol: '−',
          name: 'Opposite Direction',
          rule: 'When A goes UP, B goes DOWN. When A goes DOWN, B goes UP.',
          examples: ['Price → Demand', 'Rest → Fatigue', 'Resources → Scarcity']
        }
      },
      tryIt: `Pick any two things in your life or work. Ask: Does one affect the other? In what direction?`
    }
  },
  {
    id: 'feedback',
    title: 'Recognize Feedback',
    icon: LoopIcon,
    color: '#f59e0b',
    subtitle: 'The engine of system behavior',
    content: {
      intro: `When causal chains form circles, you get feedback loops. These are the engines that drive system behavior over time. There are only two types, and recognizing them is the key skill.`,
      loopTypes: [
        {
          type: 'reinforcing',
          symbol: 'R',
          name: 'Reinforcing Loops',
          nickname: 'Snowball effect',
          behavior: 'Amplify change — growth or decline that feeds on itself',
          howToSpot: 'Count the minus signs in the loop. EVEN number (including zero) = Reinforcing',
          examples: [
            'Word of mouth: Happy customers → Referrals → New customers → More happy customers',
            'Vicious cycle: Stress → Poor sleep → Fatigue → More stress'
          ],
          warning: 'These create exponential growth or collapse. They can\'t continue forever.'
        },
        {
          type: 'balancing',
          symbol: 'B',
          name: 'Balancing Loops',
          nickname: 'Thermostat effect',
          behavior: 'Resist change — push toward a goal or equilibrium',
          howToSpot: 'Count the minus signs in the loop. ODD number = Balancing',
          examples: [
            'Thermostat: Room too hot → AC turns on → Temperature drops → AC turns off',
            'Hunger: Low energy → Eat → Full → Stop eating'
          ],
          warning: 'These create stability but also resistance to change you might want.'
        }
      ],
      keyQuestion: `What loops are operating in your situation? Are they helping or hurting?`
    }
  },
  {
    id: 'tools',
    title: 'Build Your Model',
    icon: BuildIcon,
    color: '#ec4899',
    subtitle: 'From thinking to diagram',
    content: {
      intro: `Now you're ready to use the tools. A good systems model starts simple and grows as your understanding deepens.`,
      process: [
        { step: 1, action: 'Name the problem', detail: 'What behavior over time concerns you? Growth? Decline? Oscillation? Stagnation?' },
        { step: 2, action: 'Identify key variables', detail: 'What 3-5 things are most important? Use the Variable tool.' },
        { step: 3, action: 'Draw connections', detail: 'Click a variable, drag from the green handles to connect. Mark + or −.' },
        { step: 4, action: 'Find the loops', detail: 'Trace the circles. Mark them R or B using the loop markers.' },
        { step: 5, action: 'Tell the story', detail: 'Read your diagram aloud. Does it match reality? Refine it.' },
      ],
      toolMapping: [
        { tool: 'Variable (V)', use: 'Things that change — your main building blocks' },
        { tool: 'Connection handles', use: 'Click element, then drag from green dots to connect' },
        { tool: '+ / − links', use: 'Same direction vs. opposite direction influence' },
        { tool: 'R / B markers', use: 'Label your feedback loops once you find them' },
        { tool: 'Stock & Flow', use: 'For advanced models: show accumulation and rates' },
      ],
      commonMistakes: [
        'Making it too complicated — start with 3-5 variables',
        'Using verbs instead of nouns — "Hiring" should be "Workforce"',
        'Forgetting delays — many effects take time to appear',
        'Not reading it aloud — the story should make sense',
      ]
    }
  },
  {
    id: 'practice',
    title: 'Deepen Your Practice',
    icon: SchoolIcon,
    color: '#8b5cf6',
    subtitle: 'Becoming a systems thinker',
    content: {
      intro: `Systems thinking is a skill that improves with practice. Here's how to develop it further.`,
      practices: [
        {
          title: 'Question "the" cause',
          desc: 'When you hear "X caused Y," ask: What caused X? What else did X affect? What else affects Y?'
        },
        {
          title: 'Look for loops in daily life',
          desc: 'Traffic jams, office politics, habit formation — feedback loops are everywhere once you start looking.'
        },
        {
          title: 'Trace unintended consequences',
          desc: 'When a fix doesn\'t work or makes things worse, map out the system to see why.'
        },
        {
          title: 'Find the delays',
          desc: 'Most frustration comes from not seeing effects quickly enough. Map where delays exist.'
        },
        {
          title: 'Look for archetypes',
          desc: 'Common patterns like "Fixes that Fail" and "Shifting the Burden" appear in many situations.'
        },
      ],
      archetypes: [
        { name: 'Fixes that Fail', pattern: 'Quick fix → Problem solved (temporarily) → Side effects → Problem returns worse' },
        { name: 'Shifting the Burden', pattern: 'Symptomatic solution → Dependency → Fundamental solution atrophies' },
        { name: 'Limits to Growth', pattern: 'Success → Growth → Approaching limits → Growth slows' },
        { name: 'Tragedy of the Commons', pattern: 'Individual gain → Shared resource depleted → Everyone loses' },
      ],
      nextSteps: [
        'Try the Examples to see systems thinking in action',
        'Model a real situation from your life or work',
        'Share your model with others to test your thinking',
      ]
    }
  },
];

export default function SDGuideModal({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!open) return null;

  const step = LEARNING_STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === LEARNING_STEPS.length - 1;

  const goNext = () => setCurrentStep(prev => Math.min(prev + 1, LEARNING_STEPS.length - 1));
  const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <>
      <div className="guide-overlay" onClick={onClose} />
      <div className="guide-modal">
        {/* Header */}
        <div className="guide-header" style={{ borderBottomColor: step.color }}>
          <div className="header-content">
            <div className="step-indicator">
              {LEARNING_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(idx)}
                  title={s.title}
                  style={{ '--dot-color': s.color }}
                >
                  {idx < currentStep ? <CheckCircleOutlineIcon fontSize="small" /> : idx + 1}
                </button>
              ))}
            </div>
            <button className="close-btn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          <div className="step-header" style={{ '--accent': step.color }}>
            <StepIcon className="step-icon" />
            <div>
              <div className="step-number">Step {currentStep + 1} of {LEARNING_STEPS.length}</div>
              <h2>{step.title}</h2>
              <p className="step-subtitle">{step.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="guide-content">
          {/* Step 1: Mindset */}
          {step.id === 'mindset' && (
            <div className="step-content">
              <p className="intro-text">{step.content.intro}</p>

              <div className="insight-box">
                <LightbulbOutlinedIcon />
                <div>
                  <strong>{step.content.keyInsight.title}</strong>
                  <p>{step.content.keyInsight.text}</p>
                </div>
              </div>

              <h3>The Mental Shifts</h3>
              <div className="shifts-grid">
                {step.content.mentalShifts.map((shift, idx) => (
                  <div key={idx} className="shift-item">
                    <div className="shift-from">{shift.from}</div>
                    <ArrowForwardIcon className="shift-arrow" />
                    <div className="shift-to">{shift.to}</div>
                  </div>
                ))}
              </div>

              <div className="reflection-box">
                <strong>Reflection</strong>
                <p>{step.content.reflection}</p>
              </div>
            </div>
          )}

          {/* Step 2: Connections */}
          {step.id === 'connections' && (
            <div className="step-content">
              <p className="intro-text">{step.content.intro}</p>

              <div className="concepts-list">
                {step.content.concepts.map((concept, idx) => (
                  <div key={idx} className="concept-card">
                    <strong>{concept.term}</strong>
                    <p>{concept.desc}</p>
                    <div className="concept-example">Example: {concept.example}</div>
                  </div>
                ))}
              </div>

              <h3>{step.content.twoTypes.title}</h3>
              <div className="influence-types">
                <div className="influence-card positive">
                  <div className="influence-header">
                    <span className="influence-symbol">+</span>
                    <strong>{step.content.twoTypes.positive.name}</strong>
                  </div>
                  <p className="influence-rule">{step.content.twoTypes.positive.rule}</p>
                  <div className="influence-examples">
                    {step.content.twoTypes.positive.examples.map((ex, i) => (
                      <span key={i}>{ex}</span>
                    ))}
                  </div>
                </div>
                <div className="influence-card negative">
                  <div className="influence-header">
                    <span className="influence-symbol">−</span>
                    <strong>{step.content.twoTypes.negative.name}</strong>
                  </div>
                  <p className="influence-rule">{step.content.twoTypes.negative.rule}</p>
                  <div className="influence-examples">
                    {step.content.twoTypes.negative.examples.map((ex, i) => (
                      <span key={i}>{ex}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="try-it-box">
                <strong>Try It</strong>
                <p>{step.content.tryIt}</p>
              </div>
            </div>
          )}

          {/* Step 3: Feedback */}
          {step.id === 'feedback' && (
            <div className="step-content">
              <p className="intro-text">{step.content.intro}</p>

              <div className="loop-types">
                {step.content.loopTypes.map((loop) => (
                  <div key={loop.type} className={`loop-card ${loop.type}`}>
                    <div className="loop-header">
                      <span className="loop-symbol">{loop.symbol}</span>
                      <div>
                        <strong>{loop.name}</strong>
                        <span className="loop-nickname">{loop.nickname}</span>
                      </div>
                    </div>
                    <p className="loop-behavior">{loop.behavior}</p>
                    <div className="loop-spot">
                      <strong>How to spot:</strong> {loop.howToSpot}
                    </div>
                    <div className="loop-examples">
                      <strong>Examples:</strong>
                      {loop.examples.map((ex, i) => (
                        <p key={i}>{ex}</p>
                      ))}
                    </div>
                    <div className="loop-warning">{loop.warning}</div>
                  </div>
                ))}
              </div>

              <div className="reflection-box">
                <strong>Key Question</strong>
                <p>{step.content.keyQuestion}</p>
              </div>
            </div>
          )}

          {/* Step 4: Tools */}
          {step.id === 'tools' && (
            <div className="step-content">
              <p className="intro-text">{step.content.intro}</p>

              <h3>The Modeling Process</h3>
              <div className="process-steps">
                {step.content.process.map((p) => (
                  <div key={p.step} className="process-step">
                    <span className="process-number">{p.step}</span>
                    <div>
                      <strong>{p.action}</strong>
                      <p>{p.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3>Your Toolkit</h3>
              <div className="tool-list">
                {step.content.toolMapping.map((t, idx) => (
                  <div key={idx} className="tool-item">
                    <span className="tool-name">{t.tool}</span>
                    <span className="tool-use">{t.use}</span>
                  </div>
                ))}
              </div>

              <h3>Common Mistakes to Avoid</h3>
              <ul className="mistakes-list">
                {step.content.commonMistakes.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 5: Practice */}
          {step.id === 'practice' && (
            <div className="step-content">
              <p className="intro-text">{step.content.intro}</p>

              <h3>Daily Practices</h3>
              <div className="practices-list">
                {step.content.practices.map((p, idx) => (
                  <div key={idx} className="practice-item">
                    <strong>{p.title}</strong>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>

              <h3>System Archetypes</h3>
              <p className="archetype-intro">These patterns appear again and again in different contexts:</p>
              <div className="archetypes-grid">
                {step.content.archetypes.map((a, idx) => (
                  <div key={idx} className="archetype-card">
                    <strong>{a.name}</strong>
                    <p>{a.pattern}</p>
                  </div>
                ))}
              </div>

              <div className="next-steps-box">
                <strong>Ready to Start?</strong>
                <ul>
                  {step.content.nextSteps.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="guide-footer">
          <button
            className="nav-btn prev"
            onClick={goPrev}
            disabled={isFirst}
          >
            <ArrowBackIcon /> Previous
          </button>
          <div className="step-title-small">{step.title}</div>
          {isLast ? (
            <button className="nav-btn start" onClick={onClose}>
              Start Creating <ArrowForwardIcon />
            </button>
          ) : (
            <button className="nav-btn next" onClick={goNext}>
              Next <ArrowForwardIcon />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .guide-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .guide-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 95%;
          max-width: 720px;
          max-height: 90vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .guide-header {
          padding: 16px 20px 20px;
          background: linear-gradient(to bottom, #f8fafc, white);
          border-bottom: 3px solid;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .step-indicator {
          display: flex;
          gap: 8px;
        }

        .step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: white;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .step-dot:hover {
          border-color: var(--dot-color);
          color: var(--dot-color);
        }

        .step-dot.active {
          background: var(--dot-color);
          border-color: var(--dot-color);
          color: white;
        }

        .step-dot.completed {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .step-header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .step-header :global(.step-icon) {
          font-size: 40px;
          color: var(--accent);
          flex-shrink: 0;
        }

        .step-number {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent);
          margin-bottom: 4px;
        }

        .step-header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
        }

        .step-subtitle {
          margin: 4px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .guide-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .step-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .intro-text {
          font-size: 15px;
          line-height: 1.7;
          color: #475569;
          margin: 0 0 24px;
        }

        h3 {
          margin: 24px 0 16px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        /* Insight Box */
        .insight-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: linear-gradient(135deg, #fef3c7, #fef9c3);
          border: 1px solid #fcd34d;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .insight-box :global(svg) {
          color: #f59e0b;
          font-size: 24px;
          flex-shrink: 0;
        }

        .insight-box strong {
          display: block;
          color: #92400e;
          margin-bottom: 6px;
        }

        .insight-box p {
          margin: 0;
          font-size: 14px;
          color: #78350f;
          line-height: 1.6;
        }

        /* Mental Shifts */
        .shifts-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shift-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .shift-from {
          flex: 1;
          font-size: 13px;
          color: #64748b;
          text-decoration: line-through;
        }

        .shift-arrow {
          color: #10b981;
          flex-shrink: 0;
        }

        .shift-to {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        /* Reflection Box */
        .reflection-box, .try-it-box {
          padding: 16px;
          background: #eef2ff;
          border-radius: 12px;
          margin-top: 24px;
        }

        .reflection-box strong, .try-it-box strong {
          display: block;
          color: #4f46e5;
          margin-bottom: 8px;
        }

        .reflection-box p, .try-it-box p {
          margin: 0;
          font-size: 14px;
          color: #4338ca;
          font-style: italic;
          line-height: 1.6;
        }

        /* Concepts */
        .concepts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .concept-card {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #10b981;
        }

        .concept-card strong {
          color: #1e293b;
          display: block;
          margin-bottom: 6px;
        }

        .concept-card p {
          margin: 0 0 8px;
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
        }

        .concept-example {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
        }

        /* Influence Types */
        .influence-types {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .influence-card {
          padding: 16px;
          border-radius: 12px;
        }

        .influence-card.positive {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .influence-card.negative {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .influence-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .influence-symbol {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 700;
        }

        .positive .influence-symbol {
          background: #22c55e;
          color: white;
        }

        .negative .influence-symbol {
          background: #ef4444;
          color: white;
        }

        .influence-header strong {
          font-size: 14px;
          color: #1e293b;
        }

        .influence-rule {
          font-size: 13px;
          color: #475569;
          margin: 0 0 12px;
          line-height: 1.5;
        }

        .influence-examples {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .influence-examples span {
          font-size: 12px;
          color: #64748b;
        }

        /* Loop Types */
        .loop-types {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .loop-card {
          padding: 20px;
          border-radius: 12px;
        }

        .loop-card.reinforcing {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 1px solid #93c5fd;
        }

        .loop-card.balancing {
          background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          border: 1px solid #c4b5fd;
        }

        .loop-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .loop-symbol {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }

        .reinforcing .loop-symbol {
          background: #3b82f6;
        }

        .balancing .loop-symbol {
          background: #8b5cf6;
        }

        .loop-header strong {
          font-size: 16px;
          color: #1e293b;
        }

        .loop-nickname {
          display: block;
          font-size: 12px;
          color: #64748b;
        }

        .loop-behavior {
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
          margin: 0 0 12px;
        }

        .loop-spot {
          font-size: 13px;
          color: #475569;
          margin-bottom: 12px;
          padding: 10px;
          background: rgba(255,255,255,0.6);
          border-radius: 6px;
        }

        .loop-spot strong {
          color: #1e293b;
        }

        .loop-examples {
          font-size: 13px;
          color: #475569;
          margin-bottom: 12px;
        }

        .loop-examples strong {
          display: block;
          margin-bottom: 6px;
          color: #1e293b;
        }

        .loop-examples p {
          margin: 4px 0;
          padding-left: 12px;
          border-left: 2px solid currentColor;
        }

        .loop-warning {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
          padding-top: 8px;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        /* Process Steps */
        .process-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .process-step {
          display: flex;
          gap: 16px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .process-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ec4899;
          color: white;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .process-step strong {
          display: block;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .process-step p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }

        /* Tool List */
        .tool-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tool-item {
          display: flex;
          gap: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 6px;
          align-items: center;
        }

        .tool-name {
          font-size: 13px;
          font-weight: 600;
          color: #ec4899;
          white-space: nowrap;
        }

        .tool-use {
          font-size: 13px;
          color: #475569;
        }

        /* Mistakes List */
        .mistakes-list {
          margin: 0;
          padding: 0 0 0 20px;
        }

        .mistakes-list li {
          margin-bottom: 8px;
          font-size: 13px;
          color: #475569;
        }

        /* Practices */
        .practices-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .practice-item {
          padding: 14px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #8b5cf6;
        }

        .practice-item strong {
          display: block;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .practice-item p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }

        /* Archetypes */
        .archetype-intro {
          margin: 0 0 12px;
          font-size: 13px;
          color: #64748b;
        }

        .archetypes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .archetype-card {
          padding: 14px;
          background: #faf5ff;
          border: 1px solid #e9d5ff;
          border-radius: 8px;
        }

        .archetype-card strong {
          display: block;
          color: #7c3aed;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .archetype-card p {
          margin: 0;
          font-size: 12px;
          color: #6b21a8;
          line-height: 1.5;
        }

        /* Next Steps */
        .next-steps-box {
          margin-top: 24px;
          padding: 20px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border: 1px solid #6ee7b7;
          border-radius: 12px;
        }

        .next-steps-box strong {
          display: block;
          color: #065f46;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .next-steps-box ul {
          margin: 0;
          padding: 0 0 0 20px;
        }

        .next-steps-box li {
          margin-bottom: 8px;
          font-size: 14px;
          color: #047857;
        }

        /* Footer Navigation */
        .guide-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nav-btn.prev {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        .nav-btn.prev:hover:not(:disabled) {
          background: #f1f5f9;
          color: #1e293b;
        }

        .nav-btn.prev:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .nav-btn.next {
          background: #6366f1;
          color: white;
        }

        .nav-btn.next:hover {
          background: #4f46e5;
        }

        .nav-btn.start {
          background: #10b981;
          color: white;
        }

        .nav-btn.start:hover {
          background: #059669;
        }

        .step-title-small {
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
        }

        @media (max-width: 640px) {
          .influence-types,
          .archetypes-grid {
            grid-template-columns: 1fr;
          }

          .step-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .step-title-small {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
