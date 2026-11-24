console.log('Sample JS loaded');
//Using React for a part of your existing page rather than the whole page

import { createRoot } from 'react-dom/client';

// Navigation bar react component for the app
function NavigationBar() {
  return <h1>Hello from React!</h1>;
}

const domNode = document.getElementById('navigation');
const root = createRoot(domNode);
root.render(<NavigationBar />);
