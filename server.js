const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let authToken = null;

// Authentication endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const response = await axios.post('https://api-pubconsole.media.net/v2/login', {
      user_email: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Log the entire response structure to understand it better
    console.log('Login response structure:', {
      data: response.data,
      headers: Object.keys(response.headers || {})
    });
    
    // Check different possible token locations in response
    authToken = response.data.token || 
                response.data.access_token || 
                response.data.data?.token ||
                response.data.data?.access_token;
    
    if (!authToken && response.headers) {
      // Sometimes token comes in headers
      authToken = response.headers['x-auth-token'] || 
                  response.headers['authorization'] ||
                  response.headers['token'];
    }
    
    if (authToken) {
      console.log('Login successful, token received');
      res.json({ success: true, message: 'Login successful' });
    } else {
      console.error('No token found in response. Full response:', JSON.stringify(response.data, null, 2));
      res.status(401).json({ success: false, message: 'No authentication token received' });
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    res.status(401).json({ success: false, message: 'Login failed' });
  }
});

// Reports endpoint
app.post('/api/reports', async (req, res) => {
  try {
    console.log('Reports endpoint called, authToken exists:', !!authToken);
    
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    const { startDate, endDate, pageSize = 100, pageNo = 1 } = req.body;

    console.log('Fetching reports with params:', { startDate, endDate, pageSize, pageNo });
    
    const response = await axios.post('https://api-pubconsole.media.net/v2/reports/hourly-channel-wise', {
      start_date: startDate,
      end_date: endDate,
      pagination: {
        page_size: pageSize,
        page_no: pageNo
      },
      type: 'json'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': authToken
      }
    });

    console.log('Report response status:', response.data.status);
    console.log('Number of rows:', response.data.data?.rows?.length || 0);
    
    res.json(response.data);
  } catch (error) {
    console.error('Report error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});