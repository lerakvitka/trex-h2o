import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

function Root() {
  return (
    <>
      <App />
      <div className="footer">
        made with <span className="heart">♥</span> · stay hydrated
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
