import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import AuctionItem from './components/AuctionItem';
import PostAuction from './components/PostAuction';
import Landing from './components/Landing';
import EditAuction from './components/EditAuction';
import DeleteAuctionItem from './components/DeleteAuctionItem';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app">
        <header>
          <h1>Auction App</h1>
          <nav>
            <Link to="/signup">Signup</Link>
            <Link to="/signin">Signin</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/post-auction">Post Auction</Link>
            {isAuthenticated && (
              <button onClick={handleLogout} style={{ marginLeft: '10px', background: 'red', color: 'white' }}>Logout</button>
            )}
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auction/:id" element={<AuctionItem />} />
            <Route path="/post-auction" element={<PostAuction />} />
            <Route path="/edit-auction/:id" element={<EditAuction />} />
            <Route path="/delete-auction-item/:id" element={<DeleteAuctionItem />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 Auction App. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
