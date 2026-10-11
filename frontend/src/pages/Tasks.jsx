import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  leadId: "",
  customerId: "",
  assignedUserId: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "TODO",
};

const statusOptions = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "ON_HOLD",
];

const priorityOptions = [
  "LOW",
  "MEDIUM",
  "HIGH",
];

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const tasksTableRef = useRef(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  /* =========================================
     LOAD ALL DATA
  ========================================= */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        tasksResponse,
        leadsResponse,
        customersResponse,
        usersResponse,
        currentUserResponse,
      ] = await Promise.all([
        api.get("/tasks"),
        api.get("/leads"),
        api.get("/customers"),
        api.get("/users/active"),
        api.get("/users/me"),
      ]);

      setTasks(tasksResponse.data || []);
      setLeads(leadsResponse.data || []);
      setCustomers(customersResponse.data || []);
      setUsers(usersResponse.data || []);
      setCurrentUser(currentUserResponse.data);
    } catch (error) {
      console.error("Error loading tasks:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  };

  /* =========================================
     RESET
  ========================================= */

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setError("");
  };

  /* =========================================
     ADD TASK
  ========================================= */

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  /* =========================================
     CLOSE MODAL
  ========================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };

  /* =========================================
     SAVE TASK
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),

        description: form.description.trim(),

        leadId: form.leadId
          ? Number(form.leadId)
          : null,

        customerId: form.customerId
          ? Number(form.customerId)
          : null,

        assignedUserId: form.assignedUserId
          ? Number(form.assignedUserId)
          : null,

        dueDate: form.dueDate || null,

        priority: form.priority,

        status: form.status,
      };

      if (editingId) {
        await api.put(
          `/tasks/${editingId}`,
          payload
        );

        alert("Task updated successfully.");
      } else {
        await api.post("/tasks", payload);

        alert("Task created successfully.");
      }

      setShowModal(false);

      resetForm();

      await loadData();
    } catch (error) {
      console.error("Error saving task:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     EDIT TASK
  ========================================= */

  const handleEdit = (task) => {
    setEditingId(task.id);

    setForm({
      title: task.title || "",

      description: task.description || "",

      leadId: task.leadId
        ? String(task.leadId)
        : "",

      customerId: task.customerId
        ? String(task.customerId)
        : "",

      assignedUserId: task.assignedUserId
        ? String(task.assignedUserId)
        : "",

      dueDate: task.dueDate
        ? String(task.dueDate).split("T")[0]
        : "",

      priority: task.priority || "MEDIUM",

      status: task.status || "TODO",
    });

    setError("");
    setShowModal(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================
     DELETE TASK
  ========================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);

      await loadData();
    } catch (error) {
      console.error(
        "Error deleting task:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to delete task."
      );
    }
  };

  /* =========================================
     HELPERS
  ========================================= */

  const getLeadName = (leadId) => {
    if (!leadId) {
      return "-";
    }

    const lead = leads.find(
      (item) =>
        Number(item.id) === Number(leadId)
    );

    return lead
      ? lead.name
      : `Lead #${leadId}`;
  };

  const getCustomerName = (customerId) => {
    if (!customerId) {
      return "-";
    }

    const customer = customers.find(
      (item) =>
        Number(item.id) ===
        Number(customerId)
    );

    return customer
      ? customer.name
      : `Customer #${customerId}`;
  };

  const getUserName = (userId) => {
    if (!userId) {
      return "Not assigned";
    }

    const user = users.find(
      (item) =>
        Number(item.id) === Number(userId)
    );

    return user
      ? user.name
      : `User #${userId}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    const value = String(date).split("T")[0];

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================
     DATE STATUS
  ========================================= */

  const isOverdue = (date, status) => {
    if (!date) {
      return false;
    }

    if (
      String(status || "").toUpperCase() ===
      "COMPLETED"
    ) {
      return false;
    }

    const due = new Date(
      `${String(date).split("T")[0]}T23:59:59`
    );

    return due < new Date();
  };

  /* =========================================
     STATUS CLASS
  ========================================= */

  const getStatusClass = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "IN_PROGRESS":
        return "status-progress";

      case "COMPLETED":
        return "status-completed";

      case "ON_HOLD":
        return "status-hold";

      default:
        return "status-todo";
    }
  };

  /* =========================================
     PRIORITY CLASS
  ========================================= */

  const getPriorityClass = (priority) => {
    switch (
      String(priority || "").toUpperCase()
    ) {
      case "HIGH":
        return "priority-high";

      case "LOW":
        return "priority-low";

      default:
        return "priority-medium";
    }
  };

  /* =========================================
     VIEW ALL TASKS
  ========================================= */

  const viewAllTasks = () => {
    // Clear every task filter first.
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");

    // Wait for React to apply the cleared filters,
    // then scroll to the complete task list.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        tasksTableRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };

  /* =========================================
     FILTER
  ========================================= */

  const filteredTasks = useMemo(() => {
    const value = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const title = String(
        task.title || ""
      ).toLowerCase();

      const description = String(
        task.description || ""
      ).toLowerCase();

      const leadName = getLeadName(
        task.leadId
      ).toLowerCase();

      const customerName =
        getCustomerName(
          task.customerId
        ).toLowerCase();

      const employeeName = getUserName(
        task.assignedUserId
      ).toLowerCase();

      const matchesSearch =
        !value ||
        title.includes(value) ||
        description.includes(value) ||
        leadName.includes(value) ||
        customerName.includes(value) ||
        employeeName.includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(
          task.status || ""
        ).toUpperCase() === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        String(
          task.priority || ""
        ).toUpperCase() ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    leads,
    customers,
    users,
    search,
    statusFilter,
    priorityFilter,
  ]);

  /* =========================================
     STATISTICS
  ========================================= */

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) =>
      String(
        task.status || ""
      ).toUpperCase() === "TODO"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) =>
      String(
        task.status || ""
      ).toUpperCase() === "IN_PROGRESS"
  ).length;

  const completedTasks = tasks.filter(
    (task) =>
      String(
        task.status || ""
      ).toUpperCase() === "COMPLETED"
  ).length;

  const onHoldTasks = tasks.filter(
    (task) =>
      String(
        task.status || ""
      ).toUpperCase() === "ON_HOLD"
  ).length;

  const highPriorityTasks = tasks.filter(
    (task) =>
      String(
        task.priority || ""
      ).toUpperCase() === "HIGH"
  ).length;

  const overdueTasks = tasks.filter(
    (task) =>
      isOverdue(
        task.dueDate,
        task.status
      )
  ).length;

  const completionRate =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) *
            100
        )
      : 0;

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <>
        <style>{`

          * {
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .tasks-loading-page {

            min-height: 100vh;

            display: grid;

            place-items: center;

            background: #071329;

            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .tasks-loading-box {
            text-align: center;
          }

          .tasks-loading-orbit {

            width: 65px;

            height: 65px;

            margin: auto;

            border:
              3px solid
              #e4e7f5;

            border-top-color:
              #6859ee;

            border-radius: 50%;

            animation:
              taskLoading
              1s
              linear
              infinite;
          }

          .tasks-loading-box h2 {

            margin:
              18px 0 6px;

            color: #f4f7ff;

            font-size: 21px;

            font-weight: 900;
          }

          .tasks-loading-box p {

            margin: 0;

            color: #a9bbda;

            font-size: 11px;

            font-weight: 700;
          }

          @keyframes taskLoading {

            to {
              transform:
                rotate(360deg);
            }

          }

        `}</style>

        <div className="
          tasks-loading-page
        ">
          <div className="
            tasks-loading-box
          ">
            <div className="
              tasks-loading-orbit
            " />

            <h2>
              Loading Tasks
            </h2>

            <p>
              Connecting to PriyoniX CRM...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`

        .tasks-page,
        .tasks-page *,
        .task-modal-overlay,
        .task-modal-overlay *,
        .task-modal,
        .task-modal * {

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        .tasks-page {

          min-height: 100vh;

          padding-bottom: 45px;

          background: #f4f6fb;

          color: #172033;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        .tasks-page-header {

          display: flex;

          justify-content:
            space-between;

          align-items: center;

          padding:
            28px 0 22px;
        }


        .tasks-page-header h1 {

          margin: 0;

          color: #10182f;

          font-size: 30px;

          font-weight: 900;

          letter-spacing: -0.8px;
        }


        .tasks-page-header p {

          margin:
            7px 0 0;

          color: #71809a;

          font-size: 14px;
        }


        .tasks-hero {

          position: relative;

          min-height: 390px;

          overflow: hidden;

          border-radius: 30px;

          background:

            radial-gradient(
              circle at 74% 48%,
              rgba(76,94,255,.20),
              transparent 32%
            ),

            radial-gradient(
              circle at 43% 100%,
              rgba(111,61,220,.28),
              transparent 45%
            ),

            linear-gradient(
              135deg,
              #090d2d 0%,
              #11134c 55%,
              #0a1d38 100%
            );

          box-shadow:
            0 22px 55px
            rgba(34,40,80,.20);
        }


        .task-stars {

          position: absolute;

          inset: 0;

          pointer-events: none;

          opacity: .9;

          background-image:

            radial-gradient(
              circle at 6% 23%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 13% 67%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 25% 17%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 34% 74%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 45% 31%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 55% 15%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 67% 28%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 82% 18%,
              white 0 1px,
              transparent 1.5px
            ),

            radial-gradient(
              circle at 92% 68%,
              white 0 1px,
              transparent 1.5px
            );

          animation:
            taskStars
            18s
            linear
            infinite;
        }


        @keyframes taskStars {

          from {
            transform:
              translate(0,0);
          }

          to {
            transform:
              translate(-20px,15px);
          }
        }


        .task-hero-content {

          position: relative;

          z-index: 20;

          width: 48%;

          padding:
            50px 0 45px 52px;
        }


        .task-status {

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:
            7px 13px;

          border:
            1px solid
            rgba(111,132,255,.38);

          border-radius: 22px;

          color: #d9defe;

          background:
            rgba(62,72,170,.16);

          font-size: 11px;

          font-weight: 900;
        }


        .task-status-dot {

          width: 8px;

          height: 8px;

          border-radius: 50%;

          background: #22d3ee;

          box-shadow:
            0 0 12px
            rgba(34,211,238,.85);
        }


        .task-hero-content h2 {

          margin:
            25px 0 0;

          color: white;

          font-size: 49px;

          line-height: 1.04;

          letter-spacing: -2.4px;

          font-weight: 900;
        }


        .task-hero-content h2 span {

          color: #a99aff;
        }


        .task-hero-description {

          max-width: 490px;

          margin:
            20px 0 0;

          color: #aab5d2;

          font-size: 15px;

          line-height: 1.7;

          font-weight: 600;
        }


        .task-hero-actions {

          display: flex;

          gap: 12px;

          margin-top: 25px;
        }


        .task-primary-button {

          border: 0;

          border-radius: 11px;

          padding:
            13px 21px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6859ee,
              #9251ed
            );

          box-shadow:
            0 12px 25px
            rgba(103,80,235,.28);

          cursor: pointer;

          font-size: 13px;

          font-weight: 900;

          transition:
            .25s ease;
        }


        .task-primary-button:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 16px 30px
            rgba(103,80,235,.38);
        }


        .task-secondary-button {

          border:
            1px solid
            rgba(155,164,211,.25);

          border-radius: 11px;

          padding:
            13px 21px;

          color: #dbe2fa;

          background:
            rgba(255,255,255,.06);

          cursor: pointer;

          font-size: 13px;

          font-weight: 800;
        }


        .task-mini-stats {

          display: flex;

          gap: 30px;

          margin-top: 32px;
        }


        .task-mini-stat strong {

          display: block;

          color: white;

          font-size: 24px;

          font-weight: 900;
        }


        .task-mini-stat span {

          display: block;

          margin-top: 4px;

          color: #8995b8;

          font-size: 11px;

          font-weight: 700;
        }


        .task-space {

          position: absolute;

          right: 2%;

          top: 0;

          width: 53%;

          height: 100%;

          perspective: 1100px;
        }


        .task-space-glow {

          position: absolute;

          left: 50%;

          top: 50%;

          width: 330px;

          height: 330px;

          transform:
            translate(-50%,-50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(205,214,255,.35),
              rgba(120,111,255,.14) 48%,
              transparent 73%
            );

          filter: blur(10px);

          animation:
            taskGlow
            4s
            ease-in-out
            infinite;
        }


        @keyframes taskGlow {

          0%,
          100% {
            opacity: .65;

            transform:
              translate(-50%,-50%)
              scale(.94);
          }

          50% {
            opacity: 1;

            transform:
              translate(-50%,-50%)
              scale(1.08);
          }
        }


        .task-core {

          position: absolute;

          left: 50%;

          top: 50%;

          width: 165px;

          height: 165px;

          transform:
            translate(-50%,-50%)
            rotateX(10deg)
            rotateY(-10deg);

          border-radius: 25px;

          background:
            linear-gradient(
              145deg,
              #ffffff 0%,
              #d9ddff 15%,
              #8b8ef1 42%,
              #4c4fc1 68%,
              #171a62 100%
            );

          border:
            2px solid
            rgba(210,218,255,.8);

          box-shadow:

            0 0 22px
            rgba(255,255,255,.45),

            0 0 55px
            rgba(118,139,255,.50),

            0 0 90px
            rgba(105,78,240,.30),

            inset -24px -24px 38px
            rgba(25,30,100,.58);

          z-index: 10;

          animation:
            taskCoreFloat
            5s
            ease-in-out
            infinite;
        }


        .task-core::before {

          content: "";

          position: absolute;

          left: 24px;

          top: 25px;

          width: 116px;

          height: 116px;

          border-radius: 20px;

          border:
            1px solid
            rgba(255,255,255,.38);

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.32),
              rgba(93,100,235,.12)
            );

          box-shadow:
            inset 0 0 25px
            rgba(255,255,255,.13);
        }


        .task-core-check {

          position: absolute;

          left: 50%;

          top: 50%;

          transform:
            translate(-50%,-50%);

          width: 70px;

          height: 70px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6959f1,
              #3d72ef
            );

          border:
            3px solid
            rgba(255,255,255,.72);

          box-shadow:
            0 0 25px
            rgba(104,89,241,.70);

          font-size: 35px;

          font-weight: 900;

          z-index: 3;
        }


        @keyframes taskCoreFloat {

          0%,
          100% {
            transform:
              translate(-50%,-50%)
              rotateX(10deg)
              rotateY(-10deg)
              translateY(0);
          }

          50% {
            transform:
              translate(-50%,-50%)
              rotateX(10deg)
              rotateY(-10deg)
              translateY(-10px);
          }
        }


        .task-orbit {

          position: absolute;

          left: 50%;

          top: 50%;

          border-radius: 50%;

          border:
            1px solid
            rgba(139,152,255,.30);

          transform:
            translate(-50%,-50%);
        }


        .task-orbit.one {

          width: 430px;

          height: 145px;

          transform:
            translate(-50%,-50%)
            rotate(-20deg);

          animation:
            taskOrbitOne
            15s
            linear
            infinite;
        }


        .task-orbit.two {

          width: 350px;

          height: 125px;

          transform:
            translate(-50%,-50%)
            rotate(55deg);

          border-color:
            rgba(112,226,255,.18);

          animation:
            taskOrbitTwo
            18s
            linear
            infinite reverse;
        }


        .task-orbit.three {

          width: 280px;

          height: 400px;

          transform:
            translate(-50%,-50%)
            rotate(28deg);

          border-color:
            rgba(139,92,246,.18);

          animation:
            taskOrbitThree
            20s
            linear
            infinite;
        }


        @keyframes taskOrbitOne {

          from {
            transform:
              translate(-50%,-50%)
              rotate(-20deg);
          }

          to {
            transform:
              translate(-50%,-50%)
              rotate(340deg);
          }
        }


        @keyframes taskOrbitTwo {

          from {
            transform:
              translate(-50%,-50%)
              rotate(55deg);
          }

          to {
            transform:
              translate(-50%,-50%)
              rotate(415deg);
          }
        }


        @keyframes taskOrbitThree {

          from {
            transform:
              translate(-50%,-50%)
              rotate(28deg);
          }

          to {
            transform:
              translate(-50%,-50%)
              rotate(388deg);
          }
        }


        .floating-task-card {

          position: absolute;

          width: 132px;

          padding:
            12px 13px;

          border:
            1px solid
            rgba(143,153,217,.28);

          border-radius: 13px;

          background:
            rgba(15,20,61,.90);

          backdrop-filter:
            blur(12px);

          box-shadow:
            0 18px 32px
            rgba(0,0,0,.22);

          z-index: 20;
        }


        .floating-task-card.one {

          left: 3%;

          top: 14%;

          animation:
            floatingTaskOne
            5s
            ease-in-out
            infinite;
        }


        .floating-task-card.two {

          right: 1%;

          top: 51%;

          animation:
            floatingTaskTwo
            6s
            ease-in-out
            infinite;
        }


        /* ONLY CHANGED POSITION */

        .floating-task-card.three {

          left: 18%;

          bottom: 3%;

          animation:
            floatingTaskThree
            7s
            ease-in-out
            infinite;
        }


        .floating-task-top {

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 8px;
        }


        .floating-task-icon {

          width: 23px;

          height: 23px;

          display: grid;

          place-items: center;

          border-radius: 7px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6255ee,
              #3b82f6
            );

          font-size: 11px;

          font-weight: 900;
        }


        .floating-task-status {

          width: 7px;

          height: 7px;

          border-radius: 50%;

          background: #22d3ee;

          box-shadow:
            0 0 8px
            rgba(34,211,238,.8);
        }


        .floating-task-card strong {

          display: block;

          margin-top: 9px;

          color: white;

          font-size: 11px;

          font-weight: 900;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        .floating-task-card span {

          display: block;

          margin-top: 4px;

          color: #8e9abb;

          font-size: 9px;

          font-weight: 700;
        }


        .floating-progress {

          height: 4px;

          margin-top: 8px;

          overflow: hidden;

          border-radius: 10px;

          background:
            rgba(255,255,255,.10);
        }


        .floating-progress::after {

          content: "";

          display: block;

          width: 68%;

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #6959ef,
              #22d3ee
            );
        }


        @keyframes floatingTaskOne {

          0%,
          100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(12px,-9px);
          }
        }


        @keyframes floatingTaskTwo {

          0%,
          100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(-10px,12px);
          }
        }


        @keyframes floatingTaskThree {

          0%,
          100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(14px,8px);
          }
        }


        .task-node {

          position: absolute;

          width: 13px;

          height: 13px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle at 30% 25%,
              #ffffff,
              #70d9ff 35%,
              #6759ee 100%
            );

          box-shadow:
            0 0 13px
            rgba(112,217,255,.85);

          z-index: 15;
        }


        .task-node.one {

          right: 17%;

          top: 22%;

          animation:
            taskNodeOne
            4s
            ease-in-out
            infinite;
        }


        .task-node.two {

          right: 28%;

          bottom: 18%;

          animation:
            taskNodeTwo
            5s
            ease-in-out
            infinite;
        }


        .task-node.three {

          left: 29%;

          top: 27%;

          animation:
            taskNodeThree
            4.5s
            ease-in-out
            infinite;
        }


        @keyframes taskNodeOne {

          0%,
          100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(20px,-15px);
          }
        }


        @keyframes taskNodeTwo {

          0%,
          100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(-17px,12px);
          }
        }


        @keyframes taskNodeThree {

          0%,
          100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(-10px,-18px);
          }
        }


        .task-space-metric {

          position: absolute;

          min-width: 145px;

          padding:
            13px 16px;

          border:
            1px solid
            rgba(132,145,211,.20);

          border-radius: 13px;

          background:
            rgba(15,20,61,.90);

          backdrop-filter:
            blur(12px);

          box-shadow:
            0 15px 30px
            rgba(0,0,0,.18);

          z-index: 25;
        }


        /* ONLY CHANGED POSITION */

        .task-space-metric.one {

          left: 0%;

          top: 48%;
        }


        .task-space-metric.two {

          right: 0;

          top: 17%;
        }


        .task-space-metric strong {

          display: block;

          color: white;

          font-size: 22px;

          font-weight: 900;
        }


        .task-space-metric span {

          display: block;

          margin-top: 3px;

          color: #8e9abb;

          font-size: 10px;

          font-weight: 800;
        }


        .task-page-error {

          margin-top: 18px;

          padding:
            10px 12px;

          border-radius: 8px;

          color: #c24454;

          background: #fff0f2;

          font-size: 11px;

          font-weight: 700;
        }


        .task-section {

          margin-top: 38px;
        }


        .task-section-title {

          margin-bottom: 17px;
        }


        .task-section-title h2 {

          margin: 0;

          color: #13203b;

          font-size: 27px;

          font-weight: 900;

          letter-spacing: -.7px;
        }


        .task-section-title p {

          margin:
            5px 0 0;

          color: #75839c;

          font-size: 13px;
        }


        .task-overview-grid {

          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 17px;
        }


        .task-overview-card {

          position: relative;

          min-height: 145px;

          overflow: hidden;

          padding: 22px;

          border:
            1px solid
            #e3e8f2;

          border-radius: 20px;

          background: white;

          box-shadow:
            0 9px 28px
            rgba(33,48,80,.07);
        }


        .task-overview-card::after {

          content: "";

          position: absolute;

          width: 95px;

          height: 95px;

          right: -30px;

          top: -30px;

          border-radius: 50%;

          background: #edf0ff;
        }


        .task-overview-icon {

          position: relative;

          z-index: 2;

          width: 44px;

          height: 44px;

          display: grid;

          place-items: center;

          border-radius: 13px;

          font-size: 19px;

          font-weight: 900;
        }


        .task-icon-total {

          color: #4356d9;

          background: #eef0ff;
        }


        .task-icon-progress {

          color: #087ea4;

          background: #e7f8fc;
        }


        .task-icon-complete {

          color: #078b65;

          background: #e5faf2;
        }


        .task-icon-overdue {

          color: #c94c5b;

          background: #fff0f2;
        }


        .task-overview-value {

          position: relative;

          z-index: 2;

          margin-top: 15px;

          color: #101a33;

          font-size: 29px;

          font-weight: 900;
        }


        .task-overview-label {

          position: relative;

          z-index: 2;

          margin-top: 3px;

          color: #71809a;

          font-size: 12px;

          font-weight: 700;
        }


        .task-controls {

          display: flex;

          align-items: center;

          gap: 10px;

          flex-wrap: wrap;

          margin-top: 28px;

          padding: 15px;

          border:
            1px solid
            #e1e6f0;

          border-radius: 17px;

          background: white;

          box-shadow:
            0 7px 22px
            rgba(33,48,80,.05);
        }


        .task-search {

          flex:
            1 1 320px;

          height: 43px;

          padding:
            0 14px;

          border:
            1px solid
            #dfe4ed;

          border-radius: 10px;

          outline: none;

          background: #fafbfe;

          color: #25304a;

          font-size: 12px;
        }


        .task-filter {

          height: 43px;

          padding:
            0 12px;

          border:
            1px solid
            #dfe4ed;

          border-radius: 10px;

          outline: none;

          background: #fafbfe;

          color: #39445c;

          font-size: 12px;

          font-weight: 700;
        }


        .task-results {

          color: #8290a7;

          font-size: 11px;

          font-weight: 800;
        }


        .task-table-wrapper {

          margin-top: 16px;

          overflow-x: auto;

          border:
            1px solid
            #e1e6f0;

          border-radius: 20px;

          background: white;

          box-shadow:
            0 9px 28px
            rgba(33,48,80,.06);
        }


        .task-table {

          width: 100%;

          min-width: 1150px;

          border-collapse:
            collapse;
        }


        .task-table th {

          padding: 15px;

          text-align: left;

          color: #7d8aa1;

          background: #f8f9fc;

          border-bottom:
            1px solid
            #e7ebf2;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: .06em;

          text-transform: uppercase;
        }


        .task-table td {

          padding:
            16px 15px;

          border-bottom:
            1px solid
            #edf0f5;

          color: #647189;

          font-size: 11px;
        }


        .task-table tbody tr:hover {

          background: #fbfcff;
        }


        .task-title {

          color: #17213a;

          font-size: 13px;

          font-weight: 900;
        }


        .task-secondary {

          margin-top: 4px;

          color: #9aa5b7;

          font-size: 10px;
        }


        .task-description {

          max-width: 210px;

          color: #7c879a;

          font-size: 10px;

          line-height: 1.5;
        }


        .task-badge {

          display: inline-flex;

          padding:
            6px 9px;

          border-radius: 20px;

          font-size: 9px;

          font-weight: 900;
        }


        .status-todo {

          color: #59667a;

          background: #eef1f5;
        }


        .status-progress {

          color: #087ea4;

          background: #e7f8fc;
        }


        .status-completed {

          color: #078363;

          background: #e1f9ef;
        }


        .status-hold {

          color: #85661b;

          background: #fff7dd;
        }


        .priority-high {

          color: #c54859;

          background: #fff0f2;
        }


        .priority-medium {

          color: #7b5c1e;

          background: #fff7df;
        }


        .priority-low {

          color: #078363;

          background: #e1f9ef;
        }


        .task-due-date {

          font-size: 11px;

          font-weight: 700;
        }


        .task-due-date.overdue {

          color: #d04759;

          font-weight: 900;
        }


        .task-overdue-label {

          margin-top: 3px;

          color: #d04759;

          font-size: 9px;

          font-weight: 900;

          text-transform: uppercase;
        }


        .task-actions {

          display: flex;

          gap: 5px;
        }


        .task-action {

          height: 31px;

          padding:
            0 8px;

          border:
            1px solid
            #dfe4ed;

          border-radius: 7px;

          color: #69768d;

          background: white;

          cursor: pointer;

          font-size: 9px;

          font-weight: 800;
        }


        .task-action:hover {

          color: #6355dc;

          border-color: #bdb5ff;

          background: #f8f7ff;
        }


        .task-action.delete:hover {

          color: #dc4b5c;

          border-color: #ffc4cc;

          background: #fff6f7;
        }


        .task-progress-wrapper {

          min-width: 95px;
        }


        .task-progress-text {

          margin-bottom: 5px;

          color: #56627a;

          font-size: 10px;

          font-weight: 900;
        }


        .task-progress-bar {

          width: 95px;

          height: 6px;

          overflow: hidden;

          border-radius: 10px;

          background: #edf0f5;
        }


        .task-progress-fill {

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #6255ee,
              #8b4df2
            );

          transition:
            width .3s ease;
        }


        .task-empty {

          padding:
            70px 20px;

          text-align: center;
        }


        .task-empty-core {

          width: 58px;

          height: 58px;

          margin: auto;

          display: grid;

          place-items: center;

          border-radius: 16px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6255ee,
              #3b82f6
            );

          box-shadow:
            0 10px 25px
            rgba(98,85,238,.25);

          font-size: 23px;

          font-weight: 900;
        }


        .task-empty h3 {

          margin:
            13px 0 5px;

          color: #17213a;

          font-size: 18px;
        }


        .task-empty p {

          margin: 0;

          color: #8c98aa;

          font-size: 12px;
        }


        .task-modal-overlay {

          position: fixed;

          inset: 0;

          z-index: 5000;

          display: flex;

          justify-content: center;

          align-items: center;

          padding: 20px;

          background:
            rgba(9,13,45,.68);

          backdrop-filter:
            blur(7px);

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        .task-modal {

          width:
            min(850px,100%);

          max-height: 92vh;

          overflow-y: auto;

          border-radius: 20px;

          background: white;

          box-shadow:
            0 35px 90px
            rgba(15,23,42,.30);

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        .task-modal-header {

          display: flex;

          justify-content:
            space-between;

          align-items: center;

          padding:
            21px 23px;

          border-bottom:
            1px solid
            #edf0f5;
        }


        .task-modal-header h2 {

          margin: 0;

          color: #15203a;

          font-size: 21px;

          line-height: 1.25;

          font-weight: 900;
        }


        .task-modal-header p {

          margin:
            5px 0 0;

          color: #8b97a9;

          font-size: 11px;

          line-height: 1.4;
        }


        .task-close {

          width: 38px;

          height: 38px;

          border: 0;

          border-radius: 9px;

          color: #68758b;

          background: #f1f3f8;

          cursor: pointer;

          font-size: 18px;

          font-weight: 900;
        }


        .task-form {

          padding: 23px;
        }


        .task-form-grid {

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 14px;
        }


        .task-form-field {

          display: flex;

          flex-direction: column;

          gap: 6px;
        }


        .task-form-field.full {

          grid-column: 1 / -1;
        }


        .task-form-field label {

          color: #59667d;

          font-size: 10px;

          line-height: 1.2;

          font-weight: 900;

          text-transform: uppercase;
        }


        .task-form-field input,
        .task-form-field select,
        .task-form-field textarea {

          width: 100%;

          border:
            1px solid
            #dfe4ed;

          border-radius: 9px;

          outline: none;

          color: #263149;

          background: #fafbfe;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;

          font-weight: 400;
        }


        .task-form-field input,
        .task-form-field select {

          height: 43px;

          padding:
            0 11px;
        }


        .task-form-field textarea {

          min-height: 95px;

          padding: 11px;

          resize: vertical;

          line-height: 1.5;
        }


        .task-form-field input::placeholder,
        .task-form-field textarea::placeholder {

          color: #8a8f99;

          opacity: 1;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 12px;
        }


        .task-form-field input:focus,
        .task-form-field select:focus,
        .task-form-field textarea:focus {

          border-color:
            #7965ee;

          box-shadow:
            0 0 0 3px
            rgba(121,101,238,.08);
        }


        .task-form-error {

          margin-bottom: 15px;

          padding:
            10px 12px;

          border-radius: 8px;

          color: #c24454;

          background: #fff0f2;

          font-size: 11px;

          font-weight: 700;
        }


        .task-modal-footer {

          display: flex;

          justify-content: flex-end;

          gap: 9px;

          margin-top: 20px;

          padding-top: 17px;

          border-top:
            1px solid
            #edf0f5;
        }


        .task-cancel {

          height: 42px;

          padding:
            0 16px;

          border:
            1px solid
            #dfe4ed;

          border-radius: 9px;

          color: #69768d;

          background: white;

          cursor: pointer;

          font-size: 12px;

          font-weight: 800;
        }


        .task-save {

          height: 42px;

          padding:
            0 18px;

          border: 0;

          border-radius: 9px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6255ee,
              #8b4df2
            );

          cursor: pointer;

          font-size: 12px;

          font-weight: 900;
        }


        .task-details {

          padding: 23px;
        }


        .task-details-top {

          display: flex;

          align-items: center;

          gap: 13px;

          padding: 15px;

          margin-bottom: 17px;

          border-radius: 13px;

          background: #f7f8fc;
        }


        .task-details-icon {

          width: 52px;

          height: 52px;

          flex-shrink: 0;

          display: grid;

          place-items: center;

          border-radius: 15px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6255ee,
              #3b82f6
            );

          font-size: 20px;

          font-weight: 900;
        }


        .task-details-top h3 {

          margin: 0;

          color: #17213a;

          font-size: 17px;

          font-weight: 900;
        }


        .task-details-top p {

          margin:
            4px 0 0;

          color: #8b97a9;

          font-size: 11px;
        }


        .task-details-grid {

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 10px;
        }


        .task-detail-box {

          padding: 12px;

          border:
            1px solid
            #e8ebf1;

          border-radius: 10px;

          background: #fbfcfe;
        }


        .task-detail-box.full {

          grid-column: 1 / -1;
        }


        .task-detail-label {

          color: #98a2b3;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .06em;

          text-transform: uppercase;
        }


        .task-detail-value {

          margin-top: 5px;

          color: #33405a;

          font-size: 12px;

          font-weight: 700;

          word-break: break-word;
        }


        .task-detail-progress {

          margin-top: 8px;

          width: 100%;

          height: 7px;

          overflow: hidden;

          border-radius: 10px;

          background: #e9ecf3;
        }


        .task-detail-progress-fill {

          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #6255ee,
              #22d3ee
            );
        }


        @media(max-width:1100px) {

          .task-hero-content {
            width: 53%;
          }

          .task-space {
            width: 52%;
          }

          .task-core {
            width: 150px;
            height: 150px;
          }

          .task-core::before {
            left: 21px;
            top: 21px;
            width: 106px;
            height: 106px;
          }

          .task-overview-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }


        @media(max-width:800px) {

          .tasks-hero {

            min-height: 680px;
          }


          .task-hero-content {

            width: 100%;

            padding:
              40px 30px 0;
          }


          .task-hero-content h2 {

            font-size: 40px;
          }


          .task-space {

            top: 320px;

            left: 0;

            right: 0;

            width: 100%;

            height: 350px;
          }
        }


        @media(max-width:600px) {

          .tasks-page-header {

            padding-top: 18px;
          }


          .tasks-page-header h1 {

            font-size: 26px;
          }


          .tasks-hero {

            min-height: 640px;

            border-radius: 22px;
          }


          .task-hero-content {

            padding:
              28px 22px 0;
          }


          .task-hero-content h2 {

            font-size: 34px;
          }


          .task-hero-description {

            font-size: 13px;
          }


          .task-mini-stats {

            gap: 18px;
          }


          .task-space {

            top: 310px;

            height: 310px;

            transform:
              scale(.82);

            transform-origin:
              top center;
          }


          .task-overview-grid {

            grid-template-columns: 1fr;
          }


          .task-controls {

            align-items: stretch;

            flex-direction: column;
          }


          .task-search,
          .task-filter {

            width: 100%;
          }


          .task-results {

            margin-left: 0;
          }


          .task-form-grid,
          .task-details-grid {

            grid-template-columns: 1fr;
          }


          .task-form-field.full,
          .task-detail-box.full {

            grid-column: auto;
          }


          .task-modal-overlay {

            padding: 8px;
          }


          .task-modal {

            max-height: 96vh;
          }


          .task-modal-header {

            padding:
              21px 17px;
          }


          .task-form,
          .task-details {

            padding: 17px;
          }

        }


      /* ===== PRIYONIX SPACE THEME + WORKSPACE FRAME ===== */
      .tasks-page {
        display: block;
        position: relative;
        z-index: 0;
        width: 100%;
        min-width: 0;
        min-height: calc(100vh - 112px);
        margin: 0 0 18px;
        padding: 16px 18px 38px !important;
        box-sizing: border-box;
        border: 1px solid rgba(124, 157, 255, 0.16);
        border-radius: 22px;
        color: #eaf0ff !important;
        background:
          radial-gradient(circle at 82% 8%, rgba(75, 85, 255, 0.10), transparent 28%),
          radial-gradient(circle at 8% 76%, rgba(34, 211, 238, 0.05), transparent 26%),
          #071329 !important;
        font-family: Inter, "Segoe UI", Arial, sans-serif;
      }

      .tasks-page-header {
        min-width: 0;
        gap: 18px;
        padding: 8px 2px 24px !important;
        margin: 0;
      }
      .tasks-page-header h1 { color: #f4f7ff !important; }
      .tasks-page-header p { color: #a9bbda !important; }

      .tasks-hero {
        width: 100%;
        max-width: 100%;
        margin: 0 0 34px;
        border: 1px solid rgba(124, 157, 255, 0.12);
        box-sizing: border-box;
      }

      .task-section { margin-top: 30px !important; }
      .task-section-title h2 { color: #f4f7ff !important; }
      .task-section-title p { color: #a9bbda !important; }

      /* Overview metric cards */
      .tasks-page .task-overview-card {
        background: rgba(13, 27, 56, 0.96) !important;
        border-color: rgba(124, 157, 255, 0.22) !important;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16) !important;
      }
      .tasks-page .task-overview-card::after {
        background: rgba(99, 102, 241, 0.12) !important;
      }
      .tasks-page .task-overview-value { color: #f4f7ff !important; }
      .tasks-page .task-overview-label { color: #a9bbda !important; }

      /* Search, filters, and result count */
      .tasks-page .task-controls {
        background: rgba(13, 27, 56, 0.92) !important;
        border-color: rgba(124, 157, 255, 0.20) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14) !important;
      }
      .tasks-page .task-search,
      .tasks-page .task-filter {
        color: #f4f7ff !important;
        background: #09172f !important;
        border-color: #30466f !important;
        color-scheme: dark;
      }
      .tasks-page .task-search::placeholder { color: #8094b8 !important; opacity: 1; }
      .tasks-page .task-search:focus,
      .tasks-page .task-filter:focus {
        border-color: #8b7cff !important;
        box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
      }
      .tasks-page .task-results { color: #a9bbda !important; }

      /* Table */
      .tasks-page .task-table-wrapper {
        background: rgba(13, 27, 56, 0.94) !important;
        border-color: rgba(124, 157, 255, 0.20) !important;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.15) !important;
      }
      .tasks-page .task-table th {
        color: #a9bbda !important;
        background: #142544 !important;
        border-bottom-color: #30466f !important;
      }
      .tasks-page .task-table td {
        color: #c2cfea !important;
        border-bottom-color: rgba(124, 157, 255, 0.12) !important;
      }
      .tasks-page .task-table tbody tr { background: transparent !important; }
      .tasks-page .task-table tbody tr:hover { background: rgba(92, 105, 190, 0.12) !important; }
      .tasks-page .task-title { color: #f4f7ff !important; }
      .tasks-page .task-secondary,
      .tasks-page .task-description { color: #a9bbda !important; }
      .tasks-page .task-due-date { color: #dbe7ff !important; }

      .tasks-page .task-action {
        color: #dbe7ff !important;
        background: #142544 !important;
        border-color: #30466f !important;
      }
      .tasks-page .task-action:hover {
        color: #ffffff !important;
        background: #25396a !important;
        border-color: #8b7cff !important;
      }
      .tasks-page .task-action.delete:hover {
        color: #ffdce2 !important;
        background: rgba(194, 68, 84, 0.18) !important;
        border-color: rgba(255, 133, 151, 0.55) !important;
      }
      .tasks-page .task-progress-text { color: #c2cfea !important; }
      .tasks-page .task-progress-bar { background: #263653 !important; }

      .tasks-page .task-empty h3 { color: #f4f7ff !important; }
      .tasks-page .task-empty p { color: #a9bbda !important; }
      .tasks-page .task-page-error {
        color: #ffdce2 !important;
        background: rgba(194, 68, 84, 0.18) !important;
        border: 1px solid rgba(255, 133, 151, 0.28);
      }

      /* Responsive modal positioning: clear the app header and keep the
         entire form reachable on shorter or narrower screens. */
      .task-modal-overlay {
        align-items: flex-start !important;
        justify-content: center !important;
        overflow-y: auto !important;
        padding: 84px 20px 24px !important;
        box-sizing: border-box;
        overscroll-behavior: contain;
        background: rgba(2, 8, 23, 0.76) !important;
      }
      .task-modal {
        flex: 0 0 auto;
        width: min(850px, 100%);
        max-height: calc(100dvh - 108px) !important;
        margin: 0 auto !important;
        overflow-y: auto !important;
        overscroll-behavior: contain;
        scrollbar-width: none;
        -ms-overflow-style: none;
        color: #eaf0ff !important;
        background: #0d1b38 !important;
        border: 1px solid rgba(124, 157, 255, 0.22);
      }
      .task-modal::-webkit-scrollbar { width: 0; height: 0; display: none; }
      .task-modal-header {
        position: sticky;
        top: 0;
        z-index: 5;
        background: #0d1b38 !important;
        border-bottom-color: rgba(124, 157, 255, 0.18) !important;
      }
      .task-modal-header h2 { color: #f4f7ff !important; }
      .task-modal-header p { color: #a9bbda !important; }
      .task-close { color: #dbe7ff !important; background: #1a2d4d !important; }
      .task-form-field label { color: #b9c8e4 !important; }
      .task-form-field input,
      .task-form-field select,
      .task-form-field textarea {
        color: #f4f7ff !important;
        background: #09172f !important;
        border-color: #30466f !important;
        color-scheme: dark;
      }
      .task-form-field input::placeholder,
      .task-form-field textarea::placeholder {
        color: #8094b8 !important;
        opacity: 1;
      }
      .task-form-field input:focus,
      .task-form-field select:focus,
      .task-form-field textarea:focus {
        border-color: #8b7cff !important;
        box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
      }
      /* Force the native calendar icon to remain white in Chromium/Edge. */
      .tasks-page .task-modal .task-form-field input[type="date"] {
        color-scheme: dark !important;
        -webkit-appearance: auto;
        appearance: auto;
      }
      .tasks-page .task-modal .task-form-field input[type="date"]::-webkit-calendar-picker-indicator {
        filter: brightness(0) invert(1) !important;
        opacity: 1 !important;
        cursor: pointer;
        background-color: transparent;
      }
      .tasks-page .task-modal .task-form-field input[type="date"]::-webkit-clear-button,
      .tasks-page .task-modal .task-form-field input[type="date"]::-webkit-inner-spin-button {
        filter: brightness(0) invert(1) !important;
      }
      .task-form-error {
        color: #ffdce2 !important;
        background: rgba(194, 68, 84, 0.18) !important;
        border: 1px solid rgba(255, 133, 151, 0.28);
      }
      .task-modal-footer { border-top-color: rgba(124, 157, 255, 0.18) !important; }
      .task-cancel {
        color: #dbe7ff !important;
        background: #142544 !important;
        border-color: #30466f !important;
      }
      .task-cancel:hover { background: #20365a !important; }
      .task-save { box-shadow: 0 10px 25px rgba(98, 85, 238, 0.24); }

      /* Details modal */
      .task-details-top { background: #142544 !important; }
      .task-details-top h3,
      .task-details-top p { color: #f4f7ff !important; }
      .task-detail-box {
        background: #0a1730 !important;
        border-color: #30466f !important;
      }
      .task-detail-label { color: #91a6ca !important; }
      .task-detail-value { color: #e3ebfb !important; }
      .task-detail-progress { background: #263653 !important; }

      @media (max-width: 900px) {
        .tasks-page { padding: 14px 14px 30px !important; }
        .tasks-page-header { padding-bottom: 20px !important; }
      }

      @media (max-width: 700px) {
        .tasks-page {
          min-height: calc(100vh - 96px);
          padding: 12px 10px 24px !important;
          border-radius: 18px;
        }
        .tasks-page-header { padding: 4px 2px 18px !important; }
        .tasks-page-header h1 { font-size: 26px !important; }
        .tasks-hero { border-radius: 22px; min-height: 640px; }
        .task-hero-content { width: 100% !important; padding: 28px 22px 0 !important; }
        .task-hero-content h2 { font-size: clamp(32px, 8vw, 40px) !important; }
        .task-space { top: 310px !important; left: 0 !important; right: 0 !important; width: 100% !important; height: 310px !important; transform: scale(.82); transform-origin: top center; }
        .task-overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 12px !important; }
        .task-overview-card { min-height: 130px; padding: 17px !important; }
        .task-controls { align-items: stretch !important; flex-direction: column !important; }
        .task-search, .task-filter { width: 100% !important; min-width: 0 !important; }
        .task-form-grid, .task-details-grid { grid-template-columns: 1fr !important; }
        .task-form-field.full, .task-detail-box.full { grid-column: auto !important; }
        .task-modal-overlay { padding: 78px 8px 12px !important; }
        .task-modal { max-height: calc(100dvh - 90px) !important; border-radius: 16px; }
        .task-modal-header { padding: 18px 16px !important; }
        .task-form, .task-details { padding: 16px !important; }
        .task-modal-footer { flex-wrap: wrap; }
      }

      @media (max-width: 420px) {
        .task-overview-grid { grid-template-columns: 1fr !important; }
        .task-hero-actions { flex-wrap: wrap; }
        .task-primary-button, .task-secondary-button { max-width: 100%; }
        .task-mini-stats { gap: 16px !important; flex-wrap: wrap; }
      }

      /* ===== RESPONSIVE POLISH — all devices ===== */
      @media (max-width: 700px) {
        .task-search, .task-filter { flex: 0 0 auto; }
      }

      @media (max-width: 600px) {
        .task-hero-actions { flex-wrap: wrap; }
        .task-mini-stats { flex-wrap: wrap; gap: 16px !important; }
      }

      @media (max-width: 480px) {
        .task-overview-grid { grid-template-columns: minmax(0, 1fr) !important; }
        .task-space-metric { display: none; }
      }

      @media (max-width: 400px) {
        .task-primary-button, .task-secondary-button { flex: 1 1 100%; justify-content: center; }
      }

      @media (max-width: 360px) {
        .tasks-page-header h1 { font-size: 23px !important; }
        .task-hero-content h2 { font-size: 28px !important; }
        .tasks-hero { min-height: 540px !important; }
      }

      @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
        .tasks-hero { min-height: 360px !important; }
        .task-space { display: none !important; }
      }

      `}</style>


      <div className="
        tasks-page
      ">

        <div className="
          tasks-page-header
        ">

          <div>

            <h1>
              Task Management
            </h1>

            <p>
              Plan, assign and track every
              task from one workspace.
            </p>

          </div>

        </div>


        <section className="
          tasks-hero
        ">

          <div className="
            task-stars
          " />


          <div className="
            task-hero-content
          ">

            <div className="
              task-status
            ">

              <span className="
                task-status-dot
              " />

              TASK SYSTEM ONLINE

            </div>


            <h2>

              Every task.

              <br />

              <span>
                Every deadline.
              </span>

            </h2>


            <p className="
              task-hero-description
            ">

              Organize responsibilities,
              track progress and keep
              every CRM task moving toward
              completion.

            </p>


            <div className="
              task-hero-actions
            ">

              <button
                className="
                  task-primary-button
                "
                onClick={openAddModal}
              >
                Add New Task →
              </button>


              <button
                type="button"
                className="
                  task-secondary-button
                "
                onClick={viewAllTasks}
              >
                View All Tasks
              </button>

            </div>


            <div className="
              task-mini-stats
            ">

              <div className="
                task-mini-stat
              ">

                <strong>
                  {totalTasks}
                </strong>

                <span>
                  Total Tasks
                </span>

              </div>


              <div className="
                task-mini-stat
              ">

                <strong>
                  {inProgressTasks}
                </strong>

                <span>
                  In Progress
                </span>

              </div>


              <div className="
                task-mini-stat
              ">

                <strong>
                  {completionRate}%
                </strong>

                <span>
                  Completion
                </span>

              </div>

            </div>

          </div>


          <div className="
            task-space
          ">

            <div className="
              task-space-glow
            " />


            <div className="
              task-orbit one
            " />


            <div className="
              task-orbit two
            " />


            <div className="
              task-orbit three
            " />


            <div className="
              task-core
            ">

              <div className="
                task-core-check
              ">
                ✓
              </div>

            </div>


            <div className="
              task-node one
            " />


            <div className="
              task-node two
            " />


            <div className="
              task-node three
            " />


            <div className="
              floating-task-card one
            ">

              <div className="
                floating-task-top
              ">

                <div className="
                  floating-task-icon
                ">
                  ✓
                </div>

                <div className="
                  floating-task-status
                " />

              </div>

              <strong>
                Lead Follow-up
              </strong>

              <span>
                In Progress
              </span>

              <div className="
                floating-progress
              " />

            </div>


            <div className="
              floating-task-card two
            ">

              <div className="
                floating-task-top
              ">

                <div className="
                  floating-task-icon
                ">
                  ★
                </div>

                <div className="
                  floating-task-status
                " />

              </div>

              <strong>
                Client Proposal
              </strong>

              <span>
                High Priority
              </span>

              <div className="
                floating-progress
              " />

            </div>


            <div className="
              floating-task-card three
            ">

              <div className="
                floating-task-top
              ">

                <div className="
                  floating-task-icon
                ">
                  →
                </div>

                <div className="
                  floating-task-status
                " />

              </div>

              <strong>
                CRM Review
              </strong>

              <span>
                Scheduled
              </span>

              <div className="
                floating-progress
              " />

            </div>


            <div className="
              task-space-metric one
            ">

              <strong>
                {highPriorityTasks}
              </strong>

              <span>
                High Priority
              </span>

            </div>


            <div className="
              task-space-metric two
            ">

              <strong>
                {overdueTasks}
              </strong>

              <span>
                Overdue Tasks
              </span>

            </div>


          </div>

        </section>


        {error && !showModal && (

          <div className="
            task-page-error
          ">

            {error}

          </div>

        )}


        <section className="
          task-section
        ">


          <div className="
            task-section-title
          ">

            <h2>
              Task Overview
            </h2>

            <p>
              Monitor workload, progress
              and deadlines at a glance.
            </p>

          </div>


          <div className="
            task-overview-grid
          ">


            <div className="
              task-overview-card
            ">

              <div className="
                task-overview-icon
                task-icon-total
              ">
                ◉
              </div>

              <div className="
                task-overview-value
              ">
                {totalTasks}
              </div>

              <div className="
                task-overview-label
              ">
                Total Tasks
              </div>

            </div>


            <div className="
              task-overview-card
            ">

              <div className="
                task-overview-icon
                task-icon-progress
              ">
                →
              </div>

              <div className="
                task-overview-value
              ">
                {inProgressTasks}
              </div>

              <div className="
                task-overview-label
              ">
                In Progress
              </div>

            </div>


            <div className="
              task-overview-card
            ">

              <div className="
                task-overview-icon
                task-icon-complete
              ">
                ✓
              </div>

              <div className="
                task-overview-value
              ">
                {completedTasks}
              </div>

              <div className="
                task-overview-label
              ">
                Completed
              </div>

            </div>


            <div className="
              task-overview-card
            ">

              <div className="
                task-overview-icon
                task-icon-overdue
              ">
                !
              </div>

              <div className="
                task-overview-value
              ">
                {overdueTasks}
              </div>

              <div className="
                task-overview-label
              ">
                Overdue Tasks
              </div>

            </div>


          </div>


          <div className="
            task-controls
          ">

            <input
              className="
                task-search
              "
              type="text"
              placeholder="
                Search tasks, leads,
                customers...
              "
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


            <select
              className="
                task-filter
              "
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All Status
              </option>

              {statusOptions.map(
                (status) => (

                  <option
                    key={status}
                    value={status}
                  >
                    {status.replace(
                      "_",
                      " "
                    )}
                  </option>

                )
              )}

            </select>


            <select
              className="
                task-filter
              "
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All Priority
              </option>

              {priorityOptions.map(
                (priority) => (

                  <option
                    key={priority}
                    value={priority}
                  >
                    {priority}
                  </option>

                )
              )}

            </select>


            <span className="
              task-results
            ">

              Showing{" "}
              {filteredTasks.length}{" "}
              of{" "}
              {tasks.length}

            </span>

          </div>


          <div
            ref={tasksTableRef}
            className="
              task-table-wrapper
            "
            style={{
              scrollMarginTop: "20px",
            }}
          >


            <table className="
              task-table
            ">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Task</th>

                  <th>Lead</th>

                  <th>Customer</th>

                  <th>Employee</th>

                  <th>Due Date</th>

                  <th>Priority</th>

                  <th>Status</th>

                  <th>Progress</th>

                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {filteredTasks.map(
                  (task) => (

                    <tr
                      key={task.id}
                    >

                      <td>
                        {task.id}
                      </td>


                      <td>

                        <div className="
                          task-title
                        ">

                          {
                            task.title ||
                            "-"
                          }

                        </div>

                        <div className="
                          task-secondary
                        ">

                          Task #
                          {task.id}

                        </div>

                      </td>


                      <td>
                        {getLeadName(
                          task.leadId
                        )}
                      </td>


                      <td>
                        {getCustomerName(
                          task.customerId
                        )}
                      </td>


                      <td>
                        {getUserName(
                          task.assignedUserId
                        )}
                      </td>


                      <td>

                        <div
                          className={`
                            task-due-date
                            ${
                              isOverdue(
                                task.dueDate,
                                task.status
                              )
                                ? "overdue"
                                : ""
                            }
                          `}
                        >

                          {formatDate(
                            task.dueDate
                          )}

                        </div>


                        {isOverdue(
                          task.dueDate,
                          task.status
                        ) && (

                          <div className="
                            task-overdue-label
                          ">
                            Overdue
                          </div>

                        )}

                      </td>


                      <td>

                        <span
                          className={`
                            task-badge
                            ${getPriorityClass(
                              task.priority
                            )}
                          `}
                        >

                          {
                            task.priority ||
                            "MEDIUM"
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={`
                            task-badge
                            ${getStatusClass(
                              task.status
                            )}
                          `}
                        >

                          {
                            String(
                              task.status ||
                              "TODO"
                            ).replace(
                              "_",
                              " "
                            )
                          }

                        </span>

                      </td>


                      <td>

                        <div className="
                          task-progress-wrapper
                        ">

                          <div className="
                            task-progress-text
                          ">

                            {task.status ===
                            "COMPLETED"
                              ? "100%"
                              : task.status ===
                                "IN_PROGRESS"
                              ? "50%"
                              : "0%"}

                          </div>

                          <div className="
                            task-progress-bar
                          ">

                            <div
                              className="
                                task-progress-fill
                              "
                              style={{
                                width:
                                  task.status ===
                                  "COMPLETED"
                                    ? "100%"
                                    : task.status ===
                                      "IN_PROGRESS"
                                    ? "50%"
                                    : "0%",
                              }}
                            />

                          </div>

                        </div>

                      </td>


                      <td>

                        <div className="
                          task-actions
                        ">

                          <button
                            type="button"
                            className="
                              task-action
                            "
                            onClick={() => {

                              setSelectedTask(
                                task
                              );

                              setShowDetails(
                                true
                              );

                            }}
                          >
                            View
                          </button>


                          <button
                            type="button"
                            className="
                              task-action
                            "
                            onClick={() =>
                              handleEdit(
                                task
                              )
                            }
                          >
                            Edit
                          </button>


                          {currentUser &&
                            (
                              currentUser.role === "ADMIN" ||
                              currentUser.role === "MANAGER"
                            ) && (
                              <button
                                type="button"
                                className="
                                  task-action
                                  delete
                                "
                                onClick={() =>
                                  handleDelete(
                                    task.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


            {filteredTasks.length === 0 && (

              <div className="
                task-empty
              ">

                <div className="
                  task-empty-core
                ">
                  ✓
                </div>

                <h3>
                  No tasks found
                </h3>

                <p>
                  Add a new task or
                  change your filters.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>


      {showModal && (

        <div
          className="
            task-modal-overlay
          "
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="
            task-modal
          ">


            <div className="
              task-modal-header
            ">

              <div>

                <h2>

                  {editingId
                    ? "Edit Task"
                    : "Add New Task"}

                </h2>

                <p>
                  Create and assign a CRM
                  task with a clear deadline.
                </p>

              </div>


              <button
                type="button"
                className="
                  task-close
                "
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            <form
              className="
                task-form
              "
              onSubmit={handleSubmit}
            >


              {error && (

                <div className="
                  task-form-error
                ">

                  {error}

                </div>

              )}


              <div className="
                task-form-grid
              ">


                <div className="
                  task-form-field
                  full
                ">

                  <label>
                    Task Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Enter task title
                    "
                    required
                  />

                </div>


                <div className="
                  task-form-field
                ">

                  <label>
                    Lead
                  </label>

                  <select
                    name="leadId"
                    value={form.leadId}
                    onChange={
                      handleChange
                    }
                  >

                    <option value="">
                      Select Lead
                    </option>

                    {leads.map(
                      (lead) => (

                        <option
                          key={lead.id}
                          value={lead.id}
                        >

                          {lead.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="
                  task-form-field
                ">

                  <label>
                    Customer
                  </label>

                  <select
                    name="customerId"
                    value={
                      form.customerId
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="">
                      Select Customer
                    </option>

                    {customers.map(
                      (customer) => (

                        <option
                          key={customer.id}
                          value={customer.id}
                        >

                          {customer.name}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {currentUser &&
                  (
                    currentUser.role === "ADMIN" ||
                    currentUser.role === "MANAGER"
                  ) && (
                    <div className="
                      task-form-field
                    ">

                      <label>
                        Assigned Employee
                      </label>

                      <select
                        name="assignedUserId"
                        value={form.assignedUserId}
                        onChange={handleChange}
                      >

                        <option value="">
                          Select Employee
                        </option>

                        {users
                          .filter(
                            (user) =>
                              user.active !== false &&
                              (
                                currentUser.role === "ADMIN" ||
                                user.role === "SALES" ||
                                user.role === "EMPLOYEE"
                              )
                          )
                          .map((user) => (

                            <option
                              key={user.id}
                              value={user.id}
                            >
                              {user.name}
                            </option>

                          ))}

                      </select>

                    </div>
                  )}


                <div className="
                  task-form-field
                ">

                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={
                      form.dueDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="
                  task-form-field
                ">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                  >

                    {priorityOptions.map(
                      (priority) => (

                        <option
                          key={priority}
                          value={priority}
                        >

                          {priority}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="
                  task-form-field
                ">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    {statusOptions.map(
                      (status) => (

                        <option
                          key={status}
                          value={status}
                        >

                          {status.replace(
                            "_",
                            " "
                          )}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div className="
                  task-form-field
                  full
                ">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Enter task details...
                    "
                    rows="4"
                  />

                </div>


              </div>


              <div className="
                task-modal-footer
              ">

                <button
                  type="button"
                  className="
                    task-cancel
                  "
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="
                    task-save
                  "
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Task"
                    : "Add Task"}

                </button>

              </div>


            </form>

          </div>

        </div>

      )}


      {showDetails &&
        selectedTask && (

          <div
            className="
              task-modal-overlay
            "
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {

                setShowDetails(false);

                setSelectedTask(null);

              }

            }}
          >

            <div className="
              task-modal
            ">


              <div className="
                task-modal-header
              ">

                <div>

                  <h2>
                    Task Details
                  </h2>

                  <p>
                    Complete task information
                    and progress.
                  </p>

                </div>


                <button
                  type="button"
                  className="
                    task-close
                  "
                  onClick={() => {

                    setShowDetails(
                      false
                    );

                    setSelectedTask(
                      null
                    );

                  }}
                >
                  ×
                </button>

              </div>


              <div className="
                task-details
              ">


                <div className="
                  task-details-top
                ">

                  <div className="
                    task-details-icon
                  ">
                    ✓
                  </div>


                  <div>

                    <h3>

                      {
                        selectedTask.title ||
                        "Task"
                      }

                    </h3>

                    <p>

                      Task #
                      {selectedTask.id}

                    </p>

                  </div>

                </div>


                <div className="
                  task-details-grid
                ">


                  <div className="
                    task-detail-box
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Status
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      <span
                        className={`
                          task-badge
                          ${getStatusClass(
                            selectedTask.status
                          )}
                        `}
                      >

                        {
                          String(
                            selectedTask.status ||
                            "TODO"
                          ).replace(
                            "_",
                            " "
                          )
                        }

                      </span>

                    </div>

                  </div>


                  <div className="
                    task-detail-box
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Priority
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      <span
                        className={`
                          task-badge
                          ${getPriorityClass(
                            selectedTask.priority
                          )}
                        `}
                      >

                        {
                          selectedTask.priority ||
                          "MEDIUM"
                        }

                      </span>

                    </div>

                  </div>


                  <div className="
                    task-detail-box
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Due Date
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      {formatDate(
                        selectedTask.dueDate
                      )}

                    </div>

                  </div>


                  <div className="
                    task-detail-box
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Assigned Employee
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      {getUserName(
                        selectedTask.assignedUserId
                      )}

                    </div>

                  </div>


                  <div className="
                    task-detail-box
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Lead
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      {getLeadName(
                        selectedTask.leadId
                      )}

                    </div>

                  </div>


                  <div className="
                    task-detail-box
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Customer
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      {getCustomerName(
                        selectedTask.customerId
                      )}

                    </div>

                  </div>


                  <div className="
                    task-detail-box
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Progress
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      {selectedTask.status ===
                      "COMPLETED"
                        ? "100%"
                        : selectedTask.status ===
                          "IN_PROGRESS"
                        ? "50%"
                        : "0%"}

                    </div>


                    <div className="
                      task-detail-progress
                    ">

                      <div
                        className="
                          task-detail-progress-fill
                        "
                        style={{
                          width:
                            selectedTask.status ===
                            "COMPLETED"
                              ? "100%"
                              : selectedTask.status ===
                                "IN_PROGRESS"
                              ? "50%"
                              : "0%",
                        }}
                      />

                    </div>

                  </div>


                  <div className="
                    task-detail-box
                    full
                  ">

                    <div className="
                      task-detail-label
                    ">
                      Description
                    </div>

                    <div className="
                      task-detail-value
                    ">

                      {
                        selectedTask.description ||
                        "No description added."
                      }

                    </div>

                  </div>


                </div>

              </div>

            </div>

          </div>

        )}

    </>
  );
}

export default Tasks;