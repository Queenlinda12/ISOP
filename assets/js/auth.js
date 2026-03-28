// AUTH SYSTEM - ENHANCED WITH LOADING + BETTER UX
// Auto-creates demo users, role-based redirects

const AUTH_KEY = 'isop_auth';
const DEMO_USERS = {
  'student@isop.com': { password: 'student123', role: 'student', name: 'Student User' },
  'mentor@isop.com': { password: 'mentor123', role: 'mentor', name: 'Mentor User' },
  'admin@isop.com': { password: 'admin123', role: 'admin', name: 'Admin User' }
};

// Initialize demo users in localStorage
function initDemoUsers() {
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  
  Object.entries(DEMO_USERS).forEach(([email, data]) => {
    if (!users.find(u => u.email === email)) {
      users.push({
        id: email.replace(/[@.]/g, '_'),
        email,
        role: data.role,
        name: data.name
      });
    }
  });
  
  localStorage.setItem('users', JSON.stringify(users));
}

// One-click role login - CORRECT ROLE DIRECTS
function loginAs(role) {
  initDemoUsers();
  const userData = DEMO_USERS[`${role}@isop.com`];
  const user = {
    id: `${role}_user`,
    email: `${role}@isop.com`,
    role: role,
    name: userData.name
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  redirectByRole(role);
}

// Enhanced email/password login — checks demo users then localDB registered users
async function handleEmailLogin(email, password, roleSelect = null, formElement = null) {
  const submitBtn = formElement?.querySelector('button[type="submit"]') || document.querySelector('.login-btn, .register-btn');
  const originalText = submitBtn?.textContent;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in...'; }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. Check demo users
    if (DEMO_USERS[normalizedEmail] && DEMO_USERS[normalizedEmail].password === password) {
      const demo = DEMO_USERS[normalizedEmail];
      const user = { id: demo.role + '_user', email: normalizedEmail, role: demo.role, name: demo.name };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      setTimeout(() => redirectByRole(roleSelect || demo.role), 400);
      return true;
    }

    // 2. Check localDB registered users
    if (window.localDB) {
      await window.localDB.ready;
      const dbUser = await window.localDB.findUserByEmail(normalizedEmail);
      if (dbUser && dbUser.password === password) {
        const user = { id: dbUser.id, email: dbUser.email, role: dbUser.role, name: dbUser.name };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        setTimeout(() => redirectByRole(roleSelect || dbUser.role), 400);
        return true;
      }
    }

    throw new Error('Invalid credentials');
  } catch (error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background:#fee2e2; color:#dc2626; padding:1rem; border-radius:12px; margin:1rem 0; font-size:0.95rem; border:1px solid #fecaca;';
    errorDiv.innerHTML = `<strong>Login failed</strong><br>Invalid email or password.<br><small>Demo: student@isop.com / student123</small>`;
    const card = document.querySelector('.auth-card');
    card?.insertBefore(errorDiv, card.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
    return false;
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
  }
}

// Role-based redirects - FIXED CORRECT PATHS
function redirectByRole(role) {
  const dashboards = {
    'student': 'student-dashboard.html',
    'mentor': 'mentor-tools.html', 
    'admin': 'admin.html'
  };
  window.location.href = dashboards[role] || 'index.html';
}

// Global handlers
document.addEventListener('DOMContentLoaded', () => {
  // Quick buttons
  document.querySelectorAll('.quick-btn, [onclick*="loginAs"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const roleMatch = e.target.textContent.match(/student|mentor|admin/i);
      const role = roleMatch ? roleMatch[0].toLowerCase() : 'student';
      loginAs(role);
    });
  });

  // Form handlers with UX
  document.querySelectorAll('form[class*="auth"], form[class*="login"]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const passInput = form.querySelector('input[type="password"]');
      const roleSelect = form.querySelector('select[name="role"]');
      
      if (!emailInput || !passInput) return;
      
      const success = await handleEmailLogin(
        emailInput.value, 
        passInput.value, 
        roleSelect ? roleSelect.value : null,
        form
      );
    });
  });
});

// Global exports
window.loginAs = loginAs;
window.handleEmailLogin = handleEmailLogin;
window.redirectByRole = redirectByRole;
