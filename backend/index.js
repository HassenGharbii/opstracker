const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors'); // Add this line

require('dotenv').config();
app.use(cors());

// Validate required environment variables
if (!process.env.OBVIOUS_BASE_URL) {
  console.error('Error: OBVIOUS_BASE_URL is not defined in .env file');
  process.exit(1);
}

const OBVIOUS_BASE_URL = process.env.OBVIOUS_BASE_URL;

app.use(express.json());

let obviousToken = null;
const refreshInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
let refreshTimer = null;

// Function to authenticate and get a new token
async function authenticate(username, password) {
  try {
    const response = await axios.get(`${OBVIOUS_BASE_URL}/authentication/api/signin`, {
      params: { username, password },
    });

    obviousToken = response.data.token;
    console.log('New token acquired:', obviousToken);
    
    // Schedule the next refresh
    scheduleTokenRefresh(username, password);
    
    return obviousToken;
  } catch (error) {
    console.error('Authentication error:', error.response?.data || error.message);
    throw error;
  }
}

// Function to schedule token refresh
function scheduleTokenRefresh(username, password) {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  // Set a new timer
  refreshTimer = setTimeout(async () => {
    try {
      console.log('Refreshing token...');
      await authenticate(username, password);
    } catch (error) {
      console.error('Failed to refresh token:', error.message);
      // Retry sooner if refresh fails
      setTimeout(() => scheduleTokenRefresh(username, password), 60000); // Retry after 1 minute
    }
  }, refreshInterval);
}

// POST to authenticate and get the token
app.post('/auth-obvious', async (req, res) => {
  const { username, password } = req.body;

  try {
    const token = await authenticate(username, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({
      error: 'Failed to authenticate with Constellation.',
      details: error.response?.data || error.message,
    });
  }
});

// Middleware to check and refresh token if needed
async function ensureToken(req, res, next) {
  if (!obviousToken) {
    return res.status(401).json({
      error: 'Authorization token is missing. Please authenticate first.',
    });
  }
  
  next();
}

// Retrieve alarms using the existing token
app.get('/alarms', ensureToken, async (req, res) => {
  const { Filters, Sorts, Page, PageSize, search } = req.query;

  // Additional alarm data to be combined with API response (formatted properly)
  const additionalAlarms = [
    {
      id: "0062e0cd-1ba3-47ce-9904-9549daeb230b",
      groups: "/passport/c04533bd-2069-4f2d-b315-1315afb1311d/;/ooda/tunisia/z.G.Tunis/Ben arous/Mhamdia/",
      creationDate: "2025-02-26T12:10:00.000Z",
      category: "الإعتداء على الأشخاص",
      certainty: "Unknown",
      severity: "Unknown",
      status: "Closed",
      description: null,
      markerId: null,
      assignedPassportId: null,
      originatorSystem: "Agenz",
      location: {
        latitude: 36.6858631,
        longitude: 10.1600274,
        altitude: 0,
        geofence: null
      },
      
      buildingGroup: null,
      shape: "DEFAULT",
      layers: ["ALARM"],
      markerImageId: null,
      label: null,
      author: {
        userName: "s_mhamdia_az4",
        passportId: "c04533bd-2069-4f2d-b315-1315afb1311d"
      },
      subCategory: null,
      additionalDetails: [],
      impactedSensors: [],
      originatorSensors: []
    },
    
    
    

  ];

  try {
    const response = await axios.get(`${OBVIOUS_BASE_URL}/alarms/api/Alarm`, {
      headers: {
        authorization: `Bearer ${obviousToken}`,
      },
      params: {
        Filters,
        Sorts,
        Page,
        PageSize,
        search,
      },
    });

    let combinedData;

    if (Array.isArray(response.data)) {
      combinedData = [...response.data, ...additionalAlarms];
    } else {
      combinedData = [response.data, ...additionalAlarms];
    }

    res.json(combinedData);
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Authorization token is expired or invalid.',
        details: error.response.data,
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve alarms.',
      details: error.response?.data || error.message,
    });
  }
});


app.get('/self', ensureToken, async (req, res) => {
  try {
    const response = await axios.get(`${OBVIOUS_BASE_URL}/authentication/api/Passport/myself`, {
      headers: {
        authorization: `Bearer ${obviousToken}`,
      },
    });

    // Return the full username from the response
    res.json({ username: response.data.username });
  } catch (err) {
    // Try refresh once if token failed
    if (err.response?.status === 401) {
      const ok = await authenticate();
      if (ok) {
        try {
          const retry = await axios.get(`${OBVIOUS_BASE_URL}/authentication/api/Passport/myself`, {
            headers: {
              authorization: `Bearer ${obviousToken}`,
            },
          });
          return res.json({ username: retry.data.username });
        } catch (retryErr) {
          return res.status(500).json({ error: 'Retry failed', details: retryErr.message });
        }
      }
    }

    res.status(500).json({ error: 'Failed to get user info', details: err.response?.data || err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
