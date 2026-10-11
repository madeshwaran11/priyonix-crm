import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  company: "",
  location: "",
  source: "",
  requirement: "",
  assignedUserId: "",
  priority: "MEDIUM",
  status: "NEW",
  followUpDate: "",
  notes: "",
};

const statuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "DISCUSSION",
  "PROPOSAL",
  "WON",
  "LOST",
];

const priorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
];

function Leads() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);
const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] =
    useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedLead, setSelectedLead] =
    useState(null);

  const leadsTableRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLeads();
    loadUsers();
    loadCurrentUser();
  }, []);

  /* =========================================
     LOAD LEADS
  ========================================= */

  const loadLeads = async () => {
    try {
      setLoading(true);

      const response = await api.get("/leads");

      setLeads(response.data || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load leads."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     LOAD USERS
  ========================================= */

  const loadUsers = async () => {
    try {
      const response = await api.get("/users/active");

      setUsers(response.data || []);
    } catch (error) {
      console.log(
        "Active user list is not available for this role."
      );

      setUsers([]);
    }
  };

  /* =========================================
     LOAD CURRENT USER
  ========================================= */

  const loadCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");

      setCurrentUser(response.data || null);
    } catch (error) {
      console.error(
        "Unable to load current user.",
        error
      );

      setCurrentUser(null);
    }
  };

  /* =========================================
     STATUS COUNTS
  ========================================= */

  const countStatus = (status) => {
    return leads.filter(
      (lead) =>
        String(lead.status || "").toUpperCase() ===
        status
    ).length;
  };

  const totalLeads = leads.length;

  const newLeads = countStatus("NEW");

  const qualifiedLeads =
    countStatus("QUALIFIED");

  const wonLeads = countStatus("WON");

  const lostLeads = countStatus("LOST");

  const activeLeads =
    totalLeads - wonLeads - lostLeads;

  const conversionRate =
    totalLeads > 0
      ? Math.round(
          (wonLeads / totalLeads) * 100
        )
      : 0;

  /* =========================================
     FILTER
  ========================================= */

  const filteredLeads = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !value ||
        String(lead.name || "")
          .toLowerCase()
          .includes(value) ||
        String(lead.email || "")
          .toLowerCase()
          .includes(value) ||
        String(lead.phone || "")
          .toLowerCase()
          .includes(value) ||
        String(lead.company || "")
          .toLowerCase()
          .includes(value) ||
        String(lead.location || "")
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(lead.status || "").toUpperCase() ===
          statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        String(
          lead.priority || ""
        ).toUpperCase() === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    leads,
    search,
    statusFilter,
    priorityFilter,
  ]);

  /* =========================================
     ADD LEAD
  ========================================= */

  const openAddModal = () => {

    if (currentUser?.role === "EMPLOYEE") {
      return;
    }

    setEditingId(null);

    setForm({
      ...emptyForm,
      assignedUserId:
        currentUser?.role === "SALES"
          ? currentUser.id
          : "",
    });

    setError("");
    setShowModal(true);
  };

  /* =========================================
     EDIT LEAD
  ========================================= */

  const openEditModal = (lead) => {
    setEditingId(lead.id);

    setForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      company: lead.company || "",
      location: lead.location || "",
      source: lead.source || "",
      requirement: lead.requirement || "",
      assignedUserId:
        lead.assignedUserId || "",
      priority:
        lead.priority || "MEDIUM",
      status:
        lead.status || "NEW",
      followUpDate:
        lead.followUpDate || "",
      notes:
        lead.notes || "",
    });

    setError("");
    setShowModal(true);
  };

  /* =========================================
     CLOSE MODAL
  ========================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  };

  /* =========================================
     SAVE LEAD
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError(
        "Lead name is required."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,

        assignedUserId:
          currentUser?.role === "SALES"
            ? Number(currentUser.id)
            : form.assignedUserId
            ? Number(form.assignedUserId)
            : null,
      };

      if (editingId) {
        await api.put(
          `/leads/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/leads",
          payload
        );
      }

      await loadLeads();

      closeModal();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to save lead."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE
  ========================================= */

  const deleteLead = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this lead?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/leads/${id}`
      );

      setLeads((old) =>
        old.filter(
          (lead) => lead.id !== id
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete lead."
      );
    }
  };

  /* =========================================
     CONVERT
  ========================================= */

  const convertLead = async (lead) => {
    // WON is a sales-pipeline status, not proof that a customer record exists.
    // Ask the backend to perform the conversion; it should return an existing
    // linked customer or create one idempotently if none exists.
    if (
      !window.confirm(
        `Convert ${lead.name} into a customer?`
      )
    ) {
      return;
    }

    try {
      await api.post(
        `/leads/${lead.id}/convert`
      );

      await loadLeads();

      alert(
        `${lead.name} has been converted successfully.`
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to convert lead."
      );
    }
  };

  /* =========================================
     USER NAME
  ========================================= */

  /* =========================================
     VIEW LEAD
  ========================================= */

  const openDetailsModal = (lead) => {
    if (!lead) return;

    setSelectedLead(lead);
    setShowDetails(true);
  };

  const closeDetailsModal = () => {
    setShowDetails(false);
    setSelectedLead(null);
  };


  const userName = (id) => {
    if (!id) {
      return "Not assigned";
    }

    const user = users.find(
      (item) =>
        Number(item.id) ===
        Number(id)
    );

    return (
      user?.name ||
      `User #${id}`
    );
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) {
      return "Not scheduled";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================
     VIEW ALL LEADS
  ========================================= */

  const handleViewAllLeads = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");

    // Move the user to the complete leads list.
    requestAnimationFrame(() => {
      leadsTableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };


  return (
    <>
      <style>{`

        /* =====================================
           PAGE
        ===================================== */

        .leads-page {
          min-height: 100vh;
          padding-bottom: 45px;

          background: #f4f6fb;

          color: #172033;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* =====================================
           HEADER
        ===================================== */

        .leads-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding:
            28px 0 22px;
        }

        .leads-page-header h1 {
          margin: 0;

          color: #10182f;

          font-size: 30px;

          font-weight: 900;

          letter-spacing: -0.8px;
        }

        .leads-page-header p {
          margin:
            7px 0 0;

          color: #71809a;

          font-size: 14px;
        }


        /* =====================================
           HERO
        ===================================== */

        .leads-hero {
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


        /* =====================================
           STARS
        ===================================== */

        .hero-stars {
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
            ),

            radial-gradient(
              circle at 73% 83%,
              white 0 1px,
              transparent 1.5px
            );
        }


        /* =====================================
           HERO CONTENT
        ===================================== */

        .hero-content {
          position: relative;

          z-index: 20;

          width: 48%;

          padding:
            50px 0 45px 52px;
        }

        .hero-status {
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

        .hero-status-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #22d3ee;

          box-shadow:
            0 0 12px
            rgba(34,211,238,.85);
        }

        .hero-content h2 {
          margin:
            25px 0 0;

          color: white;

          font-size: 49px;

          line-height: 1.04;

          letter-spacing: -2.4px;

          font-weight: 900;
        }

        .hero-content h2 span {
          color: #a99aff;
        }

        .hero-description {
          max-width: 490px;

          margin:
            20px 0 0;

          color: #aab5d2;

          font-size: 15px;

          line-height: 1.7;

          font-weight: 600;
        }

        .hero-actions {
          display: flex;

          gap: 12px;

          margin-top: 25px;
        }

        .hero-primary {
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

        .hero-primary:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 16px 30px
            rgba(103,80,235,.38);
        }

        .hero-secondary {
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

        .hero-mini-stats {
          display: flex;

          gap: 30px;

          margin-top: 32px;
        }

        .hero-mini-stat strong {
          display: block;

          color: white;

          font-size: 24px;

          font-weight: 900;
        }

        .hero-mini-stat span {
          display: block;

          margin-top: 4px;

          color: #8995b8;

          font-size: 11px;

          font-weight: 700;
        }


        /* =====================================
           MOON AREA
        ===================================== */

        .moon-area {
          position: absolute;

          right: 2%;

          top: 0;

          width: 53%;

          height: 100%;

          perspective: 1000px;
        }


        /* =====================================
           MOON GLOW
        ===================================== */

        .moon-glow {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 330px;
          height: 330px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(205,214,255,.38),
              rgba(120,111,255,.14) 48%,
              transparent 73%
            );

          filter: blur(10px);

          animation:
            moonGlow
            4s
            ease-in-out
            infinite;
        }

        @keyframes moonGlow {

          0%,
          100% {
            opacity: .65;

            transform:
              translate(-50%, -50%)
              scale(.94);
          }

          50% {
            opacity: 1;

            transform:
              translate(-50%, -50%)
              scale(1.08);
          }
        }


        /* =====================================
           ORBIT ONE
        ===================================== */

        .moon-orbit {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 430px;
          height: 150px;

          transform:
            translate(-50%, -50%)
            rotate(-20deg);

          border:
            1px solid
            rgba(139,152,255,.30);

          border-radius: 50%;

          animation:
            orbitOne
            14s
            linear
            infinite;
        }

        @keyframes orbitOne {

          from {
            transform:
              translate(-50%, -50%)
              rotate(-20deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotate(340deg);
          }
        }


        /* =====================================
           ORBIT TWO
        ===================================== */

        .moon-orbit-two {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 350px;
          height: 125px;

          transform:
            translate(-50%, -50%)
            rotate(58deg);

          border:
            1px solid
            rgba(112,226,255,.18);

          border-radius: 50%;

          animation:
            orbitTwo
            18s
            linear
            infinite reverse;
        }

        @keyframes orbitTwo {

          from {
            transform:
              translate(-50%, -50%)
              rotate(58deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotate(418deg);
          }
        }


        /* =====================================
           REALISTIC BRIGHT MOON
        ===================================== */

        .moon {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 220px;
          height: 220px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:

            radial-gradient(
              circle at 30% 24%,
              #ffffff 0%,
              #f8f9fb 13%,
              #e9edf2 30%,
              #d2d7df 52%,
              #aeb6c1 72%,
              #7c8795 100%
            );

          box-shadow:

            0 0 18px
            rgba(255,255,255,.85),

            0 0 42px
            rgba(190,205,255,.55),

            0 0 85px
            rgba(117,135,255,.24),

            inset 22px 14px 25px
            rgba(255,255,255,.72),

            inset -38px -20px 48px
            rgba(48,58,75,.58);

          z-index: 5;

          animation:
            moonFloat
            5s
            ease-in-out
            infinite;
        }


        /* =====================================
           MOON CRATERS
        ===================================== */

        .moon::before {
          content: "";

          position: absolute;

          inset: 0;

          border-radius: 50%;

          background:

            radial-gradient(
              circle at 68% 22%,
              rgba(91,101,114,.42) 0,
              rgba(112,121,133,.30) 12px,
              rgba(160,168,178,.15) 20px,
              transparent 25px
            ),

            radial-gradient(
              circle at 25% 32%,
              rgba(86,96,109,.46) 0,
              rgba(125,134,146,.28) 12px,
              rgba(173,180,189,.12) 20px,
              transparent 25px
            ),

            radial-gradient(
              circle at 39% 70%,
              rgba(75,86,101,.48) 0,
              rgba(111,121,135,.30) 15px,
              rgba(166,174,184,.12) 24px,
              transparent 29px
            ),

            radial-gradient(
              circle at 76% 59%,
              rgba(70,81,96,.45) 0,
              rgba(116,126,139,.28) 11px,
              rgba(166,174,184,.10) 19px,
              transparent 24px
            ),

            radial-gradient(
              circle at 53% 46%,
              rgba(91,101,114,.35) 0,
              rgba(132,141,153,.20) 8px,
              transparent 17px
            ),

            radial-gradient(
              circle at 20% 62%,
              rgba(76,87,101,.38) 0 8px,
              transparent 13px
            ),

            radial-gradient(
              circle at 58% 78%,
              rgba(78,89,103,.35) 0 10px,
              transparent 16px
            ),

            radial-gradient(
              circle at 82% 38%,
              rgba(87,97,110,.30) 0 7px,
              transparent 13px
            ),

            radial-gradient(
              circle at 47% 17%,
              rgba(91,101,114,.28) 0 6px,
              transparent 11px
            ),

            radial-gradient(
              circle at 63% 62%,
              rgba(76,87,101,.28) 0 5px,
              transparent 10px
            );

          opacity: .92;

          filter:
            contrast(1.08)
            brightness(1.05);
        }


        /* =====================================
           MOON EDGE LIGHT
        ===================================== */

        .moon::after {
          content: "";

          position: absolute;

          inset: 2px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.72);

          box-shadow:

            inset 8px 5px 15px
            rgba(255,255,255,.45),

            inset -14px -10px 25px
            rgba(45,54,68,.30);

          pointer-events: none;
        }


        /* =====================================
           MOON FLOAT
        ===================================== */

        @keyframes moonFloat {

          0%,
          100% {
            transform:
              translate(-50%, -50%)
              translateY(0);
          }

          50% {
            transform:
              translate(-50%, -50%)
              translateY(-10px);
          }
        }


        /* =====================================
           SATELLITES
        ===================================== */

        .space-satellite {
          position: absolute;

          width: 78px;
          height: 34px;

          z-index: 8;

          pointer-events: none;

          filter:
            drop-shadow(
              0 0 10px
              rgba(65,190,255,.75)
            )

            drop-shadow(
              0 0 22px
              rgba(104,80,255,.45)
            );
        }

        .space-satellite::before {
          content: "";

          position: absolute;

          left: 18px;
          top: 9px;

          width: 40px;
          height: 17px;

          border-radius:
            50% 55% 55% 50%;

          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #aebcff 28%,
              #6875ff 62%,
              #3e4ce8 100%
            );

          border:
            1px solid
            rgba(255,255,255,.65);

          box-shadow:

            inset -8px -4px 10px
            rgba(27,35,120,.55),

            inset 5px 3px 7px
            rgba(255,255,255,.75);
        }

        .space-satellite::after {
          content: "";

          position: absolute;

          left: 0;
          top: 14px;

          width: 25px;
          height: 8px;

          border-radius:
            50% 0 0 50%;

          background:
            linear-gradient(
              90deg,
              transparent,
              #22d3ee 35%,
              #8b5cf6 100%
            );

          box-shadow:
            0 0 10px #22d3ee,
            0 0 20px
            rgba(34,211,238,.7);

          animation:
            enginePulse
            .8s
            ease-in-out
            infinite
            alternate;
        }

        @keyframes enginePulse {

          from {
            transform:
              scaleX(.75);

            opacity: .65;
          }

          to {
            transform:
              scaleX(1.15);

            opacity: 1;
          }
        }


        /* =====================================
           SATELLITE WINDOW
        ===================================== */

        .satellite-window {
          position: absolute;

          z-index: 4;

          left: 48px;
          top: 12px;

          width: 10px;
          height: 10px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle at 30% 25%,
              #ffffff,
              #5ee7ff 40%,
              #3155d9 100%
            );

          box-shadow:
            0 0 8px
            rgba(94,231,255,.9);
        }


        /* =====================================
           SATELLITE WINGS
        ===================================== */

        .satellite-wing {
          position: absolute;

          z-index: 3;

          width: 22px;
          height: 8px;

          border-radius: 3px;

          background:
            linear-gradient(
              90deg,
              #2e3ca9,
              #6d7dff
            );

          border:
            1px solid
            rgba(145,160,255,.65);

          box-shadow:
            0 0 8px
            rgba(91,110,255,.5);
        }

        .satellite-wing.top {
          left: 25px;
          top: 1px;

          transform:
            rotate(-12deg);
        }

        .satellite-wing.bottom {
          left: 28px;
          top: 25px;

          transform:
            rotate(12deg);
        }


        /* =====================================
           SATELLITE ONE
        ===================================== */

        .space-satellite.one {
          right: 9%;
          top: 17%;

          transform:
            rotate(-8deg);

          animation:
            satelliteFloatOne
            6s
            ease-in-out
            infinite;
        }

        @keyframes satelliteFloatOne {

          0%,
          100% {
            transform:
              translate(0,0)
              rotate(-8deg);
          }

          25% {
            transform:
              translate(18px,-13px)
              rotate(-2deg);
          }

          50% {
            transform:
              translate(32px,6px)
              rotate(5deg);
          }

          75% {
            transform:
              translate(12px,18px)
              rotate(1deg);
          }
        }


        /* =====================================
           SATELLITE TWO
        ===================================== */

        .space-satellite.two {
          left: 11%;
          bottom: 13%;

          transform:
            rotate(12deg);

          animation:
            satelliteFloatTwo
            7s
            ease-in-out
            infinite;
        }

        @keyframes satelliteFloatTwo {

          0%,
          100% {
            transform:
              translate(0,0)
              rotate(12deg);
          }

          25% {
            transform:
              translate(-18px,10px)
              rotate(5deg);
          }

          50% {
            transform:
              translate(-30px,-12px)
              rotate(-5deg);
          }

          75% {
            transform:
              translate(-8px,-20px)
              rotate(4deg);
          }
        }


        /* =====================================
           METRIC CARDS
        ===================================== */

        .moon-metric {
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

          z-index: 15;

          animation:
            metricFloat
            5s
            ease-in-out
            infinite;
        }

        .moon-metric.one {
          left: 4%;
          top: 12%;
        }

        .moon-metric.two {
          right: 0;
          top: 55%;

          animation-delay:
            -1.7s;
        }

        .moon-metric.three {
          left: 13%;
          bottom: 8%;

          animation-delay:
            -3s;
        }

        @keyframes metricFloat {

          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-7px);
          }
        }

        .moon-metric strong {
          display: block;

          color: white;

          font-size: 22px;

          font-weight: 900;
        }

        .moon-metric span {
          display: block;

          margin-top: 3px;

          color: #8e9abb;

          font-size: 10px;

          font-weight: 800;
        }


        /* =====================================
           SECTION TITLE
        ===================================== */

        .section-title {
          margin-top: 38px;

          margin-bottom: 17px;
        }

        .section-title h2 {
          margin: 0;

          color: #13203b;

          font-size: 27px;

          font-weight: 900;

          letter-spacing: -.7px;
        }

        .section-title p {
          margin:
            5px 0 0;

          color: #75839c;

          font-size: 13px;
        }


        /* =====================================
           OVERVIEW CARDS
        ===================================== */

        .lead-overview-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 17px;
        }

        .overview-card {
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

        .overview-card::after {
          content: "";

          position: absolute;

          width: 95px;
          height: 95px;

          right: -30px;
          top: -30px;

          border-radius: 50%;

          background: #edf0ff;
        }

        .overview-icon {
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

        .overview-value {
          position: relative;

          z-index: 2;

          margin-top: 15px;

          color: #101a33;

          font-size: 29px;

          font-weight: 900;
        }

        .overview-label {
          position: relative;

          z-index: 2;

          margin-top: 3px;

          color: #71809a;

          font-size: 12px;

          font-weight: 700;
        }


        /* =====================================
           FILTERS
        ===================================== */

        .lead-controls {
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

        .lead-search {
          flex: 1 1 320px;

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

        .lead-search:focus {
          border-color: #7965ee;

          box-shadow:
            0 0 0 3px
            rgba(121,101,238,.08);
        }

        .lead-filter {
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

        .results-text {
          color: #8290a7;

          font-size: 11px;

          font-weight: 800;
        }


        /* =====================================
           TABLE
        ===================================== */

        .lead-table-wrapper {
          scroll-margin-top: 80px;

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

        .lead-table {
          width: 100%;

          min-width: 1080px;

          border-collapse: collapse;
        }

        .lead-table th {
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

        .lead-table td {
          padding:
            16px 15px;

          border-bottom:
            1px solid
            #edf0f5;

          color: #647189;

          font-size: 11px;
        }

        .lead-table tbody tr:hover {
          background: #fbfcff;
        }

        .lead-name {
          color: #17213a;

          font-size: 13px;

          font-weight: 900;
        }

        .lead-company {
          margin-top: 4px;

          color: #9aa5b7;

          font-size: 10px;
        }


        /* =====================================
           BADGES
        ===================================== */

        .badge {
          display: inline-flex;

          padding:
            6px 9px;

          border-radius: 20px;

          font-size: 9px;

          font-weight: 900;
        }

        .status-new {
          color: #4356d9;
          background: #eef0ff;
        }

        .status-contacted {
          color: #087ea4;
          background: #e7f8fc;
        }

        .status-qualified {
          color: #078b65;
          background: #e5faf2;
        }

        .status-discussion {
          color: #7c45c7;
          background: #f3eaff;
        }

        .status-proposal {
          color: #ad7610;
          background: #fff6db;
        }

        .status-won {
          color: #078363;
          background: #e1f9ef;
        }

        .status-lost {
          color: #c24454;
          background: #ffe9ed;
        }

        .priority-low {
          color: #087ea4;
          background: #e7f8fc;
        }

        .priority-medium {
          color: #ad7610;
          background: #fff6db;
        }

        .priority-high {
          color: #c24454;
          background: #ffe9ed;
        }


        /* =====================================
           TABLE ACTIONS
        ===================================== */

        .table-actions {
          position: relative;
          z-index: 30;

          display: flex;

          gap: 5px;
        }

        .table-action {
          position: relative;
          z-index: 31;

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

        .table-action:hover {
          color: #6355dc;

          border-color: #bdb5ff;

          background: #f8f7ff;
        }

        .table-action.delete:hover {
          color: #dc4b5c;

          border-color: #ffc4cc;

          background: #fff6f7;
        }


        /* =====================================
           EMPTY STATE
        ===================================== */

        .empty-state {
          padding:
            70px 20px;

          text-align: center;
        }

        .empty-state h3 {
          margin:
            13px 0 5px;

          color: #17213a;

          font-size: 18px;
        }

        .empty-state p {
          margin: 0;

          color: #8c98aa;

          font-size: 12px;
        }

        .empty-moon {
          width: 58px;
          height: 58px;

          margin: auto;

          border-radius: 50%;

          background:
            radial-gradient(
              circle at 30% 25%,
              #fff,
              #c7ced9 45%,
              #727d8e
            );

          box-shadow:
            0 8px 22px
            rgba(74,85,104,.18);
        }


        /* =====================================
           MODAL
        ===================================== */

        .modal-overlay {
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
        }

        .modal {
          width:
            min(850px,100%);

          max-height: 92vh;

          overflow-y: auto;

          border-radius: 20px;

          background: white;

          box-shadow:
            0 35px 90px
            rgba(15,23,42,.30);
        }

        .modal-header {
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

        .modal-header h2 {
          margin: 0;

          color: #15203a;

          font-size: 21px;

          font-weight: 900;
        }

        .modal-header p {
          margin:
            5px 0 0;

          color: #8b97a9;

          font-size: 11px;
        }

        .modal-close {
          width: 38px;
          height: 38px;

          border: 0;

          border-radius: 9px;

          color: #68758b;

          background: #f1f3f8;

          cursor: pointer;

          font-size: 20px;
        }

        .modal-form {
          padding: 23px;
        }

        .form-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 14px;
        }

        .form-field {
          display: flex;

          flex-direction: column;

          gap: 6px;
        }

        .form-field.full {
          grid-column: 1 / -1;
        }

        .form-field label {
          color: #59667d;

          font-size: 10px;

          font-weight: 900;

          text-transform: uppercase;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;

          border:
            1px solid
            #dfe4ed;

          border-radius: 9px;

          outline: none;

          color: #263149;

          background: #fafbfe;

          font: inherit;

          font-size: 12px;
        }

        .form-field input,
        .form-field select {
          height: 43px;

          padding:
            0 11px;
        }

        .form-field textarea {
          min-height: 90px;

          padding: 11px;

          resize: vertical;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          border-color: #7965ee;

          box-shadow:
            0 0 0 3px
            rgba(121,101,238,.08);
        }

        .form-error {
          margin-bottom: 15px;

          padding:
            10px 12px;

          border-radius: 8px;

          color: #c24454;

          background: #fff0f2;

          font-size: 11px;

          font-weight: 700;
        }

        .modal-footer {
          display: flex;

          justify-content: flex-end;

          gap: 9px;

          margin-top: 20px;

          padding-top: 17px;

          border-top:
            1px solid
            #edf0f5;
        }

        .cancel-button {
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

        .save-button {
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

          font-weight: 850;
        }


        /* =====================================
           DETAILS
        ===================================== */

        .lead-details {
          padding: 23px;
        }

        .lead-profile {
          display: flex;

          align-items: center;

          gap: 13px;

          padding: 15px;

          margin-bottom: 17px;

          border-radius: 13px;

          background: #f7f8fc;
        }

        .lead-avatar {
          width: 52px;
          height: 52px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6255ee,
              #3b82f6
            );

          font-size: 19px;

          font-weight: 900;
        }

        .lead-profile h3 {
          margin: 0;

          color: #17213a;

          font-size: 17px;
        }

        .lead-profile p {
          margin:
            4px 0 0;

          color: #8b97a9;

          font-size: 11px;
        }

        .details-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 10px;
        }

        .detail-box {
          padding: 12px;

          border:
            1px solid
            #e8ebf1;

          border-radius: 10px;

          background: #fbfcfe;
        }

        .detail-box.full {
          grid-column: 1 / -1;
        }

        .detail-label {
          color: #98a2b3;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .06em;

          text-transform: uppercase;
        }

        .detail-value {
          margin-top: 5px;

          color: #33405a;

          font-size: 12px;

          font-weight: 700;

          word-break: break-word;
        }


        /* =====================================
           RESPONSIVE
        ===================================== */

        @media(max-width:1100px) {

          .hero-content {
            width: 53%;
          }

          .moon-area {
            width: 52%;
          }

          .moon {
            width: 185px;
            height: 185px;
          }

          .moon-orbit {
            width: 350px;
          }

          .moon-orbit-two {
            width: 290px;
          }

          .lead-overview-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }


        @media(max-width:800px) {

          .leads-hero {
            min-height: 680px;
          }

          .hero-content {
            width: 100%;

            padding:
              40px 30px 0;
          }

          .hero-content h2 {
            font-size: 40px;
          }

          .moon-area {
            top: 320px;

            left: 0;
            right: 0;

            width: 100%;

            height: 350px;
          }
        }


        @media(max-width:600px) {

          .leads-page-header {
            padding-top: 18px;
          }

          .leads-page-header h1 {
            font-size: 26px;
          }

          .leads-hero {
            min-height: 640px;

            border-radius: 22px;
          }

          .hero-content {
            padding:
              28px 22px 0;
          }

          .hero-content h2 {
            font-size: 34px;
          }

          .hero-description {
            font-size: 13px;
          }

          .hero-mini-stats {
            gap: 18px;
          }

          .moon-area {
            top: 310px;

            height: 310px;

            transform:
              scale(.82);

            transform-origin:
              top center;
          }

          .space-satellite.one {
            right: 3%;
          }

          .space-satellite.two {
            left: 4%;
          }

          .lead-overview-grid {
            grid-template-columns: 1fr;
          }

          .lead-controls {
            align-items: stretch;

            flex-direction: column;
          }

          .lead-search,
          .lead-filter {
            width: 100%;
          }

          .form-grid,
          .details-grid {
            grid-template-columns: 1fr;
          }

          .form-field.full,
          .detail-box.full {
            grid-column: auto;
          }

          .modal-overlay {
            padding: 8px;
          }

          .modal {
            max-height: 96vh;
          }
        }

      
        /* ===== MAKE THE LEAD MOON ORBIT AS VISIBLE AS THE CUSTOMER STAR ===== */
        .leads-page .moon-area {
          isolation: isolate;
        }

        /* A clear vertical accent orbit frames the moon, like the Customer page. */
        .leads-page .moon-area::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 250px;
          height: 330px;
          transform: translate(-50%, -50%) rotate(-14deg);
          border: 1px solid rgba(255, 214, 96, 0.38);
          border-radius: 50%;
          box-shadow:
            0 0 22px rgba(255, 180, 55, 0.16),
            inset 0 0 18px rgba(255, 214, 96, 0.06);
          z-index: 3;
          pointer-events: none;
          animation: leadMoonAccentOrbit 12s linear infinite;
        }

        @keyframes leadMoonAccentOrbit {
          from { transform: translate(-50%, -50%) rotate(-14deg); }
          to { transform: translate(-50%, -50%) rotate(346deg); }
        }

        /* Strengthen the existing blue and cyan orbital paths. */
        .leads-page .moon-orbit {
          z-index: 2;
          border-color: rgba(157, 167, 255, 0.52);
          box-shadow:
            0 0 22px rgba(124, 108, 255, 0.16),
            inset 0 0 15px rgba(139, 152, 255, 0.06);
        }

        .leads-page .moon-orbit-two {
          z-index: 2;
          border-color: rgba(97, 225, 255, 0.40);
          box-shadow:
            0 0 20px rgba(34, 211, 238, 0.13),
            inset 0 0 14px rgba(34, 211, 238, 0.05);
        }

        @media (max-width: 600px) {
          .leads-page .moon-area::before {
            width: 210px;
            height: 275px;
          }
        }

        /* ===== DARK SPACE THEME: LEADS PAGE VISIBILITY ===== */
        .leads-page {
          color: #eaf0ff;
          background:
            radial-gradient(circle at 82% 8%, rgba(75, 85, 255, 0.10), transparent 28%),
            radial-gradient(circle at 8% 76%, rgba(34, 211, 238, 0.05), transparent 26%),
            #071329;
          font-family: Inter, "Segoe UI", Arial, sans-serif;
        }

        .leads-page-header h1 {
          color: #f4f7ff;
        }

        .leads-page-header p {
          color: #a9bbda;
        }

        .section-title h2 {
          color: #f4f7ff;
        }

        .section-title p {
          color: #a9bbda;
        }

        /* Overview metric cards */
        .leads-page .overview-card {
          background: rgba(13, 27, 56, 0.96);
          border-color: rgba(124, 157, 255, 0.22);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
        }

        .leads-page .overview-card::after {
          background: rgba(99, 102, 241, 0.12);
        }

        .leads-page .overview-value {
          color: #f4f7ff;
        }

        .leads-page .overview-label {
          color: #a9bbda;
        }

        /* Search and filter controls */
        .leads-page .lead-controls {
          background: rgba(13, 27, 56, 0.96);
          border-color: rgba(124, 157, 255, 0.22);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
        }

        .leads-page .lead-search,
        .leads-page .lead-filter {
          color: #f4f7ff;
          background: #0a1730;
          border-color: #30466f;
        }

        .leads-page .lead-search::placeholder {
          color: #8094b8;
          opacity: 1;
        }

        .leads-page .lead-search:focus,
        .leads-page .lead-filter:focus {
          border-color: #8b7cff;
          box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18);
        }

        .leads-page .results-text {
          color: #a9bbda;
        }

        /* Leads table */
        .leads-page .lead-table-wrapper {
          background: rgba(13, 27, 56, 0.96);
          border-color: rgba(124, 157, 255, 0.22);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
        }

        .leads-page .lead-table th {
          color: #a9bbda;
          background: #101f3b;
          border-bottom-color: #263d68;
        }

        .leads-page .lead-table td {
          color: #c4d0e7;
          border-bottom-color: rgba(124, 157, 255, 0.14);
        }

        .leads-page .lead-table tbody tr {
          background: transparent;
        }

        .leads-page .lead-table tbody tr:hover {
          background: rgba(92, 105, 190, 0.12);
        }

        .leads-page .lead-name {
          color: #f4f7ff;
        }

        .leads-page .lead-company {
          color: #9aadd0;
        }

        .leads-page .table-action {
          color: #dbe7ff;
          background: #142544;
          border-color: #30466f;
        }

        .leads-page .table-action:hover {
          color: #ffffff;
          background: #25396a;
          border-color: #8b7cff;
        }

        .leads-page .table-action.delete:hover {
          color: #ffdce2;
          background: rgba(194, 68, 84, 0.18);
          border-color: rgba(255, 133, 151, 0.55);
        }

        /* Empty state */
        .leads-page .empty-state h3 {
          color: #f4f7ff;
        }

        .leads-page .empty-state p {
          color: #a9bbda;
        }

        /* Add/edit and view-details modals */
        .leads-page .modal {
          color: #eaf0ff;
          background: #0d1b38;
          border: 1px solid rgba(124, 157, 255, 0.22);
        }

        .leads-page .modal-header {
          border-bottom-color: rgba(124, 157, 255, 0.18);
        }

        .leads-page .modal-header h2 {
          color: #f4f7ff;
        }

        .leads-page .modal-header p {
          color: #a9bbda;
        }

        .leads-page .modal-close {
          color: #dbe7ff;
          background: #1a2d4d;
        }

        .leads-page .form-field label {
          color: #b9c8e4;
        }

        .leads-page .form-field input,
        .leads-page .form-field select,
        .leads-page .form-field textarea {
          color: #f4f7ff;
          background: #09172f;
          border-color: #30466f;
        }

        .leads-page .form-field input::placeholder,
        .leads-page .form-field textarea::placeholder {
          color: #8094b8;
          opacity: 1;
        }

        .leads-page .form-field select option {
          color: #f4f7ff;
          background: #0d1b38;
        }

        .leads-page .form-field input:focus,
        .leads-page .form-field select:focus,
        .leads-page .form-field textarea:focus {
          border-color: #8b7cff;
          box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18);
        }

        .leads-page .form-error {
          color: #ffdce2;
          background: rgba(194, 68, 84, 0.18);
          border: 1px solid rgba(255, 133, 151, 0.28);
        }

        .leads-page .modal-footer {
          border-top-color: rgba(124, 157, 255, 0.18);
        }

        .leads-page .cancel-button {
          color: #dbe7ff;
          background: #142544;
          border-color: #30466f;
        }

        .leads-page .cancel-button:hover {
          background: #20365a;
        }

        /* Details modal */
        .leads-page .lead-profile {
          background: #142544;
        }

        .leads-page .lead-profile h3 {
          color: #f4f7ff;
        }

        .leads-page .lead-profile p {
          color: #a9bbda;
        }

        .leads-page .detail-box {
          background: #0a1730;
          border-color: #30466f;
        }

        .leads-page .detail-label {
          color: #91a6ca;
        }

        .leads-page .detail-value {
          color: #e3ebfb;
        }


        /* ===== MODAL POSITION + DATE PICKER VISIBILITY FIX ===== */
        .leads-page .modal-overlay {
          align-items: flex-start !important;
          justify-content: center !important;
          overflow-y: auto !important;
          padding: 84px 20px 24px !important;
          box-sizing: border-box;
          overscroll-behavior: contain;
        }

        .leads-page .modal {
          flex: 0 0 auto;
          width: min(850px, 100%);
          max-height: calc(100dvh - 108px) !important;
          margin: 0 auto !important;
          overflow-y: auto !important;
          overscroll-behavior: contain;
        }

        .leads-page .modal-header {
          position: sticky;
          top: 0;
          z-index: 5;
          background: #0d1b38;
        }

        /* Make the native calendar icon visible on the dark input. */
        .leads-page input[type="date"] {
          color-scheme: dark;
          color: #f4f7ff !important;
          background: #09172f !important;
        }

        .leads-page input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(1.8);
          opacity: 1;
          cursor: pointer;
        }

        @media (max-width: 700px) {
          .leads-page .modal-overlay {
            padding: 76px 10px 12px !important;
          }

          .leads-page .modal {
            width: 100%;
            max-height: calc(100dvh - 88px) !important;
          }
        }

        /* ===== LEADS PAGE SPACING + WORKSPACE SEPARATION ===== */
        .leads-page {
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
        }

        .leads-page-header {
          min-width: 0;
          gap: 18px;
          padding: 8px 2px 24px !important;
          margin: 0;
        }

        .leads-page-header h1 {
          color: #f4f7ff !important;
        }

        .leads-page-header p {
          color: #a9bbda !important;
        }

        .leads-hero {
          width: 100%;
          max-width: 100%;
          margin: 0 0 34px;
          /* Match the visible frame around the Customers hero panel. */
          border: 1px solid rgba(124, 141, 255, 0.24) !important;
          box-shadow:
            0 22px 55px rgba(34, 40, 80, 0.20),
            inset 0 0 0 1px rgba(255, 255, 255, 0.025) !important;
        }

        .section-title {
          margin-top: 0 !important;
          margin-bottom: 17px;
          padding-top: 0;
        }

        .section-title h2 {
          color: #f4f7ff !important;
        }

        .section-title p {
          color: #a9bbda !important;
        }

        .lead-overview-grid,
        .lead-controls,
        .lead-table-wrapper {
          width: 100%;
          min-width: 0;
        }

        .lead-controls {
          margin-top: 26px;
        }

        .lead-table-wrapper {
          margin-bottom: 6px;
        }

        @media (max-width: 700px) {
          .leads-page {
            padding: 12px 12px 28px !important;
            border-radius: 16px;
          }

          .leads-page-header {
            padding: 8px 2px 20px !important;
          }
        }



        /* ===== FORCE WHITE DATE CALENDAR ICON ===== */
        .leads-page input[type="date"] {
          color-scheme: dark !important;
          -webkit-appearance: auto !important;
          appearance: auto !important;
        }

        .leads-page input[type="date"]::-webkit-calendar-picker-indicator,
        .leads-page .modal input[type="date"]::-webkit-calendar-picker-indicator {
          filter: brightness(0) invert(1) !important;
          -webkit-filter: brightness(0) invert(1) !important;
          opacity: 1 !important;
          cursor: pointer !important;
          background-color: transparent !important;
        }

        /* ===== RESPONSIVE MODAL: KEEP IT INSIDE THE MAIN WORKSPACE ===== */
        /* Raise the page only while a modal exists, so the sidebar cannot cover it. */
        .leads-page:has(.modal-overlay) {
          z-index: 2000 !important;
        }

        .leads-page .modal-overlay {
          position: fixed !important;
          inset: 78px 0 0 278px !important;
          z-index: 5000 !important;
          display: flex;
          align-items: flex-start !important;
          justify-content: center !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          padding: 16px 20px 18px !important;
          box-sizing: border-box !important;
          overscroll-behavior: contain;
        }

        .leads-page .modal {
          flex: 0 1 850px !important;
          width: min(850px, 100%) !important;
          min-width: 0 !important;
          max-height: calc(100dvh - 112px) !important;
          margin: 0 auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          overscroll-behavior: contain;
        }

        .leads-page .modal-form,
        .leads-page .form-grid,
        .leads-page .details-grid {
          min-width: 0;
        }

        .leads-page .form-field input,
        .leads-page .form-field select,
        .leads-page .form-field textarea {
          min-width: 0;
          max-width: 100%;
        }

        /* The sidebar is 245px from 801px to 1050px wide. */
        @media (max-width: 1050px) and (min-width: 801px) {
          .leads-page .modal-overlay {
            inset: 78px 0 0 245px !important;
            padding: 14px 14px 16px !important;
          }

          .leads-page .modal {
            max-height: calc(100dvh - 108px) !important;
          }
        }

        /* On mobile, the layout hides the sidebar and uses a 68px top bar. */
        @media (max-width: 800px) {
          .leads-page .modal-overlay {
            inset: 68px 0 0 0 !important;
            padding: 12px 12px 14px !important;
          }

          .leads-page .modal {
            width: 100% !important;
            max-height: calc(100dvh - 94px) !important;
            border-radius: 16px;
          }
        }

        @media (max-width: 600px) {
          .leads-page .form-grid,
          .leads-page .details-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .leads-page .form-field.full,
          .leads-page .detail-box.full {
            grid-column: auto !important;
          }

          .leads-page .modal-form,
          .leads-page .lead-details {
            padding: 16px !important;
          }

          .leads-page .modal-header {
            padding: 16px !important;
          }
        }

        /* ===== HIDE MODAL SCROLLBARS, KEEP SCROLLING ENABLED ===== */
        .leads-page .modal,
        .leads-page .modal-overlay {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* Legacy Edge/IE */
        }

        .leads-page .modal::-webkit-scrollbar,
        .leads-page .modal-overlay::-webkit-scrollbar {
          display: none !important; /* Chrome, Edge, Safari */
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }

        /* ===== RESPONSIVE POLISH — all devices ===== */
        @media (max-width: 600px) {
          .lead-search,
          .lead-filter {
            flex: 0 0 auto;
            width: 100%;
            min-width: 0;
          }

          .hero-actions {
            flex-wrap: wrap;
          }

          .moon-metric {
            display: none;
          }
        }

        @media (max-width: 400px) {
          .hero-primary,
          .hero-secondary {
            flex: 1 1 100%;
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .leads-page-header h1 {
            font-size: 23px;
          }

          .hero-content h2 {
            font-size: 29px;
          }

          .leads-hero {
            min-height: 560px;
          }
        }

        @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
          .leads-hero {
            min-height: 360px !important;
          }

          .moon-area {
            display: none;
          }
        }

      `}</style>


      <div className="leads-page">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="leads-page-header">

          <div>

            <h1>
              Lead Management
            </h1>

            <p>
              Manage and track your business
              opportunities.
            </p>

          </div>

        </div>


        {/* =====================================
            HERO
        ===================================== */}

        <section className="leads-hero">

          <div className="hero-stars"></div>


          {/* ===================================
              HERO CONTENT
          =================================== */}

          <div className="hero-content">

            <div className="hero-status">

              <span
                className="hero-status-dot"
              />

              LEAD SYSTEM ONLINE

            </div>


            <h2>

              From first contact

              <br />

              <span>
                to conversion.
              </span>

            </h2>


            <p className="hero-description">

              Manage prospects, opportunities
              and conversions from one
              connected PriyoniX CRM workspace.

            </p>


            <div className="hero-actions">

              {currentUser?.role !== "EMPLOYEE" && (
                <button
                  className="hero-primary"
                  onClick={openAddModal}
                >
                  Add New Lead →
                </button>
              )}


              <button
                type="button"
                className="hero-secondary"
                onClick={handleViewAllLeads}
              >
                View All Leads
              </button>

            </div>


            <div className="hero-mini-stats">

              <div className="hero-mini-stat">

                <strong>
                  {totalLeads}
                </strong>

                <span>
                  Total Leads
                </span>

              </div>


              <div className="hero-mini-stat">

                <strong>
                  {activeLeads}
                </strong>

                <span>
                  Active Leads
                </span>

              </div>


              <div className="hero-mini-stat">

                <strong>
                  {conversionRate}%
                </strong>

                <span>
                  Conversion
                </span>

              </div>

            </div>

          </div>


          {/* ===================================
              MOON SPACE
          =================================== */}

          <div className="moon-area">

            {/* Moon glow */}

            <div className="moon-glow"></div>


            {/* Orbit */}

            <div className="moon-orbit"></div>

            <div className="moon-orbit-two"></div>


            {/* =================================
                SATELLITE ONE
            ================================= */}

            <div
              className="
                space-satellite
                one
              "
            >

              <span
                className="
                  satellite-wing
                  top
                "
              />

              <span
                className="
                  satellite-wing
                  bottom
                "
              />

              <span
                className="
                  satellite-window
                "
              />

            </div>


            {/* =================================
                SATELLITE TWO
            ================================= */}

            <div
              className="
                space-satellite
                two
              "
            >

              <span
                className="
                  satellite-wing
                  top
                "
              />

              <span
                className="
                  satellite-wing
                  bottom
                "
              />

              <span
                className="
                  satellite-window
                "
              />

            </div>


            {/* =================================
                REALISTIC MOON
            ================================= */}

            <div className="moon"></div>


            {/* =================================
                ACTIVE LEADS
            ================================= */}

            <div
              className="
                moon-metric
                one
              "
            >

              <strong>
                {activeLeads}
              </strong>

              <span>
                Active Leads
              </span>

            </div>


            {/* =================================
                CONVERSION
            ================================= */}

            <div
              className="
                moon-metric
                two
              "
            >

              <strong>
                {conversionRate}%
              </strong>

              <span>
                Conversion Rate
              </span>

            </div>


            {/* =================================
                NEW LEADS
            ================================= */}

            <div
              className="
                moon-metric
                three
              "
            >

              <strong>
                {newLeads}
              </strong>

              <span>
                New Leads
              </span>

            </div>

          </div>

        </section>


        {/* =====================================
            LEAD OVERVIEW
        ===================================== */}

        <div className="section-title">

          <h2>
            Lead Overview
          </h2>

          <p>
            Live overview of your sales pipeline.
          </p>

        </div>


        <div className="lead-overview-grid">

          <OverviewCard
            icon="◎"
            value={totalLeads}
            label="Total Leads"
            color="#6255ee"
            bg="#eef0ff"
          />


          <OverviewCard
            icon="✦"
            value={newLeads}
            label="New Leads"
            color="#159bd3"
            bg="#e5f7fc"
          />


          <OverviewCard
            icon="✓"
            value={qualifiedLeads}
            label="Qualified Leads"
            color="#0ca879"
            bg="#e2faf1"
          />


          <OverviewCard
            icon="↗"
            value={`${conversionRate}%`}
            label="Conversion Rate"
            color="#9251ed"
            bg="#f2eaff"
          />

        </div>


        {/* =====================================
            FILTERS
        ===================================== */}

        <div className="lead-controls">

          <input
            className="lead-search"
            placeholder="Search leads..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />


          <select
            className="lead-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Statuses
            </option>

            {statuses.map(
              (status) => (

                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>

              )
            )}

          </select>


          <select
            className="lead-filter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Priorities
            </option>

            {priorities.map(
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


          <span className="results-text">

            {filteredLeads.length}
            {" "}
            results

          </span>

        </div>


        {/* =====================================
            LEADS TABLE
        ===================================== */}

        <div
          ref={leadsTableRef}
          className="lead-table-wrapper"
        >

          {loading ? (

            <div className="empty-state">

              <div className="empty-moon"></div>

              <h3>
                Loading Leads
              </h3>

              <p>
                Getting your CRM data...
              </p>

            </div>

          ) : filteredLeads.length === 0 ? (

            <div className="empty-state">

              <div className="empty-moon"></div>

              <h3>
                No Leads Found
              </h3>

              <p>
                Add a lead or change your filters.
              </p>

            </div>

          ) : (

            <table className="lead-table">

              <thead>

                <tr>

                  <th>
                    Lead
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Source
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Follow-Up
                  </th>

                  <th>
                    Assigned
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredLeads.map(
                  (lead) => (

                    <tr
                      key={lead.id}
                    >

                      <td>

                        <div
                          className="
                            lead-name
                          "
                        >
                          {lead.name}
                        </div>

                        <div
                          className="
                            lead-company
                          "
                        >
                          {lead.company ||
                            "Individual"}
                        </div>

                      </td>


                      <td>

                        {lead.email ||
                          "No email"}

                        <br />

                        {lead.phone ||
                          "No phone"}

                      </td>


                      <td>

                        {lead.source ||
                          "Direct"}

                      </td>


                      <td>

                        <span
                          className={`
                            badge
                            status-${String(
                              lead.status ||
                                "NEW"
                            ).toLowerCase()}
                          `}
                        >
                          {lead.status ||
                            "NEW"}
                        </span>

                      </td>


                      <td>

                        <span
                          className={`
                            badge
                            priority-${String(
                              lead.priority ||
                                "MEDIUM"
                            ).toLowerCase()}
                          `}
                        >
                          {lead.priority ||
                            "MEDIUM"}
                        </span>

                      </td>


                      <td>

                        {formatDate(
                          lead.followUpDate
                        )}

                      </td>


                      <td>

                        {userName(
                          lead.assignedUserId
                        )}

                      </td>


                      <td>

                        <div
                          className="
                            table-actions
                          "
                        >

                          <button
                            className="
                              table-action
                            "
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              openDetailsModal(lead);
                            }}
                          >
                            View
                          </button>


                          <button
                            className="
                              table-action
                            "
                            onClick={() =>
                              openEditModal(
                                lead
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            className="
                              table-action
                            "
                            onClick={() =>
                              convertLead(
                                lead
                              )
                            }
                          >
                            Convert
                          </button>


                          {(currentUser?.role === "ADMIN" ||
                            currentUser?.role === "MANAGER") && (
                            <button
                              className="
                                table-action
                                delete
                              "
                              onClick={() =>
                                deleteLead(
                                  lead.id
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

          )}

        </div>


        {/* =====================================
            ADD / EDIT MODAL
        ===================================== */}

        {showModal && (

          <div
            className="modal-overlay"
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }

            }}
          >

            <div className="modal">

              <div className="modal-header">

                <div>

                  <h2>

                    {editingId
                      ? "Edit Lead"
                      : "Add New Lead"}

                  </h2>

                  <p>
                    Enter the lead information
                    below.
                  </p>

                </div>


                <button
                  className="modal-close"
                  onClick={closeModal}
                >
                  ×
                </button>

              </div>


              <form
                className="modal-form"
                onSubmit={handleSubmit}
              >

                {error && (

                  <div className="form-error">

                    {error}

                  </div>

                )}


                <div className="form-grid">

                  <Field
                    label="Lead Name *"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Lead name"
                  />


                  <Field
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />


                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />


                  <Field
                    label="Company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company / Institution"
                  />


                  <Field
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Location"
                  />


                  <Field
                    label="Source"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    placeholder="Website / Referral / Social"
                  />


                  <div className="form-field">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >

                      {statuses.map(
                        (status) => (

                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="form-field">

                    <label>
                      Priority
                    </label>

                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                    >

                      {priorities.map(
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


                  <div className="form-field">

                    <label>
                      Follow-Up Date
                    </label>

                    <input
                      type="date"
                      name="followUpDate"
                      value={
                        form.followUpDate
                      }
                      onChange={handleChange}
                    />

                  </div>


                  <div className="form-field">

                    <label>
                      Assigned Employee
                    </label>

                    {currentUser?.role === "SALES" ||
                    currentUser?.role === "EMPLOYEE" ? (

                      <input
                        type="text"
                        value={
                          currentUser?.name ||
                          currentUser?.email ||
                          ""
                        }
                        readOnly
                      />

                    ) : (

                      <select
                        name="assignedUserId"
                        value={
                          form.assignedUserId
                        }
                        onChange={handleChange}
                      >

                        <option value="">
                          Not Assigned
                        </option>

                        {users
                          .filter((user) => {
                            if (user.active === false) {
                              return false;
                            }

                            if (
                              currentUser?.role ===
                              "MANAGER"
                            ) {
                              return (
                                user.role === "SALES" ||
                                user.role === "EMPLOYEE"
                              );
                            }

                            return true;
                          })
                          .map((user) => (

                            <option
                              key={user.id}
                              value={user.id}
                            >
                              {user.name}
                            </option>

                          ))}

                      </select>

                    )}

                  </div>


                  <div
                    className="
                      form-field
                      full
                    "
                  >

                    <label>
                      Requirement
                    </label>

                    <textarea
                      name="requirement"
                      value={
                        form.requirement
                      }
                      onChange={handleChange}
                      placeholder="
                        Customer requirement...
                      "
                    />

                  </div>


                  <div
                    className="
                      form-field
                      full
                    "
                  >

                    <label>
                      Notes
                    </label>

                    <textarea
                      name="notes"
                      value={
                        form.notes
                      }
                      onChange={handleChange}
                      placeholder="
                        Additional notes...
                      "
                    />

                  </div>

                </div>


                <div className="modal-footer">

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="save-button"
                    disabled={saving}
                  >

                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Lead"
                      : "Create Lead"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}


        {/* =====================================
            DETAILS MODAL
        ===================================== */}

        {showDetails &&
          selectedLead && (

            <div
              className="modal-overlay"
              onMouseDown={(event) => {

                if (
                  event.target ===
                  event.currentTarget
                ) {
                  setShowDetails(false);
                }

              }}
            >

              <div className="modal">

                <div className="modal-header">

                  <div>

                    <h2>
                      Lead Details
                    </h2>

                    <p>
                      Complete lead information.
                    </p>

                  </div>


                  <button
                    className="modal-close"
                    onClick={closeDetailsModal}
                  >
                    ×
                  </button>

                </div>


                <div className="lead-details">

                  <div className="lead-profile">

                    <div className="lead-avatar">

                      {String(
                        selectedLead.name ||
                          "L"
                      )
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    <div>

                      <h3>
                        {selectedLead.name}
                      </h3>

                      <p>
                        {selectedLead.company ||
                          "Individual Lead"}
                      </p>

                    </div>

                  </div>


                  <div className="details-grid">

                    <Detail
                      label="Phone"
                      value={
                        selectedLead.phone ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Email"
                      value={
                        selectedLead.email ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Company"
                      value={
                        selectedLead.company ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Location"
                      value={
                        selectedLead.location ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Source"
                      value={
                        selectedLead.source ||
                        "Direct"
                      }
                    />

                    <Detail
                      label="Assigned"
                      value={userName(
                        selectedLead.assignedUserId
                      )}
                    />

                    <Detail
                      label="Status"
                      value={
                        selectedLead.status ||
                        "NEW"
                      }
                    />

                    <Detail
                      label="Priority"
                      value={
                        selectedLead.priority ||
                        "MEDIUM"
                      }
                    />

                    <Detail
                      label="Follow-Up"
                      value={formatDate(
                        selectedLead.followUpDate
                      )}
                    />

                    <Detail
                      label="Lead ID"
                      value={`#${selectedLead.id}`}
                    />

                    <Detail
                      label="Requirement"
                      value={
                        selectedLead.requirement ||
                        "No requirement"
                      }
                      full
                    />

                    <Detail
                      label="Notes"
                      value={
                        selectedLead.notes ||
                        "No notes"
                      }
                      full
                    />

                  </div>


                  <div className="modal-footer">

                    <button
                      className="cancel-button"
                      onClick={closeDetailsModal}
                    >
                      Close
                    </button>


                    <button
                      type="button"
                      className="save-button"
                      onClick={() => {

                        setShowDetails(
                          false
                        );

                        openEditModal(
                          selectedLead
                        );

                      }}
                    >
                      Edit Lead
                    </button>

                  </div>

                </div>

              </div>

            </div>

          )}

      </div>
    </>
  );
}


/* =========================================
   OVERVIEW CARD
========================================= */

function OverviewCard({
  icon,
  value,
  label,
  color,
  bg,
}) {
  return (
    <div className="overview-card">

      <div
        className="overview-icon"
        style={{
          color,
          background: bg,
        }}
      >
        {icon}
      </div>

      <div className="overview-value">
        {value}
      </div>

      <div className="overview-label">
        {label}
      </div>

    </div>
  );
}


/* =========================================
   FORM FIELD
========================================= */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div className="form-field">

      <label>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

    </div>
  );
}


/* =========================================
   DETAIL
========================================= */

function Detail({
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`detail-box ${
        full ? "full" : ""
      }`}
    >

      <div className="detail-label">
        {label}
      </div>

      <div className="detail-value">
        {value}
      </div>

    </div>
  );
}


export default Leads;