import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Optional: create a theme for MUI
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Remove everything from the page
document.body.innerHTML = '';
document.body.style.margin = '0';
document.body.style.height = '100vh';
document.body.style.width = '100vw';

// Create a div to render the app
const rootDiv = document.createElement('div');
rootDiv.id = 'root';
document.body.appendChild(rootDiv);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
