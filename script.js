// Simulated users DB (localStorage)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Services & requests data
let services = JSON.parse(localStorage.getItem('services')) || [
  {
    title: "Lost Wallet Found near Central Park",
    location: "Central Park",
    description: "If you lost your wallet around Central Park, someone found it. Contact to claim!"
  },
  {
    title: "Free Lawn Mowing in Downtown",
    location: "Downtown",
    description: "Offering free lawn mowing services every weekend. Help keep your yard neat!"
  },
  {
    title: "Grocery Delivery Assistance",
    location: "Neighborhood Area",
    description: "Can help deliver groceries for seniors or those who can't go out."
  }
];

let requests = JSON.parse(localStorage.getItem('requests')) || [];

const main = document.getElementById('main-content');
const nav = document.getElementById('main-nav');
const navHome = document.getElementById('nav-home');
const navPostService = document.getElementById('nav-post-service');
const navPostRequest = document.getElementById('nav-post-request');
const navLogout = document.getElementById('nav-logout');

let loggedInUser = sessionStorage.getItem('loggedInUser');

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function init() {
  if (loggedInUser) {
    nav.style.display = 'flex';
    renderHome();
  } else {
    nav.style.display = 'none';
    renderAuth();
  }
}

// Authentication screen
function renderAuth() {
  main.innerHTML = `
    <div class="auth-container" id="auth-container">
      <h2 id="auth-title">Login</h2>
      <form id="auth-form">
        <div id="name-group" style="display:none;">
          <label for="name-input">Full Name</label>
          <input type="text" id="name-input" placeholder="Your full name" />
        </div>
        <label for="email-input">Email</label>
        <input type="email" id="email-input" placeholder="Email" required autofocus />
        <label for="password-input">Password</label>
        <input type="password" id="password-input" placeholder="Password" required />
        <button type="submit" id="auth-submit">Login</button>
      </form>
      <div class="auth-toggle" id="auth-toggle">Don't have an account? Sign up</div>
      <div class="error-msg" id="auth-error"></div>
    </div>
  `;

  const authToggle = document.getElementById('auth-toggle');
  const authTitle = document.getElementById('auth-title');
  const authSubmit = document.getElementById('auth-submit');
  const authForm = document.getElementById('auth-form');
  const nameGroup = document.getElementById('name-group');
  const authError = document.getElementById('auth-error');

  let isLogin = true;

  authToggle.addEventListener('click', () => {
    isLogin = !isLogin;
    authError.textContent = '';

    if (isLogin) {
      authTitle.textContent = 'Login';
      authSubmit.textContent = 'Login';
      authToggle.textContent = "Don't have an account? Sign up";
      nameGroup.style.display = 'none';
      document.getElementById('name-input').required = false;
    } else {
      authTitle.textContent = 'Sign Up';
      authSubmit.textContent = 'Sign Up';
      authToggle.textContent = "Already have an account? Login";
      nameGroup.style.display = 'block';
      document.getElementById('name-input').required = true;
    }
  });

  authForm.addEventListener('submit', e => {
    e.preventDefault();
    authError.textContent = '';

    const email = document.getElementById('email-input').value.trim().toLowerCase();
    const password = document.getElementById('password-input').value;
    const name = document.getElementById('name-input').value.trim();

    if (!email || !password || (!isLogin && !name)) {
      authError.textContent = 'Please fill in all required fields.';
      return;
    }

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        loggedInUser = email;
        sessionStorage.setItem('loggedInUser', email);
        init();
      } else {
        authError.textContent = 'Invalid email or password.';
      }
    } else {
      if (users.find(u => u.email === email)) {
        authError.textContent = 'User already exists. Please login.';
        return;
      }

      users.push({ name, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      alert('Sign up successful! Please login.');
      authToggle.click();  // Switch to login
    }
  });
}

// Get user's full name
function getUserName(email) {
  const user = users.find(u => u.email === email);
  return user ? user.name : 'User';
}

// Main home page with lists
function renderHome() {
  main.innerHTML = `
    <h2>Welcome, ${escapeHTML(getUserName(loggedInUser))}</h2>
    <h3>Available Services</h3>
    <ul id="services-list"></ul>

    <h3>Help Requests</h3>
    <div id="requests-list"></div>
  `;

  const servicesList = document.getElementById('services-list');
  servicesList.innerHTML = '';
  services.forEach(service => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHTML(service.title)}</strong> - ${escapeHTML(service.location)}<br><small>${escapeHTML(service.description)}</small>`;
    servicesList.appendChild(li);
  });

  const requestsList = document.getElementById('requests-list');
  if (requests.length === 0) {
    requestsList.innerHTML = `<p class="empty-message">No help requests yet. You can post one!</p>`;
  } else {
    requestsList.innerHTML = '';
    requests.forEach(req => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<strong>${escapeHTML(req.title)}</strong> - ${escapeHTML(req.location)}<br><small>${escapeHTML(req.description)}</small>`;
      requestsList.appendChild(div);
    });
  }
}

// Post a new service
function renderPostService() {
  main.innerHTML = `
    <h2>Post a New Service</h2><br>
    <form id="service-form">
      <label for="service-title">Service Title</label>
      <input type="text" id="service-title" required />

      <label for="service-location">Location</label>
      <input type="text" id="service-location" required />

      <label for="service-description">Description</label>
      <textarea id="service-description" rows="4" required></textarea>

      <button type="submit">Post Service</button>
    </form>
  `;

  const serviceForm = document.getElementById('service-form');
  serviceForm.addEventListener('submit', e => {
    e.preventDefault();

    const title = document.getElementById('service-title').value.trim();
    const location = document.getElementById('service-location').value.trim();
    const description = document.getElementById('service-description').value.trim();

    if (title && location && description) {
      services.push({ title, location, description });
      localStorage.setItem('services', JSON.stringify(services));
      alert('Service posted!');
      renderHome();
    } else {
      alert('Please fill in all fields.');
    }
  });
}

// Post a new help request
function renderPostRequest() {
  main.innerHTML = `
    <h2>Post a Help Request</h2><br>
    <form id="request-form">
      <label for="request-title">Request Title</label>
      <input type="text" id="request-title" required />

      <label for="request-location">Location</label>
      <input type="text" id="request-location" required />

      <label for="request-description">Details</label>
      <textarea id="request-description" rows="4" required></textarea>

      <button type="submit">Post Request</button>
    </form>
  `;

  const requestForm = document.getElementById('request-form');
  requestForm.addEventListener('submit', e => {
    e.preventDefault();

    const title = document.getElementById('request-title').value.trim();
    const location = document.getElementById('request-location').value.trim();
    const description = document.getElementById('request-description').value.trim();

    if (title && location && description) {
      requests.push({ title, location, description });
      localStorage.setItem('requests', JSON.stringify(requests));
      alert('Help request posted!');
      renderHome();
    } else {
      alert('Please fill in all fields.');
    }
  });
}

// Navigation event listeners
navHome.addEventListener('click', () => renderHome());
navPostService.addEventListener('click', () => renderPostService());
navPostRequest.addEventListener('click', () => renderPostRequest());

navLogout.addEventListener('click', () => {
  sessionStorage.removeItem('loggedInUser');
  loggedInUser = null;
  init();
});

// Start app
init();
