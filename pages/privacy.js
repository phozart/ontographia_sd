// pages/privacy.js
// Privacy Policy for Ontographia SD Studio

import Head from "next/head";
import Link from "next/link";
import Logo from "../components/Logo";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Systems Thinking Studio</title>
        <meta
          name="description"
          content="Privacy policy for Systems Thinking Studio by Ontographia. Your data stays in your browser."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="privacy-page">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <Link href="/" className="logo">
              <Logo size={24} />
              <span>Systems Thinking Studio</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          <Link href="/" className="back-link">
            <ArrowBackIcon /> Back to Home
          </Link>

          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: December 2025</p>

          <section>
            <h2>Overview</h2>
            <p>
              Ontographia System Dynamics Studio is a free, browser-based
              learning tool. We are committed to protecting your privacy. This
              policy explains how we handle your data - which is simple:{" "}
              <strong>we don't collect it</strong>.
            </p>
          </section>

          <section>
            <h2>Data Storage</h2>
            <p>
              All system dynamics models you create are stored locally in your
              web browser using <strong>localStorage</strong>. This means:
            </p>
            <ul>
              <li>Your data never leaves your device</li>
              <li>We have no access to your models</li>
              <li>No data is transmitted to any server</li>
              <li>No account or registration is required</li>
            </ul>
          </section>

          <section>
            <h2>What We Don't Collect</h2>
            <p>We do not collect:</p>
            <ul>
              <li>Personal information (name, email, etc.)</li>
              <li>Usage analytics or tracking data</li>
              <li>Your system dynamics models or diagrams</li>
              <li>Browser fingerprints or device identifiers</li>
              <li>Cookies for tracking purposes</li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Services</h2>
            <p>
              This application does not use any third-party analytics,
              advertising, or tracking services. We do not integrate with social
              media platforms or use any external services that could collect
              your data.
            </p>
          </section>

          <section>
            <h2>Data Export & Portability</h2>
            <p>
              You can export your models as JSON files at any time. Since your
              data is stored locally, you have complete control over it:
            </p>
            <ul>
              <li>Export individual models to JSON files</li>
              <li>Import models from JSON files</li>
              <li>Clear all data by clearing your browser's localStorage</li>
            </ul>
          </section>

          <section>
            <h2>Browser Data Persistence</h2>
            <p>Because data is stored in localStorage:</p>
            <ul>
              <li>Data persists until you clear your browser data</li>
              <li>
                Different browsers on the same device will have separate data
              </li>
              <li>
                Private/incognito browsing may not persist data after closing
              </li>
              <li>Data is not synced across devices</li>
            </ul>
            <p className="note">
              <strong>Recommendation:</strong> Export important models as JSON
              files to back them up or transfer them to other devices.
            </p>
          </section>

          <section>
            <h2>Security</h2>
            <p>
              Since no data is transmitted to our servers, there is no risk of
              server-side data breaches affecting your models. Your data
              security depends on your local device and browser security.
            </p>
          </section>

          <section>
            <h2>Children's Privacy</h2>
            <p>
              This tool is designed for educational purposes and is suitable for
              users of all ages. We do not knowingly collect any information
              from children because we do not collect information from anyone.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              If we make changes to this privacy policy, we will update the
              "Last updated" date at the top of this page. Since we don't
              collect email addresses, we cannot notify you of changes - please
              review this policy periodically.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              If you have questions about this privacy policy, you can contact
              us through the main Ontographia website at{" "}
              <a
                href="https://ontographia.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                ontographia.com
              </a>
              .
            </p>
          </section>

          <div className="summary-box">
            <h3>Summary</h3>
            <p>
              Your system dynamics models stay on your device. We don't collect,
              store, or have access to any of your data. This is a free learning
              tool with no strings attached.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <Logo size={20} />
              <span>Systems Thinking Studio</span>
            </div>
            <p>A free learning tool by Ontographia</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .privacy-page {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .header {
          padding: 16px 24px;
          background: #1e293b;
        }

        .header-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: #a5b4fc;
          text-decoration: none;
        }

        /* Content */
        .content {
          flex: 1;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6366f1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 32px;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        h1 {
          margin: 0 0 8px;
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
        }

        .last-updated {
          margin: 0 0 40px;
          font-size: 14px;
          color: #64748b;
        }

        section {
          margin-bottom: 32px;
        }

        h2 {
          margin: 0 0 16px;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        p {
          margin: 0 0 16px;
          font-size: 15px;
          color: #475569;
          line-height: 1.7;
        }

        ul {
          margin: 0 0 16px;
          padding: 0 0 0 24px;
        }

        li {
          margin-bottom: 8px;
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
        }

        a {
          color: #6366f1;
        }

        .note {
          padding: 12px 16px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
          font-size: 14px;
          color: #92400e;
        }

        .summary-box {
          margin-top: 48px;
          padding: 24px;
          background: #eef2ff;
          border-radius: 12px;
          border: 1px solid #c7d2fe;
        }

        .summary-box h3 {
          margin: 0 0 12px;
          font-size: 18px;
          font-weight: 600;
          color: #4f46e5;
        }

        .summary-box p {
          margin: 0;
          color: #4338ca;
        }

        /* Footer */
        .footer {
          padding: 32px 24px;
          background: #1e293b;
          color: #94a3b8;
        }

        .footer-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #a5b4fc;
          margin-bottom: 8px;
        }

        .footer-content p {
          margin: 0;
          font-size: 13px;
          color: #94a3b8;
        }
      `}</style>
    </>
  );
}
