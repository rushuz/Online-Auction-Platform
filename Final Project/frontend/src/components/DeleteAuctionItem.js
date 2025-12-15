import React from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Toast from './Toast';

function DeleteAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState("");


  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/auctions/${id}`);
      setToastMsg('Auction deleted successfully!');
      setTimeout(() => setToastMsg(""), 3000);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting auction:', error);
    }
  };

  return (
    <>
    <Toast message={toastMsg} />
    <div>
      <h2>Are you sure you want to delete this auction?</h2>
      <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
      <button onClick={() => navigate(`/auction/${id}`)}>Cancel</button>
    </div>
    </>
  );
}

export default DeleteAuction;
