const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, AuctionItem } = require('./model');
const { connectDB } = require('./db');
const models = require('./model');
const db = require('./db');

const app = express();
//server is being configured to handle json
app.use(express.json());
//cors will help server to accept requests from multiple domains
app.use(cors());

const SECRET_KEY = 'my_super_secret_123!';
connectDB(); //go to db.js

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Received Token:', token);  // 🔍 Debugging line

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};


// Signup Route
app.post('/Signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();//user is being created in db

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//signin
app.post('/Signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 🔹 Find user by username only (not password)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔹 Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔹 Generate JWT token
    const token = jwt.sign({ userId: user._id, username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Signin successful', token });
  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Create Auction Item (Protected)
app.post('/AuctionItem', authenticate, async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime } = req.body;
    
    console.log('Received Auction Data:', req.body);  // 🔍 Debugging line

    if (!itemName || !description || !startingBid || !closingTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newItem = new AuctionItem({
      itemName,
      description,
      currentBid: startingBid,
      highestBidder: '',
      closingTime,
    });

    await newItem.save();
    res.status(201).json({ message: 'Auction item created', item: newItem });
  } catch (error) {
    console.error('Auction Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all auction items
app.get('/auctions', async (req, res) => {
  try {
    const auctions = await AuctionItem.find();//select * from auction item
    res.json(auctions);
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single auction item by ID
app.get('/auctions/:id', async (req, res) => {
  try {
    const auctionItem = await AuctionItem.findById(req.params.id);
    if (!auctionItem) return res.status(404).json({ message: 'Auction not found' });

    res.json(auctionItem);
  } catch (error) {
    console.error('Fetching Auction Item Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Auction Item (Protected)
// Update Auction Item (Only Owner Can Edit)
app.put('/auction/:id', authenticate, async (req, res) => {
  try {
    const { itemName, description, closingTime } = req.body;

    const auction = await AuctionItem.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // Check if the logged-in user is the owner
    if (auction.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this auction' });
    }

    // Update fields
    auction.itemName = itemName;
    auction.description = description;
    auction.closingTime = closingTime;

    await auction.save();
    res.json({ message: 'Auction updated successfully', auction });
  } catch (error) {
    console.error('Update Auction Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete Auction Item (Protected)
app.delete('/auction/:id', authenticate, async (req, res) => {
  try {
    const auction = await AuctionItem.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // Check if the logged-in user is the owner
    if (auction.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this auction' });
    }

    await auction.deleteOne();
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Delete Auction Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Bidding on an item (Protected)
app.post('/bid/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { bid, bidderName } = req.body; // Get bidderName from frontend
    const item = await AuctionItem.findById(id);

    if (!item) return res.status(404).json({ message: 'Auction item not found' });
    if (item.isClosed) return res.status(400).json({ message: 'Auction is closed' });

    if (new Date() > new Date(item.closingTime)) {
      item.isClosed = true;
      await item.save();
      return res.json({ message: 'Auction closed', winner: item.highestBidder });
    }

    if (bid > item.currentBid) {
      item.currentBid = bid;
      item.highestBidder = bidderName; // Store bidder's name from frontend
      await item.save();
      res.json({ message: 'Bid successful', item });
    } else {
      res.status(400).json({ message: 'Bid too low' });
    }
  } catch (error) {
    console.error('Bidding Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(5001, () => {
  console.log('Server is running on port 5001');
});
