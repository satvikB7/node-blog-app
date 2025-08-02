const API_URL = 'http://localhost:5000/api'; 

// Load User's Posts
async function loadPosts(search='',publishedOnly=false, ownOnly=false,startDate='',endDate='',draftOnly = false) {
  const token = sessionStorage.getItem('token');
  const isAuthenticated = !!token;

  const params = new URLSearchParams();
  if(search) params.append('search',search);
  if(publishedOnly) params.append('publishedOnly','true');
  if(draftOnly) params.append('draftOnly','true')
  if(ownOnly && isAuthenticated) params.append('ownOnly','true');
  if(startDate) params.append('startDate',startDate);
  if(endDate) params.append('endDate',endDate);

  const url = `${API_URL}/posts/visible?${params.toString()}`;

  let res;
  if(isAuthenticated){
    res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    document.querySelector('.dashboard-header h2').textContent='DashBoard';
  }
  else{
    res = await fetch(url);
    document.querySelector('.dashboard-header h2').textContent='Public Posts';
  }

  const list = document.getElementById('posts-list');

  if (!list) { 
    console.error('posts-list element not found in HTML');
    return;
  }

  if (!res.ok) {
    console.error('Fetch error:', res.status, res.statusText); 
    list.innerHTML = '<p>Failed to load posts. Please try again.</p>'; 
    return;
  }

  const posts = await res.json();
  list.innerHTML = '';

  if (posts.length === 0) {
    list.innerHTML = '<p>No posts yet. Create one!</p>'; 
    return; 
  }

  posts.forEach((post,index) => {
    const li = document.createElement('li');

    const editDeleteButtons = post.isOwner ? `
      <button onclick="editPost('${post._id}', '${post.title.replace(/'/g, "\\'")}', '${post.body.replace(/'/g, "\\'")}', '${post.status}')">Edit</button>
      <button onclick="deletePost('${post._id}')">Delete</button>
    ` : '';

    li.innerHTML = `
      <h4>${post.title} (${post.status})</h4>
      <p>${post.body.substring(0, 100)}...</p>
      <div class="post-info">
        <span class="created-left">Created: ${new Date(post.createdAt).toLocaleString()}</span>
        <span class="comments-right">Comments: ${post.commentCount || 0}</span>
      </div>
      <div class="post-actions">
        <a href="#" onclick="viewPost('${post.slug}')">View</a>
        <button class="comment-toggle-btn" onclick="toggleComment('${post._id}', 'comment-section-${index}')">Comment</button> 
        ${editDeleteButtons}
      </div>
      <div id="comment-section-${index}" style="display: none; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; position: relative;">
        <span class="close-icon" onclick="closeComment('comment-section-${index}')">&times;</span> 
        <h5>Comments</h5>
        <ul id="comments-list-${index}"></ul> 
        <form id="add-comment-form-${index}" style="display: ${token ? 'block' : 'none'};">
          <textarea id="comment-body-${index}" placeholder="Add a comment" required></textarea>
          <button type="button" onclick="addComment('${post._id}', 'comment-body-${index}', 'comments-list-${index}')">Post Comment</button>
        </form>
      </div>
    `;
    list.appendChild(li);
  });
}

function closeComment(sectionId) {
  document.getElementById(sectionId).style.display = 'none';
}

async function toggleComment(postId, sectionId) {
  const section = document.getElementById(sectionId);
  if (section.style.display === 'none') {
    section.style.display = 'block';
    await loadComments(postId, `comments-list-${sectionId.split('-')[2]}`); // Load comments
  } else {
    section.style.display = 'none';
  }
}


async function loadComments(postId, listId) {
  const res = await fetch(`${API_URL}/comments/${postId}`);
  const comments = await res.json();
  const list = document.getElementById(listId);
  list.innerHTML = '';
  comments.forEach(comment => {
    const li = document.createElement('li');
    li.innerHTML = `
      <p>${comment.body}</p>
      <small>By ${comment.user.username} on ${new Date(comment.createdAt).toLocaleString()}</small>
    `;
    list.appendChild(li);
  });
}

async function addComment(postId, bodyId, listId) {
  const token=sessionStorage.getItem('token');
  if(!token)
  {
    window.location.href='index.html';
    return
  }
  const body = document.getElementById(bodyId).value.trim();
  if (!body) return alert('Comment cannot be empty');

  try {
    await fetch(`${API_URL}/comments/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ body })
    });
    document.getElementById(bodyId).value = ''; // Clear input
    await loadComments(postId, listId); // Refresh comments
  } catch (err) {
    alert('Error adding comment: ' + err.message);
  }
}

// Create Post
document.getElementById('create-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem('token');
  const title = document.getElementById('post-title').value;
  const body = document.getElementById('post-body').value;
  const status = document.getElementById('post-status').value;
  await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ title, body, status })
  });
  loadPosts(); 
});

// Edit Post (prompt for simplicity)
function editPost(id, currentTitle, currentBody, currentStatus) {
  const token=sessionStorage.getItem('token');
  if(!token)
  {
    window.location.href='index.html';
    return
  }
  document.getElementById('edit-post-id').value = id;
  document.getElementById('edit-post-title').value = currentTitle;
  document.getElementById('edit-post-body').value = currentBody;
  document.getElementById('edit-post-status').value = currentStatus;
  document.getElementById('edit-post-section').style.display = 'block'; // Show form
}

// Close Edit Post Form
document.getElementById('close-edit-post').addEventListener('click', () => {
  document.getElementById('edit-post-section').style.display = 'none';
});

// Submit Edit Post Form (partial updates)
document.getElementById('edit-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem('token');
  const id = document.getElementById('edit-post-id').value;
  const title = document.getElementById('edit-post-title').value.trim();
  const body = document.getElementById('edit-post-body').value.trim();
  const status = document.getElementById('edit-post-status').value;

  const updateData = {};
  if (title) updateData.title = title;
  if (body) updateData.body = body;
  if (status) updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    return alert('Please edit at least one field to update');
  }

  try {
    await fetch(`${API_URL}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(updateData)
    });
    document.getElementById('edit-post-section').style.display = 'none'; // Hide on success
    loadPosts(); // Refresh list
  } catch (err) {
    alert('Error updating post: ' + err.message);
  }
});

// Delete Post
async function deletePost(id) {
  const token=sessionStorage.getItem('token');
  if(!token)
  {
    window.location.href='index.html';
    return
  }
  if (confirm('Delete this post?')) {
    await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadPosts();
  }
}

// View Post (fixed for undefined fields and nested response)
async function viewPost(slug, viewId) {
  try {
    const res = await fetch(`${API_URL}/posts/slug/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch post: ' + res.status);
    const data = await res.json();
    
    // Handle nested response (e.g., { post: { ... }, comments: [...] })
    const post = data.post || data; // Use data.post if nested, else flat data
    if (!post || !post.title) throw new Error('Post data is undefined or missing fields');

    // Log for debugging (check console)
    console.log('Fetched post:', post);

    // If viewId is provided, update inline view
    if (viewId) {
      const viewSection = document.getElementById(viewId);
      const index = viewId.split('-')[2];
      document.getElementById(`full-body-${index}`).textContent = post.body || 'No body available'; 
      document.getElementById(`full-status-${index}`).textContent = post.status || 'No status';
      viewSection.style.display = 'block'; 
    }
    
    // Alert with safe checks
    alert(`Title: ${post.title || 'Undefined'}\nBody: ${post.body || 'Undefined'}\nStatus: ${post.status || 'Undefined'}`);
  } catch (err) {
    console.error('View post error:', err);
    alert('Error viewing post: ' + err.message);
  }
}


function closeView(viewId) {
  document.getElementById(viewId).style.display = 'none';
}

document.getElementById('close-post-view').addEventListener('click', () => {
  document.getElementById('post-view-section').style.display = 'none';
});

document.getElementById('add-comment-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem('token');
  const body = document.getElementById('comment-body').value.trim();
  const postId = document.getElementById('comment-post-id').value
  if (!body) return alert('Comment cannot be empty');

  try {
    await fetch(`${API_URL}/comments/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ body })
    });
    document.getElementById('comment-body').value = '';
    viewPost(post.slug); // Refresh view with new comment
  } catch (err) {
    alert('Error adding comment: ' + err.message);
  }
});

// Edit Profile Toggle and Submit (moved from app.js)
document.getElementById('edit-profile-button').addEventListener('click', () => {
  const token=sessionStorage.getItem('token');
  if(!token)
  {
    window.location.href='index.html';
    return
  }
  document.getElementById('edit-profile-section').style.display = 'block';
});

document.getElementById('close-edit-profile').addEventListener('click', () => {
  document.getElementById('edit-profile-section').style.display = 'none';
});

document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = sessionStorage.getItem('token');
  const username = document.getElementById('edit-username').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  if (!username && !email) return alert('Please enter at least one field to update');
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username, email })
    });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    alert(data.msg || 'Profile updated successfully');
    document.getElementById('edit-profile-section').style.display = 'none';
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

document.getElementById('create-post-button').addEventListener('click', () => {
  const token=sessionStorage.getItem('token');
  if(!token)
  {
    window.location.href='index.html';
    return
  }
  const section = document.getElementById('create-post-section');
  section.style.display = 'block'; // Show form
  section.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
});

document.getElementById('close-create-post').addEventListener('click', () => {
  document.getElementById('create-post-section').style.display = 'none'; 
});

document.getElementById('create-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token=sessionStorage.getItem('token');
  if(!token)
  {
    window.location.href='index.html';
    return
  }
  const title = document.getElementById('post-title').value;
  const body = document.getElementById('post-body').value;
  const status = document.getElementById('post-status').value;
  try {
    await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, body, status })
    });
    document.getElementById('create-post-section').style.display = 'none'; 
    document.getElementById('posts-list').scrollIntoView({ behavior: 'smooth' });
    loadPosts();

    document.getElementById('post-title').value = '';
    document.getElementById('post-body').value = '';
    document.getElementById('post-status').value = 'draft';
  } catch (err) {
    alert('Error creating post: ' + err.message);
  }
});

// Initial Load: Fetch posts and pre-fill profile if needed
(async () => {
  const token = sessionStorage.getItem('token');
  const isAuthenticated = !!token;

  // Set Login/Logout button dynamically
  const authButtonPlaceholder = document.getElementById('auth-button-placeholder');
  if (isAuthenticated) {
    authButtonPlaceholder.innerHTML = '<button id="logout-button">Logout</button>';
    document.getElementById('logout-button').addEventListener('click', () => {
      sessionStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  } else {
    authButtonPlaceholder.innerHTML = '<button id="login-button">Login</button>';
    document.getElementById('login-button').addEventListener('click', () => {
      window.location.href = 'index.html'; 
    });
  }
  
  loadPosts(); 

  function toggleClearFilters() {
    const search = document.getElementById('search-input').value.trim();
    const status = document.getElementById('filter-status').value.trim();
    const owner = document.getElementById('filter-owner').value.trim();
    const startDate = document.getElementById('filter-start-date').value.trim();
    const endDate = document.getElementById('filter-end-date').value.trim();
    const hasFilters = search || status || owner || startDate || endDate;

    const container =document.getElementById('search-filter-section');
    const clearBtn = document.getElementById('clear-filters');

    if(hasFilters)
    {
      clearBtn.style.display='inline-block';
      container.classList.add('expanded');
    }
    else{
      clearBtn.style.display='none';
      container.classList.remove('expanded');
    }
  }

  document.getElementById('search-input').addEventListener('input', toggleClearFilters);
  document.getElementById('filter-status').addEventListener('change', toggleClearFilters);
  document.getElementById('filter-owner').addEventListener('change', toggleClearFilters);
  document.getElementById('filter-start-date').addEventListener('change', toggleClearFilters);
  document.getElementById('filter-end-date').addEventListener('change', toggleClearFilters);

  toggleClearFilters();

  document.getElementById('search-button').addEventListener('click', () => {
    const search = document.getElementById('search-input').value.trim();
    const status = document.getElementById('filter-status').value;
    const owner = document.getElementById('filter-owner').value;
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;

    const publishedOnly=(status === 'published');
    const draftOnly = (status === 'draft');
    const ownOnly=(owner === 'own');
    loadPosts(search, publishedOnly, ownOnly, startDate, endDate,draftOnly);
    toggleClearFilters();
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-owner').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    loadPosts(); 
    toggleClearFilters();
  });
})();

