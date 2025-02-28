import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [items, setItems] = useState([]);
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
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    };
    fetchItems();
  }, []);

  // 🔹 Handle Logout
  // const handleLogout = () => {
  //   localStorage.removeItem('authToken'); // Remove token
  //   navigate('/signin'); // Redirect to Sign In page
  // };

  return (
    <div>
      <h2>Auction Dashboard</h2>

      {/* 🔹 Logout Button 
      <button onClick={handleLogout} style={{ marginLeft: '10px', background: 'red', color: 'white' }}>
        Logout
      </button>*/}

      <Link to="/post-auction">
        <button>Post New Auction</button>
      </Link>

      <ul>
        {items.map((item) => (
          <li key={item._id}>
            <Link to={`/auction/${item._id}`}>
              {item.itemName} - Current Bid: ${item.currentBid} {item.isClosed ? '(Closed)' : ''}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
