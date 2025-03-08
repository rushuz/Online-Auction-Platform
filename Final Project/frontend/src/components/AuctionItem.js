import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function AuctionItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({});
  const [bid, setBid] = useState(0);
  const [message, setMessage] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user')); // Store username when signing in
        setLoggedInUser(user?.username);

        const res = await axios.get(`http://localhost:5001/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItem(res.data);
      } catch (error) {
        setMessage('Error fetching auction item: ' + (error.response?.data?.message || error.message));
        console.error(error);
      }
    };

    fetchItem();
  }, [id]);

  const handleBid = async () => {
    const bidderName = prompt('Enter your name to place a bid:');

    if (bid <= item.currentBid) {
      setMessage('Bid must be higher than the current bid.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `http://localhost:5001/bid/${id}`,
        { bid, bidderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message);
      if (res.data.winner) {
        setMessage(`Auction closed. Winner: ${res.data.winner}`);
      }
    } catch (error) {
      setMessage('Error placing bid.');
      console.error(error);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-auction/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this auction?')) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5001/auction/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Auction deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting auction:', error);
    }
  };

  return (
    <div>
      <h2>{item.itemName}</h2>
      <p>{item.description}</p>
      <p>Current Bid: ${item.currentBid}</p>
      <p>Highest Bidder: {item.highestBidder || 'No bids yet'}</p>

      <input
        type="number"
        value={bid}
        onChange={(e) => setBid(e.target.value)}
        placeholder="Enter your bid"
      />
      <button onClick={handleBid}>Place Bid</button>

      {loggedInUser === item.owner && (
        <div>
          <button onClick={handleEdit}>Edit Auction</button>
          <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default AuctionItem;
