//
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { PlayerProvider } from './context/PlayerContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { RecentPlaysProvider } from './context/RecentPlaysContext';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <PlayerProvider>
          <FavoriteProvider>
            <RecentPlaysProvider>
              <App />
            </RecentPlaysProvider>
          </FavoriteProvider>
        </PlayerProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);


