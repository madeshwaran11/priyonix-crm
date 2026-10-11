import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

const emptyForm = {
  leadId: "",
  customerId: "",
  followUpDate: "",
  followUpTime: "",
  type: "CALL",
  status: "PENDING",
  outcome: "",
  nextFollowUp: "",
  assignedUserId: "",
  notes: "",
};

const types = [
  "CALL",
  "EMAIL",
  "MEETING",
];

const statuses = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
];

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [showDetails, setShowDetails] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [selectedFollowUp, setSelectedFollowUp] =
    useState(null);

  const followUpsTableRef = useRef(null);

  const [form, setForm] =
    useState(emptyForm);

  const [error, setError] = useState("");

  /* =========================================
     LOAD
  ========================================= */

  useEffect(() => {
    loadAll();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [meResponse, usersResponse] =
        await Promise.all([
          api.get("/users/me"),
          api.get("/users/active"),
        ]);

      setCurrentUser(meResponse.data);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error("Unable to load users:", error);
      setUsers([]);
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        followUpResponse,
        leadResponse,
        customerResponse,
      ] = await Promise.all([
        api.get("/follow-ups"),
        api.get("/leads"),
        api.get("/customers"),
      ]);

      setFollowUps(
        followUpResponse.data || []
      );

      setLeads(
        leadResponse.data || []
      );

      setCustomers(
        customerResponse.data || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load follow-ups."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     NAME HELPERS
  ========================================= */

  const getLeadName = (id, name) => {
    if (name) return name;
    if (!id) return "—";

    const lead = leads.find(
      (item) =>
        Number(item.id) === Number(id)
    );

    return (
      lead?.name ||
      `Lead #${id}`
    );
  };

  const getCustomerName = (id, name) => {
    if (name) return name;
    if (!id) return "—";

    const customer = customers.find(
      (item) =>
        Number(item.id) === Number(id)
    );

    return (
      customer?.name ||
      `Customer #${id}`
    );
  };

  /* =========================================
     COUNTS
  ========================================= */

  const totalFollowUps =
    followUps.length;

  const pendingFollowUps =
    followUps.filter(
      (item) =>
        String(item.status || "")
          .toUpperCase() === "PENDING"
    ).length;

  const completedFollowUps =
    followUps.filter(
      (item) =>
        String(item.status || "")
          .toUpperCase() === "COMPLETED"
    ).length;

  const cancelledFollowUps =
    followUps.filter(
      (item) =>
        String(item.status || "")
          .toUpperCase() === "CANCELLED"
    ).length;

  const callFollowUps =
    followUps.filter(
      (item) =>
        String(item.type || "")
          .toUpperCase() === "CALL"
    ).length;

  const meetingFollowUps =
    followUps.filter(
      (item) =>
        String(item.type || "")
          .toUpperCase() === "MEETING"
    ).length;

  const today = new Date();

  const todayString =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

  const todayFollowUps =
    followUps.filter(
      (item) =>
        item.followUpDate === todayString
    ).length;

  /* =========================================
     FILTER
  ========================================= */

  const filteredFollowUps = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return followUps.filter(
      (followUp) => {
        const leadName =
          getLeadName(
            followUp.leadId,
            followUp.leadName
          ).toLowerCase();

        const customerName =
          getCustomerName(
            followUp.customerId,
            followUp.customerName
          ).toLowerCase();

        const matchesSearch =
          !value ||
          leadName.includes(value) ||
          customerName.includes(value) ||
          String(
            followUp.type || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            followUp.status || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            followUp.notes || ""
          )
            .toLowerCase()
            .includes(value);

        const matchesStatus =
          statusFilter === "ALL" ||
          String(
            followUp.status || ""
          ).toUpperCase() ===
            statusFilter;

        const matchesType =
          typeFilter === "ALL" ||
          String(
            followUp.type || ""
          ).toUpperCase() ===
            typeFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType
        );
      }
    );
  }, [
    followUps,
    leads,
    customers,
    search,
    statusFilter,
    typeFilter,
  ]);

  /* =========================================
     VIEW ALL FOLLOW-UPS
  ========================================= */

  const viewAllFollowUps = () => {
    // Clear every active filter so the complete list is shown.
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");

    // Move the user to the complete follow-up list.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        followUpsTableRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };


  /* =========================================
     MODALS
  ========================================= */

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      assignedUserId:
        currentUser?.role?.toUpperCase() === "SALES"
          ? String(currentUser.id)
          : "",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (
    followUp
  ) => {
    setEditingId(followUp.id);
    setSelectedFollowUp(followUp);

    setForm({
      leadId:
        followUp.leadId || "",
      customerId:
        followUp.customerId || "",
      followUpDate:
        followUp.followUpDate || "",
      followUpTime:
        followUp.followUpTime || "",
      type:
        followUp.type || "CALL",
      status:
        followUp.status || "PENDING",
      outcome:
        followUp.outcome || "",
      nextFollowUp:
        followUp.nextFollowUp || "",
      assignedUserId:
        followUp.assignedUserId || "",
      notes:
        followUp.notes || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const openDetails = (
    followUp
  ) => {
    setSelectedFollowUp(
      followUp
    );

    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedFollowUp(null);
    setShowDetails(false);
  };

  /* =========================================
     FORM
  ========================================= */

  const handleChange = (
    event
  ) => {
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
     SAVE
  ========================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!form.followUpDate) {
      setError(
        "Follow-up date is required."
      );

      return;
    }

    if (
      !form.leadId &&
      !form.customerId
    ) {
      setError(
        "Select a lead or customer."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        leadId: form.leadId
          ? Number(form.leadId)
          : null,

        customerId: form.customerId
          ? Number(form.customerId)
          : null,

        followUpDate:
          form.followUpDate,

        followUpTime:
          form.followUpTime || null,

        type: form.type,

        status: form.status,

        outcome: form.outcome,

        nextFollowUp:
          form.nextFollowUp || null,

        assignedUserId:
          currentUser?.role?.toUpperCase() === "SALES"
            ? Number(currentUser.id)
            : form.assignedUserId
            ? Number(form.assignedUserId)
            : null,

        notes: form.notes,
      };

      if (editingId) {
        await api.put(
          `/follow-ups/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/follow-ups",
          payload
        );
      }

      await loadAll();

      closeModal();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to save follow-up."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE
  ========================================= */

  const deleteFollowUp = async (
    id
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this follow-up?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/follow-ups/${id}`
      );

      setFollowUps((old) =>
        old.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete follow-up."
      );
    }
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

  const formatTime = (time) => {
    if (!time) return "Not set";

    const parts = String(time).split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1] || 0);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return time;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================
     BADGES
  ========================================= */

  const statusClass = (
    status
  ) => {
    return (
      `status-${String(
        status || "PENDING"
      ).toLowerCase()}`
    );
  };

  const typeClass = (type) => {
    return (
      `type-${String(
        type || "CALL"
      ).toLowerCase()}`
    );
  };

  return (
    <>
      <style>{`

        /* =====================================
           PAGE
        ===================================== */

        .followups-page {
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

        .followups-page-header {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          padding:
            28px 0 22px;
        }

        .followups-page-header h1 {
          margin: 0;

          color: #10182f;

          font-size: 30px;

          font-weight: 900;

          letter-spacing: -0.8px;
        }

        .followups-page-header p {
          margin:
            7px 0 0;

          color: #71809a;

          font-size: 14px;
        }


        /* =====================================
           HERO
           EXACT LEADS SPACE PALETTE
        ===================================== */

        .followups-hero {
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

        .followup-stars {
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
           SAME LEADS SIZING
        ===================================== */

        .followup-hero-content {
          position: relative;

          z-index: 20;

          width: 48%;

          padding:
            50px 0 45px 52px;
        }

        .followup-status {
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

        .followup-status-dot {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #22d3ee;

          box-shadow:
            0 0 12px
            rgba(34,211,238,.85);
        }

        .followup-hero-content h2 {
          margin:
            25px 0 0;

          color: white;

          font-size: 49px;

          line-height: 1.04;

          letter-spacing: -2.4px;

          font-weight: 900;
        }

        .followup-hero-content h2 span {
          color: #a99aff;
        }

        .followup-description {
          max-width: 490px;

          margin:
            20px 0 0;

          color: #aab5d2;

          font-size: 15px;

          line-height: 1.7;

          font-weight: 600;
        }

        .followup-actions {
          display: flex;

          gap: 12px;

          margin-top: 25px;
        }

        .followup-primary {
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

        .followup-primary:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 16px 30px
            rgba(103,80,235,.38);
        }

        .followup-secondary {
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

        .followup-mini-stats {
          display: flex;

          gap: 30px;

          margin-top: 32px;
        }

        .followup-mini-stat strong {
          display: block;

          color: white;

          font-size: 24px;

          font-weight: 900;
        }

        .followup-mini-stat span {
          display: block;

          margin-top: 4px;

          color: #8995b8;

          font-size: 11px;

          font-weight: 700;
        }


        /* =====================================
           CLOCK AREA
        ===================================== */

        .clock-area {
          position: absolute;

          right: 2%;

          top: 0;

          width: 53%;

          height: 100%;

          perspective: 1000px;
        }


        /* =====================================
           CLOCK GLOW
        ===================================== */

        .clock-glow {
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
            clockGlow
            4s
            ease-in-out
            infinite;
        }

        @keyframes clockGlow {

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
           SAME SCALE AS LEADS MOON
        ===================================== */

        .clock-orbit-one {
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
            clockOrbitOne
            14s
            linear
            infinite;
        }

        @keyframes clockOrbitOne {

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

        .clock-orbit-two {
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
            clockOrbitTwo
            18s
            linear
            infinite reverse;
        }

        @keyframes clockOrbitTwo {

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
           THIRD ORBIT
        ===================================== */

        .clock-orbit-three {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 300px;
          height: 300px;

          transform:
            translate(-50%, -50%)
            rotateX(65deg)
            rotate(20deg);

          border:
            1px solid
            rgba(108,124,255,.14);

          border-radius: 50%;

          animation:
            clockOrbitThree
            20s
            linear
            infinite;
        }

        @keyframes clockOrbitThree {

          from {
            transform:
              translate(-50%, -50%)
              rotateX(65deg)
              rotate(20deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotateX(65deg)
              rotate(380deg);
          }
        }


        /* =====================================
           3D CLOCK
        ===================================== */

        .space-clock {
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
              #eef2ff 13%,
              #bccaff 30%,
              #7889d6 54%,
              #47549b 75%,
              #202a5c 100%
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
            clockFloat
            5s
            ease-in-out
            infinite;
        }

        @keyframes clockFloat {

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
           CLOCK OUTER RING
        ===================================== */

        .space-clock::before {
          content: "";

          position: absolute;

          inset: 10px;

          border-radius: 50%;

          border:
            2px solid
            rgba(255,255,255,.72);

          box-shadow:

            inset 8px 5px 15px
            rgba(255,255,255,.45),

            inset -14px -10px 25px
            rgba(45,54,68,.30);
        }

        .space-clock::after {
          content: "";

          position: absolute;

          inset: 17px;

          border-radius: 50%;

          border:
            2px solid
            rgba(90,115,220,.72);

          box-shadow:
            0 0 18px
            rgba(104,120,255,.45);
        }


        /* =====================================
           CLOCK FACE
        ===================================== */

        .clock-face {
          position: absolute;

          inset: 29px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle at 30% 25%,
              #334a91 0%,
              #172653 45%,
              #0b1330 100%
            );

          box-shadow:

            inset 0 0 25px
            rgba(0,0,0,.62),

            0 0 15px
            rgba(82,111,255,.22);
        }


        /* =====================================
           CLOCK TICKS
        ===================================== */

        .clock-tick {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 2px;
          height: 7px;

          margin-left: -1px;

          background:
            rgba(255,255,255,.68);

          transform-origin:
            1px 82px;
        }

        .tick-1 {
          transform:
            rotate(0deg)
            translateY(-78px);
        }

        .tick-2 {
          transform:
            rotate(30deg)
            translateY(-78px);
        }

        .tick-3 {
          transform:
            rotate(60deg)
            translateY(-78px);
        }

        .tick-4 {
          transform:
            rotate(90deg)
            translateY(-78px);
        }

        .tick-5 {
          transform:
            rotate(120deg)
            translateY(-78px);
        }

        .tick-6 {
          transform:
            rotate(150deg)
            translateY(-78px);
        }

        .tick-7 {
          transform:
            rotate(180deg)
            translateY(-78px);
        }

        .tick-8 {
          transform:
            rotate(210deg)
            translateY(-78px);
        }

        .tick-9 {
          transform:
            rotate(240deg)
            translateY(-78px);
        }

        .tick-10 {
          transform:
            rotate(270deg)
            translateY(-78px);
        }

        .tick-11 {
          transform:
            rotate(300deg)
            translateY(-78px);
        }

        .tick-12 {
          transform:
            rotate(330deg)
            translateY(-78px);
        }


        /* =====================================
           CLOCK HANDS
        ===================================== */

        .clock-hand {
          position: absolute;

          left: 50%;

          bottom: 50%;

          transform-origin:
            bottom center;

          border-radius: 10px;
        }

        .clock-hour {
          width: 4px;
          height: 49px;

          background: white;

          transform:
            translateX(-50%)
            rotate(40deg);

          box-shadow:
            0 0 8px
            rgba(255,255,255,.6);
        }

        .clock-minute {
          width: 3px;
          height: 68px;

          background: #92b4ff;

          transform:
            translateX(-50%)
            rotate(125deg);

          box-shadow:
            0 0 10px
            rgba(146,180,255,.75);
        }

        .clock-second {
          width: 2px;
          height: 76px;

          background: #65f2d0;

          transform:
            translateX(-50%)
            rotate(220deg);

          box-shadow:
            0 0 10px
            rgba(101,242,208,.85);

          animation:
            secondHand
            8s
            linear
            infinite;
        }

        @keyframes secondHand {

          from {
            transform:
              translateX(-50%)
              rotate(0deg);
          }

          to {
            transform:
              translateX(-50%)
              rotate(360deg);
          }
        }

        .clock-center {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 13px;
          height: 13px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background: white;

          box-shadow:
            0 0 13px
            rgba(255,255,255,.95);

          z-index: 10;
        }


        /* =====================================
           SATELLITES
           SAME LEADS STYLE
        ===================================== */

        .followup-satellite {
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

        .followup-satellite::before {
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

        .followup-satellite::after {
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

        .followup-satellite.one {
          right: 9%;
          top: 17%;

          animation:
            satelliteOne
            6s
            ease-in-out
            infinite;
        }

        .followup-satellite.two {
          left: 11%;
          bottom: 13%;

          animation:
            satelliteTwo
            7s
            ease-in-out
            infinite;
        }

        @keyframes satelliteOne {

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

        @keyframes satelliteTwo {

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
           SAME LEADS SIZE
        ===================================== */

        .followup-metric {
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

        .followup-metric.one {
          left: 4%;
          top: 12%;
        }

        .followup-metric.two {
          right: 0;
          top: 55%;

          animation-delay:
            -1.7s;
        }

        .followup-metric.three {
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

        .followup-metric strong {
          display: block;

          color: white;

          font-size: 22px;

          font-weight: 900;
        }

        .followup-metric span {
          display: block;

          margin-top: 3px;

          color: #8e9abb;

          font-size: 10px;

          font-weight: 800;
        }


        /* =====================================
           SECTION
        ===================================== */

        .followups-section-title {
          margin-top: 38px;

          margin-bottom: 17px;
        }

        .followups-section-title h2 {
          margin: 0;

          color: #13203b;

          font-size: 27px;

          font-weight: 900;

          letter-spacing: -.7px;
        }

        .followups-section-title p {
          margin:
            5px 0 0;

          color: #75839c;

          font-size: 13px;
        }


        /* =====================================
           OVERVIEW
        ===================================== */

        .followup-overview-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0,1fr)
            );

          gap: 17px;
        }

        .followup-overview-card {
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

        .followup-overview-card::after {
          content: "";

          position: absolute;

          width: 95px;
          height: 95px;

          right: -30px;
          top: -30px;

          border-radius: 50%;

          background:
            #edf0ff;
        }

        .followup-overview-icon {
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

        .followup-overview-value {
          position: relative;

          z-index: 2;

          margin-top: 15px;

          color: #101a33;

          font-size: 29px;

          font-weight: 900;
        }

        .followup-overview-label {
          position: relative;

          z-index: 2;

          margin-top: 3px;

          color: #71809a;

          font-size: 12px;

          font-weight: 700;
        }


        /* =====================================
           CONTROLS
        ===================================== */

        .followup-controls {
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

        .followup-search {
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

        .followup-filter {
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

        .followup-search:focus,
        .followup-filter:focus {
          border-color: #7965ee;

          box-shadow:
            0 0 0 3px
            rgba(121,101,238,.08);
        }

        .results-text {
          color: #8290a7;

          font-size: 11px;

          font-weight: 800;
        }


        /* =====================================
           TABLE
        ===================================== */

        .followup-table-wrapper {
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

        .followup-table {
          width: 100%;

          min-width: 950px;

          border-collapse: collapse;
        }

        .followup-table th {
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

        .followup-table td {
          padding:
            16px 15px;

          border-bottom:
            1px solid
            #edf0f5;

          color: #647189;

          font-size: 11px;
        }

        .followup-table tbody tr:hover {
          background: #fbfcff;
        }

        .contact-name {
          color: #17213a;

          font-size: 13px;

          font-weight: 900;
        }

        .contact-type {
          margin-top: 4px;

          color: #9aa5b7;

          font-size: 10px;
        }

        .followup-notes {
          max-width: 230px;

          color: #8a96aa;

          font-size: 10px;

          line-height: 1.5;
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

        .status-pending {
          color: #ad7610;

          background: #fff6db;
        }

        .status-completed {
          color: #078363;

          background: #e1f9ef;
        }

        .status-cancelled {
          color: #c24454;

          background: #ffe9ed;
        }

        .type-call {
          color: #4356d9;

          background: #eef0ff;
        }

        .type-email {
          color: #7c45c7;

          background: #f3eaff;
        }

        .type-meeting {
          color: #087ea4;

          background: #e7f8fc;
        }


        /* =====================================
           ACTIONS
        ===================================== */

        .table-actions {
          display: flex;

          gap: 5px;

          flex-wrap: wrap;
        }

        .table-action {
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
           EMPTY
        ===================================== */

        .empty-state {
          padding:
            70px 20px;

          text-align: center;
        }

        .empty-clock {
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

        .followup-error {
          margin-top: 15px;

          padding:
            10px 12px;

          border-radius: 8px;

          color: #c24454;

          background: #fff0f2;

          font-size: 11px;

          font-weight: 700;
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

        .followup-details {
          padding: 23px;
        }

        .followup-profile {
          display: flex;

          align-items: center;

          gap: 13px;

          padding: 15px;

          margin-bottom: 17px;

          border-radius: 13px;

          background: #f7f8fc;
        }

        .followup-avatar {
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

        .followup-profile h3 {
          margin: 0;

          color: #17213a;

          font-size: 17px;
        }

        .followup-profile p {
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
           SAME AS LEADS
        ===================================== */

        @media(max-width:1100px) {

          .followup-hero-content {
            width: 53%;
          }

          .clock-area {
            width: 52%;
          }

          .space-clock {
            width: 185px;
            height: 185px;
          }

          .clock-orbit-one {
            width: 350px;
          }

          .clock-orbit-two {
            width: 290px;
          }

          .clock-orbit-three {
            width: 260px;
            height: 260px;
          }

          .followup-overview-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }


        @media(max-width:800px) {

          .followups-hero {
            min-height: 680px;
          }

          .followup-hero-content {
            width: 100%;

            padding:
              40px 30px 0;
          }

          .followup-hero-content h2 {
            font-size: 40px;
          }

          .clock-area {
            top: 320px;

            left: 0;
            right: 0;

            width: 100%;

            height: 350px;
          }
        }


        @media(max-width:600px) {

          .followups-page-header {
            padding-top: 18px;
          }

          .followups-page-header h1 {
            font-size: 26px;
          }

          .followups-hero {
            min-height: 640px;

            border-radius: 22px;
          }

          .followup-hero-content {
            padding:
              28px 22px 0;
          }

          .followup-hero-content h2 {
            font-size: 34px;
          }

          .followup-description {
            font-size: 13px;
          }

          .followup-mini-stats {
            gap: 18px;
          }

          .clock-area {
            top: 310px;

            height: 310px;

            transform:
              scale(.82);

            transform-origin:
              top center;
          }

          .followup-overview-grid {
            grid-template-columns: 1fr;
          }

          .followup-controls {
            align-items: stretch;

            flex-direction: column;
          }

          .followup-search,
          .followup-filter {
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



        /* ===== PRIYONIX DARK SPACE THEME: FOLLOW-UPS ===== */
        .followups-page {
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

        .followups-page-header {
          min-width: 0;
          gap: 18px;
          padding: 8px 2px 24px !important;
          margin: 0;
        }

        .followups-page-header h1 { color: #f4f7ff !important; }
        .followups-page-header p { color: #a9bbda !important; }
        .followups-section-title { margin-top: 0 !important; margin-bottom: 17px; }
        .followups-section-title h2 { color: #f4f7ff !important; }
        .followups-section-title p { color: #a9bbda !important; }

        .followups-hero {
          width: 100%;
          max-width: 100%;
          margin: 0 0 34px;
          border: 1px solid rgba(124, 157, 255, 0.12);
        }

        .followup-overview-grid,
        .followup-controls,
        .followup-table-wrapper {
          width: 100%;
          min-width: 0;
        }

        .followup-overview-card {
          background: rgba(13, 27, 56, 0.96) !important;
          border-color: rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16) !important;
        }
        .followup-overview-card::after { background: rgba(99, 102, 241, 0.12) !important; }
        .followup-overview-value { color: #f4f7ff !important; }
        .followup-overview-label { color: #a9bbda !important; }

        .followup-controls {
          margin-top: 26px;
          background: rgba(13, 27, 56, 0.96) !important;
          border-color: rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14) !important;
        }
        .followup-search,
        .followup-filter {
          color: #f4f7ff !important;
          background: #0a1730 !important;
          border-color: #30466f !important;
        }
        .followup-search::placeholder { color: #8094b8 !important; opacity: 1; }
        .followup-filter option { color: #f4f7ff; background: #0d1b38; }
        .followup-search:focus,
        .followup-filter:focus {
          border-color: #8b7cff !important;
          box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
        }
        .followups-page .results-text { color: #a9bbda !important; }

        .followup-table-wrapper {
          margin-bottom: 6px;
          background: rgba(13, 27, 56, 0.96) !important;
          border-color: rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16) !important;
        }
        .followup-table th {
          color: #a9bbda !important;
          background: #101f3b !important;
          border-bottom-color: #263d68 !important;
        }
        .followup-table td {
          color: #c4d0e7 !important;
          border-bottom-color: rgba(124, 157, 255, 0.14) !important;
        }
        .followup-table tbody tr { background: transparent !important; }
        .followup-table tbody tr:hover { background: rgba(92, 105, 190, 0.12) !important; }
        .contact-name { color: #f4f7ff !important; }
        .contact-type,
        .followup-notes { color: #9aadd0 !important; }

        .followups-page .table-action {
          color: #dbe7ff !important;
          background: #142544 !important;
          border-color: #30466f !important;
        }
        .followups-page .table-action:hover {
          color: #ffffff !important;
          background: #25396a !important;
          border-color: #8b7cff !important;
        }
        .followups-page .table-action.delete:hover {
          color: #ffdce2 !important;
          background: rgba(194, 68, 84, 0.18) !important;
          border-color: rgba(255, 133, 151, 0.55) !important;
        }
        .followups-page .empty-state h3 { color: #f4f7ff !important; }
        .followups-page .empty-state p { color: #a9bbda !important; }
        .followups-page .followup-error {
          color: #ffdce2 !important;
          background: rgba(194, 68, 84, 0.18) !important;
          border: 1px solid rgba(255, 133, 151, 0.28);
        }

        /* Follow-up add/edit and details modals */
        .followups-page .modal {
          color: #eaf0ff !important;
          background: #0d1b38 !important;
          border: 1px solid rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 35px 90px rgba(0, 0, 0, 0.45) !important;
        }
        .followups-page .modal-header {
          border-bottom-color: rgba(124, 157, 255, 0.18) !important;
          background: #0d1b38;
        }
        .followups-page .modal-header h2 { color: #f4f7ff !important; }
        .followups-page .modal-header p { color: #a9bbda !important; }
        .followups-page .modal-close {
          color: #dbe7ff !important;
          background: #1a2d4d !important;
        }
        .followups-page .form-field label { color: #b9c8e4 !important; }
        .followups-page .form-field input,
        .followups-page .form-field select,
        .followups-page .form-field textarea {
          color: #f4f7ff !important;
          background: #09172f !important;
          border-color: #30466f !important;
        }
        .followups-page .form-field input::placeholder,
        .followups-page .form-field textarea::placeholder {
          color: #8094b8 !important;
          opacity: 1;
        }
        .followups-page .form-field select option { color: #f4f7ff; background: #0d1b38; }
        .followups-page .form-field input:focus,
        .followups-page .form-field select:focus,
        .followups-page .form-field textarea:focus {
          border-color: #8b7cff !important;
          box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
        }
        .followups-page .modal-footer { border-top-color: rgba(124, 157, 255, 0.18) !important; }
        .followups-page .cancel-button {
          color: #dbe7ff !important;
          background: #142544 !important;
          border-color: #30466f !important;
        }
        .followups-page .cancel-button:hover { background: #20365a !important; }
        .followups-page .save-button { color: #ffffff !important; }
        .followups-page .followup-profile { background: #142544 !important; }
        .followups-page .followup-profile h3 { color: #f4f7ff !important; }
        .followups-page .followup-profile p { color: #a9bbda !important; }
        .followups-page .detail-box {
          background: #0a1730 !important;
          border-color: #30466f !important;
        }
        .followups-page .detail-label { color: #91a6ca !important; }
        .followups-page .detail-value { color: #e3ebfb !important; }

        /* Native date/time controls should remain readable in dark mode. */
        .followups-page input[type="date"],
        .followups-page input[type="time"] {
          color-scheme: dark !important;
          color: #f4f7ff !important;
          background: #09172f !important;
        }
        .followups-page input[type="date"]::-webkit-calendar-picker-indicator,
        .followups-page input[type="time"]::-webkit-calendar-picker-indicator {
          filter: brightness(0) invert(1) !important;
          -webkit-filter: brightness(0) invert(1) !important;
          opacity: 1 !important;
          cursor: pointer !important;
        }

        /* ===== RESPONSIVE MODALS: ACCOUNT FOR THE FIXED SIDEBAR AND HEADER ===== */
        .followups-page:has(.modal-overlay) { z-index: 2000 !important; }
        .followups-page .modal-overlay {
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
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .followups-page .modal-overlay::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .followups-page .modal {
          flex: 0 1 850px !important;
          width: min(850px, 100%) !important;
          min-width: 0 !important;
          max-height: calc(100dvh - 112px) !important;
          margin: 0 auto !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          overscroll-behavior: contain;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .followups-page .modal::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .followups-page .modal-header { position: sticky; top: 0; z-index: 5; }
        .followups-page .modal-form,
        .followups-page .form-grid,
        .followups-page .details-grid { min-width: 0; }
        .followups-page .form-field input,
        .followups-page .form-field select,
        .followups-page .form-field textarea { min-width: 0; max-width: 100%; }

        @media (max-width: 1050px) and (min-width: 801px) {
          .followups-page .modal-overlay {
            inset: 78px 0 0 245px !important;
            padding: 14px 14px 16px !important;
          }
          .followups-page .modal { max-height: calc(100dvh - 108px) !important; }
        }
        @media (max-width: 800px) {
          .followups-page {
            padding: 12px 12px 28px !important;
            border-radius: 16px;
          }
          .followups-page-header { padding: 8px 2px 20px !important; }
          .followups-page .modal-overlay {
            inset: 68px 0 0 0 !important;
            padding: 12px 12px 14px !important;
          }
          .followups-page .modal {
            width: 100% !important;
            max-height: calc(100dvh - 94px) !important;
            border-radius: 16px;
          }
          .followup-hero-content { width: 100%; }
          .followup-overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .followup-controls { align-items: stretch; flex-direction: column; }
          .followup-search, .followup-filter { width: 100%; }
        }
        @media (max-width: 600px) {
          .followups-page { padding: 10px 10px 24px !important; }
          .followups-page-header h1 { font-size: 26px; }
          .followups-hero { min-height: 640px; border-radius: 20px; }
          .followup-hero-content { padding: 28px 22px 0; }
          .followup-hero-content h2 { font-size: 34px; }
          .followup-description { font-size: 13px; }
          .followup-mini-stats { gap: 18px; }
          .clock-area { top: 310px; height: 310px; transform: scale(.82); transform-origin: top center; }
          .followup-overview-grid { grid-template-columns: minmax(0, 1fr); }
          .followups-page .form-grid,
          .followups-page .details-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .followups-page .form-field.full,
          .followups-page .detail-box.full { grid-column: auto !important; }
          .followups-page .modal-form,
          .followups-page .followup-details { padding: 16px !important; }
          .followups-page .modal-header { padding: 16px !important; }
          .followups-page .modal-footer { flex-wrap: wrap; }
        }

        /* ===== RESPONSIVE POLISH — all devices ===== */
        @media (max-width: 800px) {
          .followup-search,
          .followup-filter {
            flex: 0 0 auto;
            width: 100%;
            min-width: 0;
          }
        }

        @media (max-width: 600px) {
          .followup-actions {
            flex-wrap: wrap;
          }

          .followup-metric {
            display: none;
          }
        }

        @media (max-width: 400px) {
          .followup-primary,
          .followup-secondary {
            flex: 1 1 100%;
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .followups-page-header h1 {
            font-size: 23px;
          }

          .followup-hero-content h2 {
            font-size: 29px;
          }

          .followups-hero {
            min-height: 560px;
          }
        }

        @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
          .followups-hero {
            min-height: 360px !important;
          }

          .clock-area {
            display: none;
          }
        }

      `}</style>

      <div className="followups-page">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="followups-page-header">

          <div>

            <h1>
              Follow-Up Management
            </h1>

            <p>
              Schedule and track your customer
              and lead interactions.
            </p>

          </div>

        </div>


        {/* =====================================
            HERO
        ===================================== */}

        <section className="followups-hero">

          <div className="followup-stars"></div>


          {/* HERO CONTENT */}

          <div className="followup-hero-content">

            <div className="followup-status">

              <span
                className="followup-status-dot"
              />

              FOLLOW-UP SYSTEM ONLINE

            </div>


            <h2>

              Never miss a

              <br />

              <span>
                conversation.
              </span>

            </h2>


            <p className="followup-description">

              Keep every call, email and
              meeting organized with a clear
              follow-up schedule connected to
              your PriyoniX CRM workspace.

            </p>


            <div className="followup-actions">

              {currentUser?.role?.toUpperCase() !== "EMPLOYEE" && (
                <button
                  className="followup-primary"
                  onClick={openAddModal}
                >
                  Add New Follow-Up →
                </button>
              )}


              <button
                type="button"
                className="followup-secondary"
                onClick={viewAllFollowUps}
              >
                View All Follow-Ups
              </button>

            </div>


            <div className="followup-mini-stats">

              <div className="followup-mini-stat">

                <strong>
                  {totalFollowUps}
                </strong>

                <span>
                  Total Activities
                </span>

              </div>


              <div className="followup-mini-stat">

                <strong>
                  {pendingFollowUps}
                </strong>

                <span>
                  Pending
                </span>

              </div>


              <div className="followup-mini-stat">

                <strong>
                  {todayFollowUps}
                </strong>

                <span>
                  Today
                </span>

              </div>

            </div>

          </div>


          {/* ===================================
              SPACE CLOCK
          =================================== */}

          <div className="clock-area">

            <div className="clock-glow"></div>

            <div className="clock-orbit-one"></div>

            <div className="clock-orbit-two"></div>

            <div className="clock-orbit-three"></div>


            {/* SATELLITE ONE */}

            <div className="followup-satellite one">

              <span className="satellite-wing top" />

              <span className="satellite-wing bottom" />

              <span className="satellite-window" />

            </div>


            {/* SATELLITE TWO */}

            <div className="followup-satellite two">

              <span className="satellite-wing top" />

              <span className="satellite-wing bottom" />

              <span className="satellite-window" />

            </div>


            {/* METRIC ONE */}

            <div className="followup-metric one">

              <strong>
                {callFollowUps}
              </strong>

              <span>
                CALL FOLLOW-UPS
              </span>

            </div>


            {/* CLOCK */}

            <div className="space-clock">

              <div className="clock-face">

                <span className="clock-tick tick-1" />
                <span className="clock-tick tick-2" />
                <span className="clock-tick tick-3" />
                <span className="clock-tick tick-4" />
                <span className="clock-tick tick-5" />
                <span className="clock-tick tick-6" />
                <span className="clock-tick tick-7" />
                <span className="clock-tick tick-8" />
                <span className="clock-tick tick-9" />
                <span className="clock-tick tick-10" />
                <span className="clock-tick tick-11" />
                <span className="clock-tick tick-12" />


                <span
                  className="
                    clock-hand
                    clock-hour
                  "
                />

                <span
                  className="
                    clock-hand
                    clock-minute
                  "
                />

                <span
                  className="
                    clock-hand
                    clock-second
                  "
                />

                <span className="clock-center" />

              </div>

            </div>


            {/* METRIC TWO */}

            <div className="followup-metric two">

              <strong>
                {meetingFollowUps}
              </strong>

              <span>
                MEETINGS
              </span>

            </div>


            {/* METRIC THREE */}

            <div className="followup-metric three">

              <strong>
                {totalFollowUps}
              </strong>

              <span>
                TOTAL ACTIVITIES
              </span>

            </div>

          </div>

        </section>


        {/* =====================================
            OVERVIEW
        ===================================== */}

        <div className="followups-section-title">

          <h2>
            Follow-Up Overview
          </h2>

          <p>
            Live overview of your follow-up
            pipeline and activities.
          </p>

        </div>


        <div className="followup-overview-grid">

          <OverviewCard
            icon="◎"
            value={totalFollowUps}
            label="Total Follow-Ups"
            color="#6255ee"
            bg="#eef0ff"
          />

          <OverviewCard
            icon="◷"
            value={pendingFollowUps}
            label="Pending Follow-Ups"
            color="#ad7610"
            bg="#fff6db"
          />

          <OverviewCard
            icon="✓"
            value={completedFollowUps}
            label="Completed"
            color="#078363"
            bg="#e1f9ef"
          />

          <OverviewCard
            icon="×"
            value={cancelledFollowUps}
            label="Cancelled"
            color="#c24454"
            bg="#ffe9ed"
          />

        </div>


        {/* =====================================
            FILTERS
        ===================================== */}

        <div className="followup-controls">

          <input
            className="followup-search"
            placeholder="Search follow-ups..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />


          <select
            className="followup-filter"
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
            className="followup-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Types
            </option>

            {types.map(
              (type) => (

                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>

              )
            )}

          </select>


          <span className="results-text">

            {filteredFollowUps.length}
            {" "}
            results

          </span>

        </div>


        {error && (

          <div className="followup-error">
            {error}
          </div>

        )}


        {/* =====================================
            TABLE
        ===================================== */}

        <div
          ref={followUpsTableRef}
          className="followup-table-wrapper"
          style={{
            scrollMarginTop: "20px",
          }}
        >

          {loading ? (

            <div className="empty-state">

              <div className="empty-clock"></div>

              <h3>
                Loading Follow-Ups
              </h3>

              <p>
                Getting your CRM data...
              </p>

            </div>

          ) : filteredFollowUps.length === 0 ? (

            <div className="empty-state">

              <div className="empty-clock"></div>

              <h3>
                No Follow-Ups Found
              </h3>

              <p>
                Add a follow-up or change your
                filters.
              </p>

            </div>

          ) : (

            <table className="followup-table">

              <thead>

                <tr>

                  <th>
                    Contact
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Time
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Notes
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredFollowUps.map(
                  (followUp) => (

                    <tr
                      key={followUp.id}
                    >

                      <td>

                        <div className="contact-name">

                          {followUp.leadId
                            ? getLeadName(
                                followUp.leadId,
                                followUp.leadName
                              )
                            : followUp.customerId
                            ? getCustomerName(
                                followUp.customerId,
                                followUp.customerName
                              )
                            : "General"}

                        </div>

                        <div className="contact-type">

                          {followUp.leadId
                            ? "Lead"
                            : followUp.customerId
                            ? "Customer"
                            : "General"}

                        </div>

                      </td>


                      <td>

                        <span
                          className={`
                            badge
                            ${typeClass(
                              followUp.type
                            )}
                          `}
                        >

                          {followUp.type ||
                            "CALL"}

                        </span>

                      </td>


                      <td>

                        {formatDate(
                          followUp.followUpDate
                        )}

                      </td>


                      <td>

                        {formatTime(
                          followUp.followUpTime
                        )}

                      </td>


                      <td>

                        <span
                          className={`
                            badge
                            ${statusClass(
                              followUp.status
                            )}
                          `}
                        >

                          {followUp.status ||
                            "PENDING"}

                        </span>

                      </td>


                      <td>

                        <div className="followup-notes">

                          {followUp.notes ||
                            "No notes"}

                        </div>

                      </td>


                      <td>

                        <div className="table-actions">

                          <button
                            className="table-action"
                            onClick={() =>
                              openDetails(
                                followUp
                              )
                            }
                          >
                            View
                          </button>


                          <button
                            className="table-action"
                            onClick={() =>
                              openEditModal(
                                followUp
                              )
                            }
                          >
                            Edit
                          </button>


                          {(currentUser?.role?.toUpperCase() === "ADMIN" ||
                            currentUser?.role?.toUpperCase() === "MANAGER") && (
                            <button
                              className="
                                table-action
                                delete
                              "
                              onClick={() =>
                                deleteFollowUp(
                                  followUp.id
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
                      ? "Edit Follow-Up"
                      : "Add New Follow-Up"}

                  </h2>

                  <p>
                    Enter the follow-up information
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

                  <div className="followup-error">

                    {error}

                  </div>

                )}


                <div className="form-grid">

                  <div className="form-field">

                    <label>
                      Lead
                    </label>

                    {editingId &&
                    currentUser?.role?.toUpperCase() === "EMPLOYEE" ? (
                      <input
                        type="text"
                        value={
                          leads.find(
                            (lead) =>
                              String(lead.id) ===
                              String(form.leadId)
                          )?.name ||
                          selectedFollowUp?.leadName ||
                          "Assigned Lead"
                        }
                        readOnly
                      />
                    ) : (
                      <select
                        name="leadId"
                        value={form.leadId}
                        onChange={handleChange}
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
                    )}

                  </div>


                  <div className="form-field">

                    <label>
                      Customer
                    </label>

                    {editingId &&
                    currentUser?.role?.toUpperCase() === "EMPLOYEE" ? (
                      <input
                        type="text"
                        value={
                          customers.find(
                            (customer) =>
                              String(customer.id) ===
                              String(form.customerId)
                          )?.name ||
                          selectedFollowUp?.customerName ||
                          "Assigned Customer"
                        }
                        readOnly
                      />
                    ) : (
                      <select
                        name="customerId"
                        value={form.customerId}
                        onChange={handleChange}
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
                    )}

                  </div>


                  <div className="form-field">

                    <label>
                      Follow-Up Date *
                    </label>

                    <input
                      type="date"
                      name="followUpDate"
                      value={
                        form.followUpDate
                      }
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="form-field">

                    <label>
                      Follow-Up Time
                    </label>

                    <input
                      type="time"
                      name="followUpTime"
                      value={form.followUpTime}
                      onChange={handleChange}
                    />

                  </div>


                  <div className="form-field">

                    <label>
                      Type
                    </label>

                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                    >

                      {types.map(
                        (type) => (

                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>

                        )
                      )}

                    </select>

                  </div>


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
                      Outcome
                    </label>

                    <input
                      type="text"
                      name="outcome"
                      value={form.outcome}
                      onChange={handleChange}
                      placeholder="e.g. Interested, No response"
                      maxLength={100}
                    />

                  </div>


                  <div className="form-field">

                    <label>
                      Next Follow-Up
                    </label>

                    <input
                      type="date"
                      name="nextFollowUp"
                      value={form.nextFollowUp}
                      onChange={handleChange}
                    />

                  </div>


                  {(currentUser?.role?.toUpperCase() === "ADMIN" ||
                    currentUser?.role?.toUpperCase() === "MANAGER" ||
                    currentUser?.role?.toUpperCase() === "SALES") && (
                    <div className="form-field">

                      <label>
                        Assigned Employee
                      </label>

                      {currentUser?.role?.toUpperCase() === "SALES" ? (
                        <input
                          type="text"
                          value={
                            currentUser?.name ||
                            currentUser?.email ||
                            "Current User"
                          }
                          readOnly
                        />
                      ) : (
                        <select
                          name="assignedUserId"
                          value={form.assignedUserId}
                          onChange={handleChange}
                        >
                          <option value="">
                            Select Employee
                          </option>

                          {users
                            .filter((user) => {
                              const role =
                                String(user.role || "").toUpperCase();

                              return (
                                role === "SALES" ||
                                role === "EMPLOYEE"
                              );
                            })
                            .map((user) => (
                              <option
                                key={user.id}
                                value={user.id}
                              >
                                {user.name || user.email} - {user.role}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  )}


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
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Follow-up notes..."
                      maxLength={500}
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
                      ? "Update Follow-Up"
                      : "Create Follow-Up"}

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
          selectedFollowUp && (

            <div
              className="modal-overlay"
              onMouseDown={(event) => {

                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeDetails();
                }

              }}
            >

              <div className="modal">

                <div className="modal-header">

                  <div>

                    <h2>
                      Follow-Up Details
                    </h2>

                    <p>
                      Complete follow-up
                      information.
                    </p>

                  </div>


                  <button
                    className="modal-close"
                    onClick={closeDetails}
                  >
                    ×
                  </button>

                </div>


                <div className="followup-details">

                  <div className="followup-profile">

                    <div className="followup-avatar">

                      {String(
                        selectedFollowUp.leadId
                          ? getLeadName(
                              selectedFollowUp.leadId,
                              selectedFollowUp.leadName
                            )
                          : selectedFollowUp.customerId
                          ? getCustomerName(
                              selectedFollowUp.customerId,
                              selectedFollowUp.customerName
                            )
                          : "F"
                      )
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    <div>

                      <h3>

                        {selectedFollowUp.leadId
                          ? getLeadName(
                              selectedFollowUp.leadId,
                              selectedFollowUp.leadName
                            )
                          : selectedFollowUp.customerId
                          ? getCustomerName(
                              selectedFollowUp.customerId,
                              selectedFollowUp.customerName
                            )
                          : "General Follow-Up"}

                      </h3>

                      <p>

                        {selectedFollowUp.leadId
                          ? "Lead Follow-Up"
                          : selectedFollowUp.customerId
                          ? "Customer Follow-Up"
                          : "General Activity"}

                      </p>

                    </div>

                  </div>


                  <div className="details-grid">

                    <Detail
                      label="Type"
                      value={
                        selectedFollowUp.type ||
                        "CALL"
                      }
                    />

                    <Detail
                      label="Status"
                      value={
                        selectedFollowUp.status ||
                        "PENDING"
                      }
                    />

                    <Detail
                      label="Follow-Up Date"
                      value={formatDate(
                        selectedFollowUp.followUpDate
                      )}
                    />

                    <Detail
                      label="Follow-Up Time"
                      value={formatTime(
                        selectedFollowUp.followUpTime
                      )}
                    />

                    <Detail
                      label="Outcome"
                      value={
                        selectedFollowUp.outcome ||
                        "Not recorded"
                      }
                    />

                    <Detail
                      label="Next Follow-Up"
                      value={formatDate(
                        selectedFollowUp.nextFollowUp
                      )}
                    />

                    <Detail
                      label="Lead"
                      value={
                        selectedFollowUp.leadId
                          ? getLeadName(
                              selectedFollowUp.leadId,
                              selectedFollowUp.leadName
                            )
                          : "Not linked"
                      }
                    />

                    <Detail
                      label="Customer"
                      value={
                        selectedFollowUp.customerId
                          ? getCustomerName(
                              selectedFollowUp.customerId,
                              selectedFollowUp.customerName
                            )
                          : "Not linked"
                      }
                    />

                    <Detail
                      label="Follow-Up ID"
                      value={
                        `#${selectedFollowUp.id}`
                      }
                    />

                    <Detail
                      label="Notes"
                      value={
                        selectedFollowUp.notes ||
                        "No notes"
                      }
                      full
                    />

                  </div>


                  <div className="modal-footer">

                    <button
                      className="cancel-button"
                      onClick={
                        closeDetails
                      }
                    >
                      Close
                    </button>


                    <button
                      className="save-button"
                      onClick={() => {

                        closeDetails();

                        openEditModal(
                          selectedFollowUp
                        );

                      }}
                    >
                      Edit Follow-Up
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
    <div className="followup-overview-card">

      <div
        className="followup-overview-icon"
        style={{
          color,
          background: bg,
        }}
      >
        {icon}
      </div>


      <div className="followup-overview-value">
        {value}
      </div>


      <div className="followup-overview-label">
        {label}
      </div>

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
      className={`
        detail-box
        ${full ? "full" : ""}
      `}
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


export default FollowUps;