// pages/index.js
// Landing page for Systems Thinking Studio by Ontographia
// Professional design with logo watermark background

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '../components/Logo';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import CloudOffIcon from '@mui/icons-material/CloudOff';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>Systems Thinking Studio | Free Experimentation Tool by Ontographia</title>
        <meta name="description" content="Free, browser-based systems thinking experimentation tool. Create causal loop diagrams and stock-flow models. No signup required. Learn systems dynamics interactively." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="page">
        {/* Logo Watermark Background */}
        <div className="watermark">
          <Logo size={600} />
        </div>

        {/* Animated background glows */}
        <div className="bg-glow glow-1" />
        <div className="bg-glow glow-2" />

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            {/* Ontographia Branding */}
            <div className="brand">
              <Logo size={48} />
              <div className="brand-text">
                <span className="brand-name">Ontographia</span>
                <span className="brand-product">Systems Thinking Studio</span>
              </div>
            </div>

            <h1 className={`hero-title ${mounted ? 'visible' : ''}`}>
              Think in Systems
            </h1>

            <p className="hero-subtitle">
              A free experimentation tool for modeling feedback loops,<br />
              visualizing system dynamics, and understanding complexity.
            </p>

            {/* Main CTA */}
            <Link href="/studio" className="cta-button">
              Start Experimenting
              <ArrowForwardIcon />
            </Link>

            <p className="cta-note">
              100% Free · No Account Required · Runs Entirely in Your Browser
            </p>
          </div>

          {/* Diagram Preview - Classic Population CLD with R and B loops */}
          <div className="diagram-preview">
            <svg viewBox="0 0 420 280" className="diagram-svg">
              {/* Subtle grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100,116,139,0.05)" strokeWidth="1"/>
                </pattern>
                <marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="#475569" />
                </marker>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Classic Population CLD - bow-shaped arrows */}

              {/* Connections first (behind nodes) */}
              {/* Population to Births (+) - nice outer bow */}
              <path d="M 155 60 C 50 50, 30 180, 75 190" stroke="#475569" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="conn c1" />
              <text x="55" y="120" textAnchor="middle" fill="#475569" fontSize="15" fontWeight="700">+</text>

              {/* Births to Population (+) - inner return bow */}
              <path d="M 110 180 C 130 130, 160 90, 175 60" stroke="#475569" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="conn c2" />
              <text x="155" y="120" textAnchor="middle" fill="#475569" fontSize="15" fontWeight="700">+</text>

              {/* Population to Deaths (+) - nice outer bow */}
              <path d="M 265 60 C 370 50, 390 180, 345 190" stroke="#475569" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" className="conn c3" />
              <text x="365" y="120" textAnchor="middle" fill="#475569" fontSize="15" fontWeight="700">+</text>

              {/* Deaths to Population (−) - inner return bow, dashed */}
              <path d="M 310 180 C 290 130, 260 90, 245 60" stroke="#475569" strokeWidth="1.5" strokeDasharray="6,4" fill="none" markerEnd="url(#arrow)" className="conn c4" />
              <text x="265" y="120" textAnchor="middle" fill="#475569" fontSize="15" fontWeight="700">−</text>

              {/* Variables - clean text only (no boxes) */}
              <text x="210" y="55" textAnchor="middle" fill="#1e293b" fontSize="15" fontWeight="600" className="node n1">Population</text>
              <text x="90" y="205" textAnchor="middle" fill="#1e293b" fontSize="15" fontWeight="600" className="node n2">Births</text>
              <text x="330" y="205" textAnchor="middle" fill="#1e293b" fontSize="15" fontWeight="600" className="node n3">Deaths</text>

              {/* Loop markers */}
              {/* Reinforcing Loop (R) - left side */}
              <g className="loop l1">
                <circle cx="95" cy="130" r="14" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
                <text x="95" y="135" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="700">R</text>
              </g>

              {/* Balancing Loop (B) - right side */}
              <g className="loop l2">
                <circle cx="325" cy="130" r="14" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
                <text x="325" y="135" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="700">B</text>
              </g>
            </svg>
          </div>

          {/* Features */}
          <div className="features">
            <div className="feature">
              <div className="feature-icon">
                <ScienceIcon />
              </div>
              <div className="feature-text">
                <strong>Experiment Freely</strong>
                <span>Build and test system models</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <SchoolIcon />
              </div>
              <div className="feature-text">
                <strong>Learn by Doing</strong>
                <span>Interactive feedback loops</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <CloudOffIcon />
              </div>
              <div className="feature-text">
                <strong>Private & Local</strong>
                <span>Data stays in your browser</span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="capabilities">
            <h2>What You Can Create</h2>
            <div className="capability-grid">
              <div className="capability">
                <div className="cap-icon">R</div>
                <h3>Causal Loop Diagrams</h3>
                <p>Map reinforcing and balancing feedback loops. Understand how variables influence each other.</p>
              </div>
              <div className="capability">
                <div className="cap-icon">▭</div>
                <h3>Stock & Flow Models</h3>
                <p>Model accumulations, rates of change, and material flows. Visualize system behavior over time.</p>
              </div>
              <div className="capability">
                <div className="cap-icon">↓</div>
                <h3>Export & Share</h3>
                <p>Save your models as JSON, PNG, or SVG. Import models to continue working on them later.</p>
              </div>
            </div>
          </div>

          {/* Second CTA */}
          <div className="cta-section">
            <p className="cta-text">
              Ready to start thinking in systems?
            </p>
            <Link href="/studio" className="cta-button secondary">
              Open Studio
              <ArrowForwardIcon />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <Logo size={20} />
              <span>Ontographia</span>
            </div>
            <div className="footer-links">
              <Link href="/privacy">Privacy</Link>
              <a href="https://ontographia.com" target="_blank" rel="noopener noreferrer">ontographia.com</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        /* Logo Watermark */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
        }

        /* Animated background glows */
        .bg-glow {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }

        .glow-1 {
          width: 700px;
          height: 700px;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          top: -250px;
          left: -150px;
          animation: float1 25s ease-in-out infinite;
        }

        .glow-2 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          bottom: -200px;
          right: -150px;
          animation: float2 30s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(60px, 40px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-50px, -30px); }
        }

        /* Hero */
        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 60px 24px 80px;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          text-align: center;
          max-width: 700px;
        }

        /* Brand */
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 40px;
        }

        .brand-text {
          text-align: left;
          line-height: 1.2;
        }

        .brand-name {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .brand-product {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #3b82f6;
        }

        /* Title */
        .hero-title {
          font-size: clamp(40px, 8vw, 64px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 20px;
          letter-spacing: -0.03em;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-title.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-subtitle {
          font-size: 18px;
          color: #64748b;
          margin: 0 0 36px;
          line-height: 1.7;
        }

        /* CTA Button - Real 3D button with depth */
        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px 56px;
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
          color: white;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -0.01em;
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.15s ease;
          cursor: pointer;
          border: none;
          position: relative;
          box-shadow:
            0 1px 0 0 rgba(255, 255, 255, 0.2) inset,
            0 -2px 0 0 rgba(0, 0, 0, 0.15) inset,
            0 6px 0 0 #1e40af,
            0 6px 8px 0 rgba(30, 64, 175, 0.4),
            0 12px 24px -4px rgba(37, 99, 235, 0.35);
        }

        .cta-button::before {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
          box-shadow:
            0 1px 0 0 rgba(255, 255, 255, 0.25) inset,
            0 -2px 0 0 rgba(0, 0, 0, 0.15) inset,
            0 8px 0 0 #1e40af,
            0 8px 12px 0 rgba(30, 64, 175, 0.5),
            0 16px 32px -4px rgba(37, 99, 235, 0.4);
        }

        .cta-button:active {
          transform: translateY(4px);
          box-shadow:
            0 1px 0 0 rgba(255, 255, 255, 0.1) inset,
            0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
            0 2px 0 0 #1e40af,
            0 2px 4px 0 rgba(30, 64, 175, 0.3),
            0 4px 12px -4px rgba(37, 99, 235, 0.2);
        }

        .cta-button.secondary {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          color: #2563eb;
          border: 2px solid #3b82f6;
          padding: 16px 44px;
          font-size: 17px;
          box-shadow:
            0 1px 0 0 rgba(255, 255, 255, 0.8) inset,
            0 4px 0 0 #e2e8f0,
            0 4px 8px rgba(0, 0, 0, 0.08),
            0 8px 16px -4px rgba(0, 0, 0, 0.1);
        }

        .cta-button.secondary::before {
          display: none;
        }

        .cta-button.secondary:hover {
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-color: #2563eb;
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 0 rgba(255, 255, 255, 0.2) inset,
            0 6px 0 0 #1e40af,
            0 6px 12px rgba(37, 99, 235, 0.3),
            0 12px 24px -4px rgba(37, 99, 235, 0.25);
        }

        .cta-button.secondary:active {
          transform: translateY(2px);
          box-shadow:
            0 2px 0 0 #1e40af,
            0 2px 4px rgba(37, 99, 235, 0.2);
        }

        .cta-note {
          margin: 20px 0 0;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        /* Diagram Preview */
        .diagram-preview {
          margin-top: 60px;
          padding: 24px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
          max-width: 520px;
        }

        .diagram-svg {
          width: 100%;
          height: auto;
        }

        .node {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }

        .n1 { animation-delay: 0.1s; }
        .n2 { animation-delay: 0.2s; }
        .n3 { animation-delay: 0.3s; }
        .n4 { animation-delay: 0.4s; }

        .conn {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawLine 0.8s ease forwards;
        }

        .c1 { animation-delay: 0.5s; }
        .c2 { animation-delay: 0.6s; }
        .c3 { animation-delay: 0.7s; }
        .c4 { animation-delay: 0.8s; }
        .c5 { animation-delay: 0.9s; }

        .loop {
          opacity: 0;
          animation: fadeIn 0.3s ease forwards;
        }

        .l1 { animation-delay: 1s; }
        .l2 { animation-delay: 1.1s; }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }

        /* Features */
        .features {
          display: flex;
          gap: 48px;
          margin-top: 60px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #3b82f6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .feature-text {
          text-align: left;
        }

        .feature-text strong {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .feature-text span {
          font-size: 13px;
          color: #64748b;
        }

        /* Capabilities Section */
        .capabilities {
          margin-top: 80px;
          text-align: center;
          max-width: 900px;
        }

        .capabilities h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 40px;
        }

        .capability-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .capability {
          background: white;
          padding: 28px 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          text-align: left;
          transition: all 0.2s ease;
        }

        .capability:hover {
          border-color: #3b82f6;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.08);
        }

        .cap-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f9ff;
          border-radius: 12px;
          font-size: 20px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 16px;
        }

        .capability h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px;
        }

        .capability p {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Second CTA */
        .cta-section {
          margin-top: 80px;
          text-align: center;
        }

        .cta-text {
          font-size: 20px;
          color: #475569;
          margin: 0 0 24px;
          font-weight: 500;
        }

        /* Footer */
        .footer {
          padding: 24px;
          background: #f1f5f9;
          border-top: 1px solid #e2e8f0;
          position: relative;
          z-index: 1;
        }

        .footer-content {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          font-size: 13px;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #3b82f6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .features {
            flex-direction: column;
            gap: 24px;
            align-items: center;
          }

          .capability-grid {
            grid-template-columns: 1fr;
          }

          .footer-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
