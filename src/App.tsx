import { lazy, useState } from 'react';
import DeferredDemo from '@components/DeferredDemo';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import GalleryDemo from '@components/GalleryDemo';
import { CountButton } from '@components/CountButton';
import { ProfileTable } from '@components/UsersTable';
import { MovingDot } from '@components/MovingDot';
import PersonForm from '@components/PersonForm';
import { ImmerReducerDemo, ReducerDemo } from '@components/ReducerDemo';
import { AnalyticsDashboard } from '@components/TailwindProject/AnalyticsDashboard';
import {
  ReactCompilerAnnotationExample,
  ReactCompilerAnnotationExample1,
} from '@components/react-compiler-annotation-example';
import { ReadingListDemo } from '@components/ReadingListDemo';
import { ReadingListProvider } from './contexts/readingList/provider';
import { MuiForm } from '@components/MuiProject/MuiForm';
import { ProductGrid } from '@components/MuiProject/ProductGrid';
import { UserDirectory } from '@features/user-directory';

// Lazy load the CompilerMutationDemo and EnvironmentDemo components for code splitting and improved performance.
const CompilerMutationDemo = lazy(() => import('./CompilerMutationDemo'));
const EnvironmentDemo = lazy(() => import('./EnvironmentDemo'));
const iconsUrl = `${import.meta.env.BASE_URL}icons.svg`;

function App() {
  // "use no memo"; // Custom directive to indicate no memoization should be applied to this component
  const [count, setCount] = useState(0);
  const [report, setReport] = useState('');
  const [reportError, setReportError] = useState('');

  async function handleCreateReport() {
    setReport('');
    setReportError('');
    try {
      // This non-component module is fetched only when the button is clicked.
      const { createCountReport } = await import('./utils/count-report');
      setReport(createCountReport(count));
    } catch (error) {
      console.error('Unable to load or create the count report.', error);
      setReportError('Unable to create the count report.');
    }
  }

  console.log(import.meta.env.BASE_URL);

  return (
    <>
      <section id="center">
        <div className="hero">
          {/* // lazy load images with low fetch priority for better performance */}
          <img
            src={heroImg}
            className="base"
            width="170"
            height="179"
            alt=""
            loading="lazy"
            fetchPriority="low"
          />
          <img
            src={reactLogo}
            className="framework"
            alt="React logo"
            loading="lazy"
            fetchPriority="low"
          />
          <img
            src={viteLogo}
            className="vite"
            alt="Vite logo"
            loading="lazy"
            fetchPriority="low"
          />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <CountButton count={count} setCount={setCount} />
      </section>

      <div className="ticks"></div>
      <section aria-label="Non-component code splitting demo">
        <button type="button" className="counter" onClick={handleCreateReport}>
          Create count report
        </button>
        {report && <p role="status">{report}</p>}
        {reportError && <p role="alert">{reportError}</p>}
      </section>
      {/* Initial page → Click button → Fetch demo chunk → Show loading message → Render demo */}
      <DeferredDemo title="compiler mutation demo">
        <CompilerMutationDemo />
      </DeferredDemo>

      <DeferredDemo title="environment variables demo">
        <EnvironmentDemo />
      </DeferredDemo>

      <DeferredDemo title="gallery demo">
        <GalleryDemo />
      </DeferredDemo>

      <ProfileTable />

      <MovingDot />

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href={`${iconsUrl}#documentation-icon`}></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a
                href="https://vite.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a
                href="https://react.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href={`${iconsUrl}#social-icon`}></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a
                href="https://github.com/vitejs/vite"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href={`${iconsUrl}#github-icon`}></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://chat.vite.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href={`${iconsUrl}#discord-icon`}></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a
                href="https://x.com/vite_js"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href={`${iconsUrl}#x-icon`}></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a
                href="https://bsky.app/profile/vite.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href={`${iconsUrl}#bluesky-icon`}></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
      <PersonForm />

      <img
        src="https://picsum.photos/id/1018/1200/800"
        alt="Sample landscape"
        width={400}
        height={400}
        loading="eager"
        fetchPriority="high"
        style={{ width: '100%' }}
      />
      <br />
      <br />
      <ReducerDemo />
      <br />
      <ImmerReducerDemo />
      <br />
      <ReactCompilerAnnotationExample />
      <ReactCompilerAnnotationExample1 />
      <br />
      <AnalyticsDashboard />
      <br />
      <ReadingListProvider>
        <ReadingListDemo />
      </ReadingListProvider>
      <br />
      <MuiForm />
      <ProductGrid />
      <UserDirectory />
    </>
  );
}

export default App;
