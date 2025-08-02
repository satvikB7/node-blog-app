// frontend/public/app.js
const API_URL = 'http://localhost:5000/api';
let token = sessionStorage.getItem('token');

// Show/Hide Forms Based on Login
async function updateUI() {
  const isLoggedIn = !!token;
  document.getElementById('auth').style.display = isLoggedIn ? 'none' : 'block';
  document.getElementById('dashboard').style.display = isLoggedIn ? 'block' : 'none';
  document.getElementById('edit-profile-section').style.display = 'none';

  
  if (isLoggedIn) {
    // Fetch and pre-fill current profile
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const user = await res.json();
      document.getElementById('edit-username').value = user.username || '';
      document.getElementById('edit-email').value = user.email || '';
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }
  else {
    document.getElementById('change-password-section').style.display = 'none';
    document.getElementById('signup-section').style.display = 'block';
    document.getElementById('signin-section').style.display = 'none';
    document.getElementById('signup-tab').classList.add('active');
    document.getElementById('signin-tab').classList.remove('active');
  }
}

// Tab Togglin
document.getElementById('signup-tab').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-section').style.display = 'block';
  document.getElementById('signin-section').style.display = 'none';
  document.getElementById('signup-tab').classList.add('active');
  document.getElementById('signin-tab').classList.remove('active');
  document.getElementById('change-password-section').style.display = 'none';
});

document.getElementById('signin-tab').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-section').style.display = 'none';
  document.getElementById('signin-section').style.display = 'block';
  document.getElementById('signup-tab').classList.remove('active');
  document.getElementById('signin-tab').classList.add('active');
  document.getElementById('change-password-section').style.display = 'none';
});

// Sign Up
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    if (data.token) {
      token = data.token;
      sessionStorage.setItem('token', token);
      console.log('Signup successful, redirecting to dashboard'); // Debug log
      window.location.href = 'dashboard.html'; // Redirect here
    } else {
      alert(data.msg || 'Signup failed');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    alert('Error: ' + err.message);
  }
});

// Sign In (with redirect to dashboard)
document.getElementById('signin-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  try {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    if (data.token) {
      token = data.token;
      sessionStorage.setItem('token', token);
      console.log('Signin successful, redirecting to dashboard'); // Debug log
      window.location.href = 'dashboard.html'; // Redirect here
    } else {
      alert(data.msg || 'Signin failed');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    alert('Error: ' + err.message);
  }
});

document.getElementById('change-password-link').addEventListener('click', (e) => {
  e.preventDefault();
  const section = document.getElementById('change-password-section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
});

// Change Password Submit
document.getElementById('change-password-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value.trim(); // Use email from sign-in form
  const oldPassword = document.getElementById('old-password').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  // Client-side validation: Check if new and confirm match
  if (newPassword !== confirmPassword) {
    return alert('New password and confirm password do not match');
  }
  if (!email) {
    return alert('Please enter your email in the sign-in form');
  }
  if (!oldPassword || !newPassword) {
    return alert('Please fill in all fields');
  }

  try {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, oldPassword, newPassword })
    });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    alert(data.msg || 'Password changed successfully');
    // Clear fields and hide section
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('change-password-section').style.display = 'none';
  } catch (err) {
    console.error('Change password error:', err);
    alert('Error changing password: ' + err.message);
  }
});

if (data.token) {
  token = data.token;
  sessionStorage.setItem('token', token);
  window.location.href = 'dashboard.html'; 
}

// Logout
function logout() {
  sessionStorage.removeItem('token');
  token = null;
  window.location.href = 'index.html';
}

// Initial UI Update (defaults to Sign Up visible)
updateUI();
