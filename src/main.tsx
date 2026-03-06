import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { appTheme } from './theme';
import './styles/index.css';

document.title = appTheme.browserTitle;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
