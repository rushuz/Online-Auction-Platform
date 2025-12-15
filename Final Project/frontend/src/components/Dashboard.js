import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      nav('/signin'); // Redirect to signin if not authenticated
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

  return (
    <div>
      <h2>Auction Dashboard</h2>

      <Link to="/post-auction">
        <button className="primary">Post New Auction</button>
      </Link>

      {loading && <p>Loading auctions...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <ul>
          {items.length === 0 ? (
            <p>No auctions available</p>
          ) : (
            items.map((item) => (
              <li key={item._id}>
                <Link to={`/auction/${item._id}`}>
                  {item.itemName} — Current Bid: ₹{item.currentBid}{' '}
                  {item.isClosed && <strong>(Closed)</strong>}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
