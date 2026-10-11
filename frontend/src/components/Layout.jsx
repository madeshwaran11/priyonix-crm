import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import priyonixLogo from "../assets/priyonix_logo.jpeg";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({
    followUps: [],
    tasks: [],
    leads: [],
  });
  const notificationPanelRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("crmUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    let requestInProgress = false;

    const loadNotificationData = async () => {
      // Avoid overlapping API requests if a refresh takes longer than expected.
      if (requestInProgress) return;
      requestInProgress = true;

      try {
        const results = await Promise.allSettled([
          api.get("/follow-ups"),
          api.get("/tasks"),
          api.get("/leads"),
        ]);

        if (!mounted) return;

        const dataAt = (index) =>
          results[index].status === "fulfilled" &&
          Array.isArray(results[index].value?.data)
            ? results[index].value.data
            : [];

        setNotificationData({
          followUps: dataAt(0),
          tasks: dataAt(1),
          leads: dataAt(2),
        });
      } finally {
        requestInProgress = false;
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        loadNotificationData().catch((error) => {
          console.warn("Could not refresh CRM notifications:", error);
        });
      }
    };

    // Load immediately, then refresh every 30 seconds.
    refreshWhenVisible();
    const refreshInterval = window.setInterval(refreshWhenVisible, 30_000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      mounted = false;
      window.clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    if (!notificationOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (!notificationPanelRef.current?.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationOpen]);

  const notificationUserKey = user?.id || user?.email || "guest";
  const notificationReadKey = `priyonix-crm-read-notifications:${notificationUserKey}`;
  const notificationDismissKey = `priyonix-crm-dismissed-notifications:${notificationUserKey}`;

  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("crmUser") || "{}");
      const key = `priyonix-crm-read-notifications:${savedUser?.id || savedUser?.email || "guest"}`;
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Dismissed alerts are hidden from the panel after the user opens them.
  // This only dismisses the notification UI item; it does not delete CRM records.
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("crmUser") || "{}");
      const key = `priyonix-crm-dismissed-notifications:${savedUser?.id || savedUser?.email || "guest"}`;
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const role = String(user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "U";

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);

    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("crmUser");
      setUser(null);
      setLogoutLoading(false);
      navigate("/login", { replace: true });
    }
  };

  const navigationSections = [
    {
      title: "Workspace",
      items: [
        { path: "/dashboard", label: "Dashboard", icon: "⌂", description: "Business overview", show: true },
      ],
    },
    {
      title: "Customer Management",
      items: [
        { path: "/leads", label: "Leads", icon: "◈", description: "Sales opportunities", show: true },
        { path: "/customers", label: "Customers", icon: "◎", description: "Customer database", show: true },
        { path: "/follow-ups", label: "Follow-ups", icon: "◷", description: "Scheduled conversations", show: true },
        { path: "/activities", label: "Activities", icon: "✦", description: "Communication history", show: true },
      ],
    },
    {
      title: "Operations",
      items: [
        { path: "/tasks", label: "Tasks", icon: "✓", description: "Work and assignments", show: true },
        { path: "/reports", label: "Reports", icon: "▥", description: "Business intelligence", show: isAdmin || isManager },
      ],
    },
    {
      title: "Administration",
      items: [
        { path: "/users", label: "Users", icon: "♙", description: "User management", show: isAdmin },
      ],
    },
  ];

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const getPageTitle = () => {
    const titles = {
      "/dashboard": "Dashboard",
      "/leads": "Leads",
      "/customers": "Customers",
      "/follow-ups": "Follow-ups",
      "/tasks": "Tasks",
      "/activities": "Activities",
      "/reports": "Reports",
      "/users": "Users",
      "/profile": "Profile",
    };
    return titles[location.pathname] || "PriyoniX CRM";
  };

  const dateKey = (value) => {
    if (!value) return "";
    const raw = String(value).split("T")[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
  };

  const todayKey = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  const formatNotificationDate = (value) => {
    const raw = dateKey(value);
    if (!raw) return "Date not set";
    const date = new Date(`${raw}T00:00:00`);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const notifications = (() => {
    const items = [];
    const currentUserId = user?.id ?? user?.userId ?? user?.employeeId;
    const currentUserIdKey = currentUserId == null ? "" : String(currentUserId);

    const getAssignedUserId = (task) => {
      const assignedId =
        task?.assignedUserId ??
        task?.assignedToId ??
        task?.userId ??
        task?.assignedUser?.id ??
        task?.assignedTo?.id ??
        task?.assignedEmployee?.id;
      return assignedId == null ? "" : String(assignedId);
    };

    // Notify only the user assigned to each active task. The ID is stable so
    // the same assignment stays dismissed after opening it or refreshing.
    if (currentUserIdKey) {
      const assignedTasks = notificationData.tasks
        .filter((task) => {
          const status = String(task.status || "TODO").toUpperCase();
          const taskId = task.id;
          const due = dateKey(task.dueDate || task.deadline);
          const isOverdue = due && due < todayKey;
          return (
            taskId != null &&
            getAssignedUserId(task) === currentUserIdKey &&
            !["COMPLETED", "DONE", "CANCELLED", "CANCELED"].includes(status) &&
            !isOverdue
          );
        })
        .sort((a, b) => {
          const aDate = dateKey(a.createdAt || a.createdOn || a.assignedAt || a.dueDate) || "0000-00-00";
          const bDate = dateKey(b.createdAt || b.createdOn || b.assignedAt || b.dueDate) || "0000-00-00";
          return bDate.localeCompare(aDate) || Number(b.id || 0) - Number(a.id || 0);
        })
        .slice(0, 5);

      assignedTasks.forEach((task) => {
        const due = dateKey(task.dueDate || task.deadline);
        const dueText = due ? `Due ${formatNotificationDate(due)}` : "Assigned to you";
        items.push({
          id: `task-assigned-${task.id}`,
          title: "New task assigned to you",
          description: `${task.title || "Untitled task"} · ${dueText}`,
          route: "/tasks",
          icon: "✓",
          tone: "cyan",
          time: dateKey(task.createdAt || task.createdOn || task.assignedAt) || due || todayKey,
        });
      });
    }

    const activeFollowUps = notificationData.followUps
      .filter((item) => {
        const status = String(item.status || "PENDING").toUpperCase();
        const date = dateKey(item.followUpDate || item.dueDate || item.date);
        return !["COMPLETED", "CANCELLED", "CANCELED", "DONE"].includes(status) && date && date <= todayKey;
      })
      .sort((a, b) => String(a.followUpDate || a.dueDate || a.date).localeCompare(String(b.followUpDate || b.dueDate || b.date)))
      .slice(0, 4);

    activeFollowUps.forEach((item) => {
      const due = dateKey(item.followUpDate || item.dueDate || item.date);
      const label = due < todayKey ? "Follow-up overdue" : "Follow-up due today";
      const contact = item.leadName || item.customerName || item.lead?.name || item.customer?.name || item.title || "Scheduled follow-up";
      items.push({
        id: `follow-up-${item.id ?? `${contact}-${due}`}`,
        title: label,
        description: `${contact} · ${formatNotificationDate(due)}`,
        route: "/follow-ups",
        icon: "◷",
        tone: due < todayKey ? "danger" : "purple",
        time: due,
      });
    });

    const overdueTasks = notificationData.tasks
      .filter((task) => {
        const status = String(task.status || "TODO").toUpperCase();
        const due = dateKey(task.dueDate || task.deadline);
        const assignedId = getAssignedUserId(task);
        const isAssignedToCurrentUser =
          currentUserIdKey && assignedId === currentUserIdKey;
        const isUnassignedTask = !assignedId;
        const mayNotifyCurrentUser = isAssignedToCurrentUser || (isUnassignedTask && (isAdmin || isManager));
        return (
          due &&
          due < todayKey &&
          mayNotifyCurrentUser &&
          !["COMPLETED", "DONE", "CANCELLED", "CANCELED"].includes(status)
        );
      })
      .sort((a, b) => String(a.dueDate || a.deadline).localeCompare(String(b.dueDate || b.deadline)))
      .slice(0, 3);

    overdueTasks.forEach((task) => {
      const due = dateKey(task.dueDate || task.deadline);
      items.push({
        id: `task-${task.id ?? `${task.title}-${due}`}`,
        title: "Task overdue",
        description: `${task.title || "Untitled task"} · Due ${formatNotificationDate(due)}`,
        route: "/tasks",
        icon: "✓",
        tone: "cyan",
        time: due,
      });
    });

    const latestLeads = [...notificationData.leads]
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
      .slice(0, 2);

    latestLeads.forEach((lead) => {
      const createdDate = lead.createdAt || lead.createdOn || lead.createdDate;
      const label = createdDate ? `Lead added · ${formatNotificationDate(createdDate)}` : "Lead record";
      items.push({
        id: `lead-${lead.id ?? lead.email ?? lead.name}`,
        title: label,
        description: `${lead.name || "New lead"}${lead.company ? ` · ${lead.company}` : ""}`,
        route: "/leads",
        icon: "◈",
        tone: "blue",
        time: dateKey(createdDate) || "0000-00-00",
      });
    });

    return items
      .sort((a, b) => String(b.time).localeCompare(String(a.time)))
      .filter((item) => !dismissedNotificationIds.includes(item.id));
  })();

  const unreadNotifications = notifications.filter(
    (notification) => !readNotificationIds.includes(notification.id)
  );

  const markAllNotificationsRead = () => {
    const allIds = notifications.map((notification) => notification.id);
    setReadNotificationIds((previous) => {
      const updated = [...new Set([...previous, ...allIds])];
      try {
        localStorage.setItem(notificationReadKey, JSON.stringify(updated));
      } catch (error) {
        console.warn("Could not save notification read state:", error);
      }
      return updated;
    });
  };

  const openNotification = (notification) => {
    setReadNotificationIds((previous) => {
      const updated = [...new Set([...previous, notification.id])];
      try {
        localStorage.setItem(notificationReadKey, JSON.stringify(updated));
      } catch (error) {
        console.warn("Could not save notification read state:", error);
      }
      return updated;
    });

    // Once a notification is opened, remove it from the panel and keep it dismissed
    // across refreshes. The underlying follow-up, task, or lead remains unchanged.
    setDismissedNotificationIds((previous) => {
      const updated = [...new Set([...previous, notification.id])];
      try {
        localStorage.setItem(notificationDismissKey, JSON.stringify(updated));
      } catch (error) {
        console.warn("Could not save dismissed notification state:", error);
      }
      return updated;
    });

    setNotificationOpen(false);
    navigate(notification.route);
  };

  const viewFollowUps = () => {
    setNotificationOpen(false);
    if (location.pathname === "/follow-ups") {
      // The target page is already open; make the action visibly useful.
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/follow-ups");
  };

  return (
    <div className="priyonix-app-shell">
      <style>{layoutStyles}</style>

      {mobileMenuOpen && (
        <div className="layout-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`priyonix-sidebar ${mobileMenuOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-glow sidebar-glow-one" />
        <div className="sidebar-glow sidebar-glow-two" />

        <div className="sidebar-brand">
          <div className="sidebar-logo-wrap">
            <img src={priyonixLogo} alt="PriyoniX" className="sidebar-logo" />
          </div>
          <div className="sidebar-brand-text">
            <strong>PriyoniX</strong>
            <span>CRM PLATFORM</span>
          </div>
          <button
            className="mobile-sidebar-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <button className="sidebar-user-card" onClick={() => navigate("/profile")}>
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <strong>{displayName}</strong>
            <span>{role || "USER"}</span>
          </div>
          <span className="sidebar-user-arrow">→</span>
        </button>

        <nav className="sidebar-navigation">
          {navigationSections.map((section) => {
            const visibleItems = section.items.filter((item) => item.show);
            if (!visibleItems.length) return null;

            return (
              <div className="sidebar-section" key={section.title}>
                <div className="sidebar-section-title">{section.title}</div>
                <div className="sidebar-section-items">
                  {visibleItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`sidebar-nav-item ${active ? "sidebar-nav-active" : ""}`}
                      >
                        <span className={`sidebar-nav-icon ${active ? "sidebar-nav-icon-active" : ""}`}>
                          {item.icon}
                        </span>
                        <span className="sidebar-nav-content">
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                        {active && <span className="sidebar-active-dot" />}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-security">
            <div className="security-icon">✓</div>
            <div>
              <strong>Workspace Secure</strong>
              <span>Protected CRM session</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} disabled={logoutLoading}>
            <span className="logout-icon">↪</span>
            <span>{logoutLoading ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </aside>

      <main className="priyonix-main">
        <header className="priyonix-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span />
              <span />
              <span />
            </button>
            <div className="topbar-page-info">
              <span>PRIYONIX CRM</span>
              <strong>{getPageTitle()}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-status">
              <span className="status-pulse" />
              <span>System online</span>
            </div>
            <div className="notification-wrap" ref={notificationPanelRef}>
              <button
                type="button"
                className="topbar-icon-button"
                title="Notifications"
                aria-label={`Open notifications${unreadNotifications.length ? `, ${unreadNotifications.length} unread` : ""}`}
                aria-expanded={notificationOpen}
                aria-haspopup="dialog"
                onClick={() => setNotificationOpen((open) => !open)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="notification-bell">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
                {unreadNotifications.length > 0 && (
                  <span className="notification-count">
                    {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <section className="notification-panel" role="dialog" aria-label="CRM notifications">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      <span>Your latest CRM updates</span>
                    </div>
                    <span className="notification-unread-label">
                      {unreadNotifications.length} unread
                    </span>
                  </div>

                  {notifications.length > 0 ? (
                    <div className="notification-list">
                      {notifications.map((notification) => {
                        const isRead = readNotificationIds.includes(notification.id);
                        return (
                          <button
                            type="button"
                            key={notification.id}
                            className={`notification-item ${isRead ? "notification-read" : ""}`}
                            onClick={() => openNotification(notification)}
                          >
                            <span className={`notification-item-icon ${notification.tone}`}>
                              {notification.icon}
                            </span>
                            <span className="notification-item-copy">
                              <strong>{notification.title}</strong>
                              <small>{notification.description}</small>
                              <em>Click to open {notification.route === "/follow-ups" ? "Follow-Ups" : notification.route === "/tasks" ? "Tasks" : "Leads"}</em>
                            </span>
                            {!isRead && <span className="notification-unread-dot" aria-label="Unread" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="notification-empty">
                      <span className="notification-empty-icon">✓</span>
                      <strong>You’re all caught up</strong>
                      <p>Task assignments, due follow-ups, and overdue tasks will appear here.</p>
                    </div>
                  )}

                  <div className="notification-panel-footer">
                    <button type="button" onClick={markAllNotificationsRead} disabled={unreadNotifications.length === 0}>
                      Mark all as read
                    </button>
                    <button type="button" onClick={viewFollowUps}>
                      View Follow-Ups →
                    </button>
                  </div>
                </section>
              )}
            </div>
            <button className="topbar-profile" onClick={() => navigate("/profile")}>
              <div className="topbar-avatar">{initials}</div>
              <div className="topbar-user-text">
                <strong>{displayName}</strong>
                <span>{role || "USER"}</span>
              </div>
              <span className="topbar-chevron">⌄</span>
            </button>
          </div>
        </header>

        <div className="priyonix-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const layoutStyles = `
* { box-sizing: border-box; }

:root {
  --px-bg: #071329;
  --px-panel: #0b1b38;
  --px-border: rgba(124, 157, 255, 0.19);
  --px-text: #f4f7ff;
  --px-muted: #91a8ce;
  --px-blue: #398cff;
  --px-purple: #7957ff;
  --px-cyan: #35e5ff;
}

.priyonix-app-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: radial-gradient(circle at 85% 5%, rgba(66, 93, 255, .12), transparent 30%), #071329;
  color: var(--px-text);
  font-family: Inter, "Segoe UI", Arial, sans-serif;
}

.priyonix-sidebar {
  position: fixed; inset: 0 auto 0 0; width: 278px;
  display: flex; flex-direction: column; padding: 22px 15px 15px;
  overflow-x: hidden; overflow-y: auto; z-index: 1200; color: white;
  background: radial-gradient(circle at 15% 5%, rgba(59,130,246,.22), transparent 27%),
    radial-gradient(circle at 85% 80%, rgba(124,58,237,.17), transparent 32%),
    linear-gradient(155deg, #07152d, #0a1e40 55%, #0b2450);
  border-right: 1px solid rgba(255,255,255,.08);
  box-shadow: 18px 0 45px rgba(0,0,0,.12);
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.15) transparent;
}
.priyonix-sidebar::-webkit-scrollbar { width: 4px; }
.priyonix-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 10px; }
.sidebar-glow { position: absolute; pointer-events: none; border-radius: 50%; filter: blur(15px); }
.sidebar-glow-one { width: 180px; height: 180px; top: -100px; left: -80px; background: rgba(37,99,235,.28); }
.sidebar-glow-two { width: 220px; height: 220px; right: -130px; bottom: 100px; background: rgba(124,58,237,.17); }

.sidebar-brand {
  position: relative; z-index: 2; display: flex; align-items: center; gap: 11px;
  min-height: 57px; padding: 0 7px 20px; border-bottom: 1px solid rgba(255,255,255,.09); flex-shrink: 0;
}
.sidebar-logo-wrap { width: 48px; height: 48px; padding: 3px; background: white; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 28px rgba(37,99,235,.24); flex-shrink: 0; }
.sidebar-logo { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
.sidebar-brand-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.sidebar-brand-text strong { color: white; font-size: 21px; line-height: 1; font-weight: 800; letter-spacing: -.5px; }
.sidebar-brand-text span { color: #91a8d0; font-size: 9px; font-weight: 750; letter-spacing: 1.2px; }
.mobile-sidebar-close { display: none; }

.sidebar-user-card {
  position: relative; z-index: 2; width: 100%; display: flex; align-items: center; gap: 10px;
  margin: 18px 0 13px; padding: 10px; border: 1px solid rgba(255,255,255,.1); border-radius: 13px;
  background: linear-gradient(135deg, rgba(255,255,255,.085), rgba(255,255,255,.025)); color: white;
  cursor: pointer; text-align: left; transition: background .2s ease, border-color .2s ease;
}
.sidebar-user-card:hover { background: rgba(255,255,255,.1); border-color: rgba(147,197,253,.25); }
.sidebar-user-avatar, .topbar-avatar {
  display: flex; align-items: center; justify-content: center; color: white; font-weight: 800;
  background: linear-gradient(135deg, #398cff, #7957ff); box-shadow: 0 7px 18px rgba(57,140,255,.22);
}
.sidebar-user-avatar { width: 37px; height: 37px; flex-shrink: 0; border-radius: 11px; font-size: 12px; }
.sidebar-user-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
.sidebar-user-info strong { color: #eef5ff; font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-info span { color: #91a8ce; font-size: 9px; font-weight: 700; letter-spacing: .7px; text-transform: uppercase; }
.sidebar-user-arrow { color: #8ca5cc; font-size: 15px; }

.sidebar-navigation { position: relative; z-index: 2; flex: 1; padding: 4px 0 12px; }
.sidebar-section { margin-bottom: 19px; }
.sidebar-section-title { color: #829ec8; font-size: 9px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; padding: 0 11px 8px; }
.sidebar-section-items { display: flex; flex-direction: column; gap: 4px; }
.sidebar-nav-item {
  position: relative; min-height: 53px; display: flex; align-items: center; gap: 11px; padding: 8px 10px;
  border: 1px solid transparent; border-radius: 11px; text-decoration: none; color: #b4c5e8;
  transition: color .2s ease, background .2s ease, border-color .2s ease;
}
.sidebar-nav-item:hover { color: #fff; background: rgba(255,255,255,.06); }
.sidebar-nav-active {
  color: white !important;
  background: linear-gradient(100deg, rgba(37,99,235,.34), rgba(79,70,229,.2)) !important;
  border-color: rgba(96,165,250,.22);
  box-shadow: inset 3px 0 0 #398cff, 0 8px 25px rgba(0,0,0,.09);
}
.sidebar-nav-icon { width: 35px; height: 35px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255,255,255,.045); color: #a8bfdf; font-size: 16px; font-weight: 700; }
.sidebar-nav-icon-active { color: white !important; background: linear-gradient(135deg, #398cff, #624cf0) !important; box-shadow: 0 7px 18px rgba(57,140,255,.25); }
.sidebar-nav-content { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.sidebar-nav-content strong { color: inherit; font-size: 13px; line-height: 1.2; font-weight: 650; }
.sidebar-nav-content small { color: #8ba3c9; font-size: 10px; line-height: 1.2; white-space: nowrap; }
.sidebar-nav-active .sidebar-nav-content small { color: #b6cafa; }
.sidebar-active-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--px-cyan); box-shadow: 0 0 9px rgba(53,229,255,.9); }

.sidebar-bottom { position: relative; z-index: 2; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.09); flex-shrink: 0; }
.sidebar-security { display: flex; align-items: center; gap: 8px; padding: 9px 8px; margin-bottom: 8px; }
.security-icon { width: 28px; height: 28px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(34,197,94,.12); color: #4ade80; font-size: 12px; }
.sidebar-security div:last-child { display: flex; flex-direction: column; gap: 3px; }
.sidebar-security strong { color: #c6d6ee; font-size: 10px; }
.sidebar-security span { color: #8198ba; font-size: 9px; }
.sidebar-logout { width: 100%; height: 40px; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid rgba(124,157,255,.2); border-radius: 9px; background: rgba(255,255,255,.045); color: #b4c8e8; font-family: inherit; font-size: 12px; font-weight: 650; cursor: pointer; transition: background .2s ease, color .2s ease; }
.sidebar-logout:hover { color: #fff; background: rgba(57,140,255,.16); }
.sidebar-logout:disabled { opacity: .55; cursor: not-allowed; }
.logout-icon { font-size: 15px; }

.priyonix-main { min-height: 100vh; min-height: 100dvh; min-width: 0; margin-left: 278px; background: #09152c; }
.priyonix-topbar {
  position: sticky; top: 0; z-index: 900; height: 78px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 30px; background: rgba(7,19,41,.94); border-bottom: 1px solid rgba(124,157,255,.2); backdrop-filter: blur(18px);
}
.topbar-left { display: flex; align-items: center; gap: 14px; }
.mobile-menu-button { display: none; width: 40px; height: 40px; border: 1px solid var(--px-border); border-radius: 10px; background: #10203d; cursor: pointer; flex-direction: column; justify-content: center; align-items: center; gap: 4px; }
.mobile-menu-button span { width: 17px; height: 2px; border-radius: 5px; background: #dbeafe; }
.topbar-page-info { display: flex; flex-direction: column; gap: 3px; }
.topbar-page-info span { color: #8eaddc; font-size: 9px; font-weight: 800; letter-spacing: 1.2px; }
.topbar-page-info strong { color: #f4f7ff; font-size: 20px; font-weight: 750; letter-spacing: -.4px; }
.topbar-right { display: flex; align-items: center; gap: 13px; }
.topbar-status { display: flex; align-items: center; gap: 7px; padding: 7px 10px; border: 1px solid rgba(53,224,161,.15); border-radius: 20px; background: rgba(53,224,161,.09); color: #6ee7b7; font-size: 10px; font-weight: 650; }
.status-pulse { width: 6px; height: 6px; border-radius: 50%; background: #35e0a1; box-shadow: 0 0 8px rgba(53,224,161,.65); }
.topbar-icon-button { position: relative; width: 39px; height: 39px; display: grid; place-items: center; border: 1px solid rgba(124,157,255,.24); border-radius: 10px; background: rgba(17,35,69,.9); color: #c6d7f5; cursor: pointer; transition: background .2s ease, transform .2s ease, border-color .2s ease; }
.topbar-icon-button:hover, .topbar-icon-button[aria-expanded="true"] { background: #172c52; border-color: rgba(124,157,255,.5); transform: translateY(-1px); }
.notification-wrap { position: relative; display: flex; align-items: center; }
.notification-bell { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.notification-count { position: absolute; top: -6px; right: -6px; min-width: 17px; height: 17px; padding: 0 4px; display: grid; place-items: center; border: 2px solid #071329; border-radius: 999px; color: white; background: #ef5575; font-size: 8px; line-height: 1; font-weight: 900; }
.notification-panel { position: absolute; top: calc(100% + 13px); right: 0; z-index: 1800; width: min(370px, calc(100vw - 24px)); max-height: min(520px, calc(100vh - 100px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(124,157,255,.25); border-radius: 17px; background: linear-gradient(155deg, rgba(13,27,56,.99), rgba(8,19,43,.99)); box-shadow: 0 24px 70px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.04); backdrop-filter: blur(18px); color: #f4f7ff; }
.notification-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 17px 18px 14px; border-bottom: 1px solid rgba(124,157,255,.14); }
.notification-panel-header > div { display: flex; flex-direction: column; gap: 4px; }
.notification-panel-header strong { color: #f4f7ff; font-size: 15px; font-weight: 850; }
.notification-panel-header span { color: #8fa6cc; font-size: 10px; }
.notification-unread-label { flex-shrink: 0; padding: 6px 8px; border: 1px solid rgba(124,157,255,.18); border-radius: 999px; color: #bdc9ff !important; background: rgba(99,102,241,.12); font-weight: 800; }
.notification-list { overflow-y: auto; padding: 5px 8px; scrollbar-width: thin; scrollbar-color: rgba(139,156,200,.25) transparent; }
.notification-item { width: 100%; display: flex; align-items: flex-start; gap: 11px; padding: 12px 10px; border: 1px solid transparent; border-radius: 12px; text-align: left; color: inherit; background: transparent; cursor: pointer; transition: background .18s ease, border-color .18s ease; }
.notification-item:hover { background: rgba(72,91,160,.18); border-color: rgba(124,157,255,.12); }
.notification-item.notification-read { opacity: .72; }
.notification-item-icon { width: 36px; height: 36px; flex: 0 0 36px; display: grid; place-items: center; border-radius: 11px; font-size: 16px; font-weight: 900; }
.notification-item-icon.purple { color: #c4b5fd; background: rgba(124,58,237,.19); }
.notification-item-icon.danger { color: #ff9aaa; background: rgba(225,29,72,.16); }
.notification-item-icon.cyan { color: #67e8f9; background: rgba(6,182,212,.15); }
.notification-item-icon.blue { color: #a5b4fc; background: rgba(79,70,229,.18); }
.notification-item-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.notification-item-copy strong { color: #f1f5ff; font-size: 11px; line-height: 1.35; font-weight: 850; }
.notification-item-copy small { color: #9fb0d0; font-size: 10px; line-height: 1.45; overflow-wrap: anywhere; }
.notification-item-copy em { color: #7f91bf; font-size: 9px; font-style: normal; }
.notification-unread-dot { width: 7px; height: 7px; flex: 0 0 7px; margin-top: 5px; border-radius: 50%; background: #35e5ff; box-shadow: 0 0 9px rgba(53,229,255,.65); }
.notification-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 22px; gap: 8px; }
.notification-empty-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 14px; color: #6ee7b7; background: rgba(34,197,94,.13); font-size: 20px; font-weight: 900; }
.notification-empty strong { color: #eaf0ff; font-size: 12px; }
.notification-empty p { max-width: 240px; margin: 0; color: #91a8ce; font-size: 10px; line-height: 1.5; }
.notification-panel-footer { display: flex; justify-content: space-between; gap: 8px; padding: 11px 13px; border-top: 1px solid rgba(124,157,255,.14); background: rgba(5,14,32,.48); }
.notification-panel-footer button { padding: 7px 9px; border: 1px solid rgba(124,157,255,.17); border-radius: 8px; color: #b9c9ec; background: rgba(255,255,255,.035); font: inherit; font-size: 9px; font-weight: 750; cursor: pointer; }
.notification-panel-footer button:last-child { color: #fff; border-color: transparent; background: linear-gradient(135deg,#6255ee,#8b4df2); }
.notification-panel-footer button:disabled { opacity: .45; cursor: not-allowed; }
.topbar-profile { display: flex; align-items: center; gap: 8px; border: none; background: transparent; color: inherit; cursor: pointer; padding: 2px; text-align: left; }
.topbar-avatar { width: 38px; height: 38px; border-radius: 11px; font-size: 11px; }
.topbar-user-text { display: flex; flex-direction: column; gap: 3px; min-width: 65px; }
.topbar-user-text strong { color: #f4f7ff; font-size: 11px; font-weight: 700; white-space: nowrap; max-width: 100px; overflow: hidden; text-overflow: ellipsis; }
.topbar-user-text span { color: #91a8ce; font-size: 8px; font-weight: 700; letter-spacing: .7px; }
.topbar-chevron { color: #9eb6db; font-size: 14px; margin-left: 2px; }
.priyonix-content { min-height: calc(100vh - 78px); min-height: calc(100dvh - 78px); padding: 28px 30px 40px; background: transparent; color: #f4f7ff; }
.layout-mobile-overlay { display: none; }

@media (max-width: 1050px) {
  .priyonix-sidebar { width: 245px; }
  .priyonix-main { margin-left: 245px; }
  .priyonix-topbar { padding: 0 22px; }
  .priyonix-content { padding: 24px 22px 35px; }
  .topbar-status { display: none; }
}
@media (max-width: 800px) {
  .priyonix-sidebar { width: 285px; transform: translateX(-105%); transition: transform .28s cubic-bezier(.22,1,.36,1); box-shadow: 15px 0 45px rgba(0,0,0,.3); }
  .sidebar-mobile-open { transform: translateX(0); }
  .mobile-sidebar-close { display: flex; margin-left: auto; width: 31px; height: 31px; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; background: rgba(255,255,255,.05); color: white; font-size: 20px; cursor: pointer; }
  .priyonix-main { margin-left: 0; }
  .layout-mobile-overlay { display: block; position: fixed; inset: 0; z-index: 1100; background: rgba(3,10,23,.62); backdrop-filter: blur(2px); }
  .priyonix-topbar { height: 68px; padding: 0 14px; }
  .mobile-menu-button { display: flex; }
  .topbar-page-info span { font-size: 8px; }
  .topbar-page-info strong { font-size: 17px; }
  .topbar-right { gap: 7px; }
  .topbar-profile { padding: 0; }
  .topbar-user-text, .topbar-chevron { display: none; }
  .topbar-icon-button { width: 37px; height: 37px; }
  .notification-panel { right: -44px; width: min(360px, calc(100vw - 20px)); max-height: calc(100vh - 90px); max-height: calc(100dvh - 90px); }
  .priyonix-content { min-height: calc(100vh - 68px); min-height: calc(100dvh - 68px); padding: 20px 15px 30px; }
}
@media (max-width: 480px) {
  .priyonix-topbar { padding: 0 10px; }
  .topbar-page-info strong { font-size: 16px; }
  .topbar-icon-button { width: 35px; height: 35px; }
  .notification-panel { right: -43px; }
  .topbar-avatar { width: 35px; height: 35px; }
  .priyonix-content { padding: 16px 10px 25px; }
}
@media (max-width: 360px) {
  .priyonix-topbar { padding: 0 8px; }
  .topbar-page-info span { font-size: 7px; letter-spacing: 1px; }
  .topbar-page-info strong { font-size: 15px; }
  .topbar-right { gap: 5px; }
  .topbar-icon-button { width: 33px; height: 33px; }
  .topbar-avatar { width: 33px; height: 33px; }
  .priyonix-content { padding: 14px 8px 22px; }
}
/* Landscape phones: reclaim vertical space */
@media (max-height: 480px) and (orientation: landscape) {
  .priyonix-topbar { height: 56px; padding: 0 14px; }
  .priyonix-content { min-height: calc(100vh - 56px); min-height: calc(100dvh - 56px); padding-top: 14px; }
  .notification-panel { max-height: calc(100vh - 70px); max-height: calc(100dvh - 70px); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
`;

export default Layout;
