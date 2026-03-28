// STUDENT DASHBOARD - IMPROVED, CLEANER, CLICKABLE, MORE RELIABLE

class StudentDashboard {
  constructor(container, user) {
    this.container = container;
    this.user = user;

    this.opportunities = getOpportunities() || [];
    this.applications = getStudentApplications() || [];
    this.saved = getStudentSavedOpportunities() || [];
    this.training = getStudentTrainingProgress() || [];
    this.mentor = getStudentMentor() || null;
    this.meetings = getStudentMeetings() || [];
    this.notifications = getStudentNotifications() || [];

    const trainingAverage = this.training.length
      ? Math.round(
          this.training.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) /
            this.training.length
        )
      : 0;

    this.stats = {
      opps: this.opportunities.length,
      apps: this.applications.length,
      saved: this.saved.length,
      training: trainingAverage
    };
  }

  render() {
    this.container.innerHTML = `
      ${this.renderTopbar()}
      ${this.renderStatsGrid()}
      ${this.renderOverviewCards()}
      ${this.renderApplicationsTable()}
      ${this.renderTrainingCards()}
      ${this.renderNotificationsSection()}
    `;

    this.bindEvents();
    this.updateStatsLive();
  }

  renderTopbar() {
    return `
      <div class="topbar">
        <div>
          <h1>Welcome, ${this.escapeHtml(this.user.name || this.user.email || "Student")}!</h1>
          <p>Your dashboard overview</p>
        </div>
        <div class="topbar-actions">
          <button class="btn btn-secondary" id="quickSearchBtn">🔍 Search</button>
          <button class="btn btn-primary" id="newMeetingBtn">📅 New Meeting</button>
        </div>
      </div>
    `;
  }

  renderStatsGrid() {
    return `
      <div class="stats-grid">
        <div class="stat-card clickable" data-click="opps">
          <div class="stat-label">Available Opps</div>
          <div class="stat-number" data-stat="${this.stats.opps}">0</div>
        </div>
        <div class="stat-card clickable" data-click="apps">
          <div class="stat-label">Applications</div>
          <div class="stat-number" data-stat="${this.stats.apps}">0</div>
        </div>
        <div class="stat-card clickable" data-click="saved">
          <div class="stat-label">Saved Items</div>
          <div class="stat-number" data-stat="${this.stats.saved}">0</div>
        </div>
        <div class="stat-card clickable" data-click="training">
          <div class="stat-label">Training Avg</div>
          <div class="stat-number" data-stat="${this.stats.training}">0</div>
        </div>
      </div>
    `;
  }

  renderOverviewCards() {
    const recommended = this.getRecommended();

    return `
      <div class="content-grid">
        <div class="card">
          <h2 class="card-title"><span>🎯</span> Recommended Opportunities (${recommended.length})</h2>
          <div class="opp-grid" id="recOpps">
            ${this.renderOppCards(recommended)}
          </div>
        </div>

        <div class="card">
          <h2 class="card-title"><span>👩‍🏫</span> Mentor Status</h2>
          <div id="mentorCard">
            ${this.renderMentorCard()}
          </div>
        </div>
      </div>
    `;
  }

  renderOppCards(opps) {
    if (!opps.length) {
      return `<p class="no-data">No opportunities found</p>`;
    }

    return opps
      .map(
        (opp) => `
          <div class="opp-card clickable" data-opp="${opp.id}">
            <h3 class="opp-title">${this.escapeHtml(opp.title || "Untitled opportunity")}</h3>
            <div class="opp-meta">
              ${this.escapeHtml(opp.location || "Remote")} •
              ${this.escapeHtml(opp.type || "Opportunity")} •
              Ends ${this.escapeHtml(opp.deadline || "TBD")}
            </div>
            <p class="opp-desc">${this.escapeHtml(
              (opp.description || "No description available").substring(0, 120)
            )}...</p>

            <div class="opp-actions">
              <button class="btn btn-secondary btn-sm btn-info-opportunity" data-opp-id="${opp.id}">ℹ️ Info</button>
              <button class="btn btn-primary btn-sm btn-apply-opportunity" data-opp-id="${opp.id}">Apply</button>
              <button class="btn btn-outline btn-sm btn-save-opportunity" data-opp-id="${opp.id}">⭐ Save</button>
            </div>
          </div>
        `
      )
      .join("");
  }

  renderApplicationsTable() {
    if (!this.applications.length) {
      return `
        <div class="card empty">
          <h2 class="card-title"><span>📋</span> My Applications</h2>
          <p>No applications yet. Start applying!</p>
        </div>
      `;
    }

    const rows = this.applications
      .map(
        (app) => `
          <tr class="app-row" data-app-id="${app.id}">
            <td><strong>${this.escapeHtml(app.title || "Untitled application")}</strong></td>
            <td>${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-"}</td>
            <td><span class="badge ${this.getBadgeClass(app.status)}">${this.escapeHtml(app.status || "Submitted")}</span></td>
            <td>${this.escapeHtml(app.opportunityId || "-")}</td>
          </tr>
        `
      )
      .join("");

    return `
      <div class="card">
        <h2 class="card-title"><span>📋</span> My Applications (${this.applications.length})</h2>
        <div class="table-container">
          <table class="table clickable-rows">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Date</th>
                <th>Status</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderTrainingCards() {
    if (!this.training.length) {
      return `
        <div class="card empty">
          <h2 class="card-title"><span>📚</span> Training Progress</h2>
          <p>Training modules coming soon.</p>
        </div>
      `;
    }

    const cards = this.training
      .map((mod) => {
        const progress = Number(mod.progress) || 0;

        return `
          <div class="training-card clickable" data-training-id="${mod.id}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <h3>${this.escapeHtml(mod.title || "Untitled Module")}</h3>
              <span>${progress}%</span>
            </div>
            <div class="progress">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <div style="margin-top:1rem; font-size:0.95rem; opacity:0.9;">
              ${progress >= 100 ? "✅ Completed" : "Continue module"}
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="card">
        <h2 class="card-title"><span>📚</span> Training Progress</h2>
        <div style="display:grid; gap:1.5rem;">
          ${cards}
        </div>
      </div>
    `;
  }

  renderNotificationsSection() {
    return `
      <div class="card">
        <h2 class="card-title"><span>🔔</span> Notifications (${this.notifications.length})</h2>
        ${
          this.notifications.length
            ? this.notifications
                .slice(0, 5)
                .map(
                  (n) => `
                    <div class="notification clickable" data-notification-id="${n.id}">
                      <div style="font-weight:600; margin-bottom:0.5rem;">${this.escapeHtml(n.text || "Notification")}</div>
                      <div style="font-size:0.9rem; opacity:0.8;">
                        ${n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  `
                )
                .join("")
            : `<p class="no-data">No notifications yet</p>`
        }
        ${
          this.notifications.length > 5
            ? '<button class="btn btn-secondary" style="width:100%; margin-top:1rem;">View All</button>'
            : ""
        }
      </div>
    `;
  }

  renderMentorCard() {
    if (!this.mentor) {
      return `
        <div style="text-align:center; padding:2rem; opacity:0.8;">
          <div style="font-size:3rem; margin-bottom:1rem;">👥</div>
          <h3>No mentor assigned</h3>
          <p>Connect with a mentor to get personalized guidance</p>
          <button class="btn btn-primary" id="requestMentorBtn">Find Mentor</button>
        </div>
      `;
    }

    const nextMeeting = this.meetings.find((m) => new Date(m.time) > new Date());

    return `
      <div style="text-align:center;">
        <div class="mentor-avatar">👩‍💼</div>
        <h3>${this.escapeHtml(this.mentor.name || "Your Mentor")}</h3>
        <p style="color:rgba(255,255,255,0.8); margin-bottom:1.5rem;">
          ${this.escapeHtml(this.mentor.expertise || "Mentor")}
        </p>
        <div style="margin-bottom:1.5rem;">
          <div style="font-size:0.9rem; opacity:0.7; margin-bottom:0.5rem;">Next Session</div>
          <div style="font-weight:600;">
            ${nextMeeting ? new Date(nextMeeting.time).toLocaleString() : "Schedule one"}
          </div>
        </div>
        <div class="action-row">
          <button class="btn btn-primary btn-sm" id="messageMentorBtn">💬 Message</button>
          <button class="btn btn-secondary btn-sm" id="bookSessionBtn">📅 Book Session</button>
        </div>
      </div>
    `;
  }

  getRecommended() {
    const appliedIds = this.applications.map((a) => a.opportunityId);
    return this.opportunities.filter((opp) => !appliedIds.includes(opp.id)).slice(0, 6);
  }

  getBadgeClass(status) {
    const classes = {
      Submitted: "badge-warning",
      "Under Review": "badge-warning",
      Accepted: "badge-success",
      Interview: "badge-success",
      Rejected: "badge-danger"
    };
    return classes[status] || "badge-default";
  }

  bindEvents() {
    document.getElementById("quickSearchBtn")?.addEventListener("click", () => {
      if (typeof showQuickSearch === "function") showQuickSearch();
    });

    document.getElementById("newMeetingBtn")?.addEventListener("click", () => {
      if (typeof showMeetingModal === "function") showMeetingModal();
    });

    document.getElementById("requestMentorBtn")?.addEventListener("click", () => {
      if (typeof requestMentor === "function") requestMentor();
    });

    document.getElementById("messageMentorBtn")?.addEventListener("click", () => {
      if (typeof messageMentor === "function") messageMentor();
    });

    document.getElementById("bookSessionBtn")?.addEventListener("click", () => {
      if (typeof showMeetingModal === "function") showMeetingModal();
    });

    document.querySelectorAll(".opp-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        const oppId = card.dataset.opp;
        if (oppId) showOppModal(oppId);
      });
    });

    document.querySelectorAll(".btn-info-opportunity").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        showOppModal(btn.dataset.oppId);
      });
    });

    document.querySelectorAll(".btn-apply-opportunity").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        applyOpp(btn.dataset.oppId);
      });
    });

    document.querySelectorAll(".btn-save-opportunity").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSave(btn.dataset.oppId);
      });
    });

    document.querySelectorAll(".app-row").forEach((row) => {
      row.addEventListener("click", () => {
        showAppDetails(row.dataset.appId);
      });
    });

    document.querySelectorAll(".training-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (typeof continueTraining === "function") {
          continueTraining(card.dataset.trainingId);
        }
      });
    });

    document.querySelectorAll(".notification").forEach((item) => {
      item.addEventListener("click", () => {
        if (typeof markNotificationRead === "function") {
          markNotificationRead(item.dataset.notificationId);
        }
      });
    });
  }

  updateStatsLive() {
    document.querySelectorAll("[data-stat]").forEach((stat) => {
      const target = Number(stat.dataset.stat) || 0;
      let current = 0;
      const increment = Math.max(1, Math.ceil(target / 30));

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target + (stat.dataset.stat.includes("%") ? "%" : "");
          clearInterval(timer);
        } else {
          stat.textContent = current;
        }
      }, 20);
    });
  }

  escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

// ---------- GLOBAL HELPERS ----------

function showOppModal(oppId) {
  const opp = (getOpportunities() || []).find((o) => o.id === oppId);
  if (!opp) return;

  const modalContent = `
    <div class="modal-content" style="background:white; padding:2rem; border-radius:20px; max-width:600px; width:min(90vw,600px);">
      <h2>${opp.title}</h2>
      <p><strong>Type:</strong> ${opp.type || "-"} | <strong>Location:</strong> ${opp.location || "-"}</p>
      <p><strong>Deadline:</strong> ${opp.deadline || "-"}</p>
      <div style="margin:1.5rem 0; line-height:1.6;">${opp.description || "No description available."}</div>
      <div style="display:flex; gap:1rem; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="applyOpp('${opp.id}'); closeModal()">Apply Now</button>
        <button class="btn btn-secondary" onclick="toggleSave('${opp.id}')">Save</button>
        <button class="btn btn-outline" onclick="closeModal()">Close</button>
      </div>
    </div>
  `;

  showModal(modalContent);
}

function showAppDetails(appId) {
  const app = (getStudentApplications() || []).find((a) => a.id === appId);
  if (!app) return;

  showModal(`
    <div class="modal-content" style="background:white; padding:2rem; border-radius:20px; max-width:500px; width:min(90vw,500px);">
      <h2>${app.title || "Application Details"}</h2>
      <p><strong>Status:</strong> <span class="badge ${getBadgeClassGlobal(app.status)}">${app.status || "Submitted"}</span></p>
      <p><strong>Applied:</strong> ${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-"}</p>
      <p><strong>ID:</strong> ${app.id}</p>
      <button class="btn btn-primary" onclick="closeModal()" style="width:100%; margin-top:1.5rem;">Got it</button>
    </div>
  `);
}

function showModal(content) {
  closeModal();

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.cssText =
    "position:fixed; inset:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); padding:1rem;";

  modal.innerHTML = content;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
}

function closeModal() {
  document.querySelector(".modal")?.remove();
}

function applyOpp(id) {
  window.location.href = 'apply.html?oppId=' + encodeURIComponent(id);
}

function toggleSave(id) {
  const saved = getStudentSavedOpportunities() || [];
  const alreadySaved = saved.some((item) => item.id === id || item.opportunityId === id);

  if (alreadySaved) {
    if (typeof removeSavedOpportunity === "function") removeSavedOpportunity(id);
    if (typeof renderAlert === "function") renderAlert("info", "Removed from saved.", "main");
    return;
  }

  if (typeof saveOpportunity === "function") {
    saveOpportunity(id);
    if (typeof renderAlert === "function") renderAlert("success", "Opportunity saved!", "main");
  }
}

function getBadgeClassGlobal(status) {
  const classes = {
    Submitted: "badge-warning",
    "Under Review": "badge-warning",
    Accepted: "badge-success",
    Interview: "badge-success",
    Rejected: "badge-danger"
  };
  return classes[status] || "badge-default";
}

window.StudentDashboard = StudentDashboard;
window.showOppModal = showOppModal;
window.showAppDetails = showAppDetails;
window.applyOpp = applyOpp;
window.toggleSave = toggleSave;
window.closeModal = closeModal;