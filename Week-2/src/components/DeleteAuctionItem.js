import React from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function DeleteAuction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5001/auctions/${id}`);
      alert('Auction deleted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting auction:', error);
    }
  };

  return (
    <div>
      <h2>Are you sure you want to delete this auction?</h2>
      <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
      <button onClick={() => navigate(`/auction/${id}`)}>Cancel</button>
    </div>
  );
}

export default DeleteAuction;
