// Admin Dashboard - Fully Interactive + Organized
// Modular controller with click-to-detail functionality

class AdminDashboard {
  constructor(container, admin) {
    this.container = container;
    this.admin = admin;
    this.users = this.mockUsers();
    this.applications = this.mockApplications();
    this.opportunities = this.mockOpportunities();
    this.stats = this.calculateStats();
  }

  render() {
    this.container.innerHTML = this.generateHTML();
    this.bindEvents();
    this.animateStats();
  }

  generateHTML() {
    return `
      <!-- Overview Section -->
      <section id="overview" class="content-section active">
        ${this.renderTopbar()}
        ${this.renderOverviewStats()}
        ${this.renderRecentActivity()}
        ${this.renderQuickActions()}
      </section>

      <!-- Users Section -->
      <section id="users" class="content-section">
        ${this.renderUsersSection()}
      </section>

      <!-- Applications Section -->
      <section id="applications" class="content-section">
        ${this.renderApplicationsSection()}
      </section>

      <!-- Opportunities Section -->
      <section id="opportunities" class="content-section">
        ${this.renderOpportunitiesSection()}
      </section>

      <!-- Other sections... -->
    `;
  }

  renderTopbar() {
    return `
      <div class="topbar">
        <div>
          <h1>Platform Control</h1>
          <p>Complete overview & management</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" onclick="exportAllData()">📊 Export All</button>
          <button class="btn btn-primary" onclick="showBulkActions()">⚡ Bulk Actions</button>
        </div>
      </div>
    `;
  }

  renderOverviewStats() {
    return `
      <div class="stats-grid">
        <div class="stat-card clickable" data-action="users">
          <div class="stat-icon">👥</div>
          <div class="stat-label">Total Users</div>
          <div class="stat-number" data-target="${this.stats.totalUsers}">0</div>
        </div>
        <div class="stat-card clickable" data-action="applications">
          <div class="stat-icon">📋</div>
          <div class="stat-label">Applications</div>
          <div class="stat-number" data-target="${this.stats.applications}">0</div>
        </div>
        <div class="stat-card clickable" data-action="opportunities">
          <div class="stat-icon">🎯</div>
          <div class="stat-label">Opportunities</div>
          <div class="stat-number" data-target="${this.stats.opportunities}">0</div>
        </div>
        <div class="stat-card clickable" data-action="pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-label">Pending</div>
          <div class="stat-number" data-target="${this.stats.pending}">0</div>
        </div>
      </div>
    `;
  }

  renderRecentActivity() {
    const recent = this.applications.slice(0,5).map(app => `
      <tr class="clickable-row" data-id="${app.id}" onclick="showDetailModal('application', '${app.id}')">
        <td><div class="user-avatar">${app.user.charAt(0)}</div>${app.user}</td>
        <td>${app.opportunity}</td>
        <td><span class="badge ${this.getStatusClass(app.status)}">${app.status}</span></td>
        <td>${app.date}</td>
      </tr>
    `).join('');

    return `
      <div class="card">
        <h2 class="card-title"><span>🔄</span> Recent Activity</h2>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              ${recent}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderQuickActions() {
    return `
      <div class="card">
        <h2 class="card-title"><span>⚡</span> Quick Actions</h2>
        <div class="quick-actions-grid">
          <div class="quick-action-card" onclick="navigateTo('users')">
            <div class="quick-action-icon">👥</div>
            <div>Users (1.2k)</div>
          </div>
          <div class="quick-action-card" onclick="navigateTo('applications')">
            <div class="quick-action-icon">📋</div>
            <div>Review Apps (326)</div>
          </div>
          <div class="quick-action-card" onclick="addOpportunityQuick()">
            <div class="quick-action-icon">➕</div>
            <div>New Opportunity</div>
          </div>
          <div class="quick-action-card" onclick="generateReport()">
            <div class="quick-action-icon">📊</div>
            <div>Generate Report</div>
          </div>
        </div>
      </div>
    `;
  }

  renderUsersSection() {
    const usersList = this.users.map(user => `
      <tr class="clickable-row" data-id="${user.id}" onclick="showDetailModal('user', '${user.id}')">
        <td><div class="avatar">${user.name.charAt(0)}</div> ${user.name}</td>
        <td>${user.role}</td>
        <td>${user.email}</td>
        <td><span class="badge ${user.status === 'pending' ? 'badge--warning' : 'badge--success'}">${user.status}</span></td>
        <td>${user.lastActive}</td>
      </tr>
    `).join('');

    return `
      <div class="topbar">
        <div>
          <h1>Users (${this.users.length})</h1>
          <p>Manage accounts, roles, and activity</p>
        </div>
        <div class="topbar-actions">
          <div class="search-bar">
            <input class="search-input" placeholder="Search users..." id="userSearch">
            <button class="btn btn-primary">+ Add User</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="table-container">
          <table class="table clickable-rows">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody id="usersBody">${usersList}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Similar methods for other sections...
  renderApplicationsSection() {
    return `
      <div class="topbar">
        <div>
          <h1>Applications (${this.applications.length})</h1>
          <p>Review queue and status tracking</p>
        </div>
        <div class="topbar-actions">
          <div class="filters">
            <button class="filter-btn active" data-filter="pending">Pending</button>
            <button class="filter-btn" data-filter="approved">Approved</button>
            <button class="filter-btn" data-filter="rejected">Rejected</button>
          </div>
        </div>
      </div>
      <div class="content-grid">
        <div class="card">
          <h2 class="card-title">
            <span>📋</span> Application Queue
          </h2>
          <div class="table-container">
            <table class="table clickable-rows" id="appsTable">
              <!-- Dynamic table populated on render -->
            </table>
          </div>
        </div>
        <div class="card">
          <div id="appStatsChart">
            Status breakdown chart
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Stats click navigation
    document.querySelectorAll('.stat-card, .quick-action-card, .clickable-row').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = el.dataset.action || el.onclick?.toString()?.match(/'([^']+)'/)?.[1];
        if (action) this.handleQuickAction(action);
      });
    });

    // Search/filter handlers
    document.getElementById('userSearch')?.addEventListener('input', debounce(this.filterTable, 300));
  }

  handleQuickAction(action) {
    switch(action) {
      case 'users': navigateTo('users'); break;
      case 'applications': navigateTo('applications'); break;
      // etc...
    }
  }

  animateStats() {
    document.querySelectorAll('[data-target]').forEach(stat => {
      const target = parseInt(stat.dataset.target);
      let current = 0;
      const duration = 2000;
      const stepTime = 20;
      const step = target / (duration / stepTime);
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          stat.textContent = target;
          clearInterval(timer);
        } else {
          stat.textContent = Math.floor(current);
        }
      }, stepTime);
    });
  }

  mockUsers() {
    return Array.from({length: 50}, (_, i) => ({
      id: `user_${i+1}`,
      name: ['Amina', 'Diane', 'Grace', 'Sheja', 'Claudine'][i%5] + ' ' + ['Uwase', 'Mukamana', 'Ishimwe', 'Linda', 'Ndayisaba'][i%5],
      role: i%3 === 0 ? 'student' : i%3 === 1 ? 'mentor' : 'admin',
      email: `user${i+1}@isop.com`,
      status: i%5 === 0 ? 'pending' : 'active',
      lastActive: new Date(Date.now() - Math.random()*30*24*60*60*1000).toLocaleDateString()
    }));
  }

  // Mock data for other sections...
  mockApplications() { /* ... */ }
  mockOpportunities() { /* ... */ }
  calculateStats() { 
    return {
      totalUsers: 1284,
      applications: 326,
      opportunities: 41,
      pending: 24
    };
  }

  getStatusClass(status) {
    return status === 'pending' ? 'badge--warning' : 
           status === 'approved' ? 'badge--success' : 'badge--danger';
  }
}

// Global functions
window.AdminDashboard = AdminDashboard;
window.showDetailModal = function(type, id) {
  const data = type === 'user' ? adminDashboard.users.find(u => u.id === id) : 
              type === 'application' ? adminDashboard.applications.find(a => a.id === id) : null;
  if (data) showModal(renderDetailModal(data, type));
};

function navigateTo(section) {
  document.querySelector(`[data-section="${section}"]`).click();
}

function showModal(content) {
  const modal = document.createElement('div');
  modal.className = 'admin-modal';
  modal.innerHTML = content;
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:10001;display:flex;align-items:center;justify-content:center;padding:2rem;';
  modal.onclick = (e) => e.target === modal && modal.remove();
  document.body.appendChild(modal);
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Init
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
  const admin = getAuth();
  if (admin && admin.role === 'admin') {
    adminDashboard = new AdminDashboard(document.querySelector('.main-content'), admin);
    adminDashboard.render();
  }
});
