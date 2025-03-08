import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    itemName: '',
    description: '',
    currentBid: 0,
    closingTime: '',
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/auctions/${id}`);
        setItem(res.data);
      } catch (error) {
        console.error('Error fetching auction item:', error);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/auctions/${id}`, item);
      alert('Auction updated successfully!');
      navigate(`/auction/${id}`);
    } catch (error) {
      console.error('Error updating auction:', error);
    }
  };

  return (
    <div>
      <h2>Edit Auction</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="itemName" value={item.itemName} onChange={handleChange} placeholder="Item Name" required />
        <textarea name="description" value={item.description} onChange={handleChange} placeholder="Description" required />
        <input type="number" name="currentBid" value={item.currentBid} onChange={handleChange} placeholder="Current Bid" required />
        <input type="datetime-local" name="closingTime" value={item.closingTime} onChange={handleChange} required />
        <button type="submit">Update Auction</button>
      </form>
    </div>
  );
}

export default EditAuction;
