import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin'); // Redirect to signin if not authenticated
      return;
    }

    const fetchItems = async () => {
      try {
        const res = await axios.get('http://localhost:5001/auctions');
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load auctions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    
    
    fetchItems();
  }, [navigate]);
  
  const getTimeLeft = (closingTime) => {
  const diff = new Date(closingTime) - new Date();
  if (diff <= 0) return "Ended";

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return `${h}h ${m}m ${s}s`;
  };

  return (
    <div>
      <h2>Auction Dashboard</h2>

      <div className="dashboard-actions">
      <Link to="/post-auction">
        <button className="primary">Post New Auction</button>
      </Link>
      </div>
      {loading && <p>Loading auctions...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
      <div className="auction-grid">
        {items.map((item) => (
          <div className="auction-card" key={item._id}>
            
            <span
              className={`auction-status ${
                item.isClosed ? 'closed' : 'live'
              }`}
            >
              {item.isClosed ? 'Closed' : 'Live'}
            </span>

            <h3 className="auction-title">{item.itemName}</h3>

            <p className="auction-info auction-bid">
              Current Bid: ₹{item.currentBid}
            </p>
            <p className="auction-meta">
              ⏳ {item.isClosed ? "Auction ended" : getTimeLeft(item.closingTime)}
            </p>


            <Link to={`/auction/${item._id}`}>
              View Auction →
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
  );
}

export default Dashboard;
