// server.js

// Import necessary modules
const express = require('express');
const admin = require('firebase-admin');

// IMPORTANT: Ensure your serviceAccountKey.json file is in the same directory as this server.js file.
// Retrieve the service account key from an environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize the Express app
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// API endpoint to authenticate users based on email and password
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if the user exists by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // User exists, now send user data back (no token generation here)
    // If you need to access user details like UID or custom claims, you can do that here.
    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: userRecord.uid, // UID can be sent to the client for further processing
        email: userRecord.email,
        displayName: userRecord.displayName,
        // Any other fields you need can be accessed from userRecord
      },
    });
  } catch (error) {
    // If user is not found
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }

    console.error("Error logging in user:", error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on all network interfaces at port ${port}`);
});
