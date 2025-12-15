import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function AuctionItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({});
  const [bid, setBid] = useState('');
  const [message, setMessage] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));
        setLoggedInUser(user?.username);

        const res = await axios.get(`http://localhost:5001/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItem(res.data);
      } catch (error) {
        setMessage(
          error.response?.data?.message || 'Error fetching auction item'
        );
      }
    };

    fetchItem();
  }, [id]);

  const handleBid = async () => {
    if (Number(bid) <= item.currentBid) {
      setMessage('Bid must be higher than the current bid.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      const res = await axios.post(
        `http://localhost:5001/bid/${id}`,
        { bid: Number(bid) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

       setItem(res.data.item);
      setMessage(res.data.message);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Error placing bid.'
      );
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
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>{item.itemName}</h2>
      <p>{item.description}</p>
      <p>Current Bid: ₹{item.currentBid}</p>
      <p>Highest Bidder: {item.highestBidder || 'No bids yet'}</p>

      {!item.isClosed && (
        <>
          <input
            type="number"
            value={bid}
            onChange={(e) => setBid(Number(e.target.value))}
            placeholder="Enter your bid"
          />
          <button onClick={handleBid}>Place Bid</button>
        </>
      )}

      {item.isClosed && <p>Auction Closed</p>}

      {loggedInUser === item.owner && (
        <div>
          <button onClick={handleEdit}>Edit Auction</button>
          <button
            onClick={handleDelete}
            style={{ backgroundColor: 'red', color: 'white' }}
          >
            Delete
          </button>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default AuctionItem;
