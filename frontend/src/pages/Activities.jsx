import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

const emptyForm = {
  leadId: "",
  customerId: "",
  userId: "",
  type: "NOTE",
  subject: "",
  description: "",
  activityDate: "",
};

const activityTypes = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "WHATSAPP",
  "OTHER",
];

// Convert a backend timestamp into the value required by datetime-local.
// The backend currently returns LocalDateTime-style strings (without a timezone).
const toDateTimeLocalValue = (value) => {
  if (!value) return "";

  const text = String(value).trim();

  if (text.length >= 19 && text[10] === "T") {
    return text.slice(0, 19);
  }

  if (text.length >= 16 && text[10] === "T") {
    return `${text.slice(0, 16)}:00`;
  }

  if (text.length >= 10) {
    return `${text.slice(0, 10)}T00:00:00`;
  }

  return "";
};

function Activities() {
  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const activitiesTableRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");


  /* =========================================
     LOAD DATA
  ========================================= */

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      setLoading(true);

      const [
        activitiesResponse,
        leadsResponse,
        customersResponse,
        usersResponse,
        meResponse,
      ] = await Promise.all([
        api.get("/activities"),
        api.get("/leads"),
        api.get("/customers"),
        api.get("/users/active"),
        api.get("/users/me"),
      ]);

      setActivities(
        activitiesResponse.data || []
      );

      setLeads(
        leadsResponse.data || []
      );

      setCustomers(
        customersResponse.data || []
      );

      setUsers(
        usersResponse.data || []
      );

      setCurrentUserRole(
        String(meResponse.data?.role || "")
          .toUpperCase()
      );

    } catch (error) {
      console.error(
        "Error loading activities:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load activities."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     FORM
  ========================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  };


  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setError("");
  };


  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };


  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  };


  /* =========================================
     SAVE
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.subject.trim()) {
      setError(
        "Please enter an activity subject."
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

        userId: form.userId
          ? Number(form.userId)
          : null,

        type: form.type,

        subject: form.subject.trim(),

        description:
          form.description.trim(),

        activityDate:
          form.activityDate
            ? (form.activityDate.length === 16
                ? `${form.activityDate}:00`
                : form.activityDate)
            : null,
      };


      if (editingId) {

        await api.put(
          `/activities/${editingId}`,
          payload
        );

        alert(
          "Activity updated successfully."
        );

      } else {

        await api.post(
          "/activities",
          payload
        );

        alert(
          "Activity created successfully."
        );
      }


      setShowModal(false);

      resetForm();

      await loadData();

    } catch (error) {

      console.error(
        "Error saving activity:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Unable to save activity."
      );

    } finally {
      setSaving(false);
    }
  };


  /* =========================================
     EDIT
  ========================================= */

  const handleEdit = (activity) => {

    setEditingId(activity.id);

    const activityDate = toDateTimeLocalValue(
      activity.activityDate
    );

    setForm({
      leadId:
        activity.leadId
          ? String(activity.leadId)
          : "",

      customerId:
        activity.customerId
          ? String(activity.customerId)
          : "",

      userId:
        activity.userId
          ? String(activity.userId)
          : "",

      type:
        activity.type || "NOTE",

      subject:
        activity.subject || "",

      description:
        activity.description || "",

      activityDate,
    });

    setError("");

    setShowModal(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /* =========================================
     DELETE
  ========================================= */

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this activity?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await api.delete(
        `/activities/${id}`
      );

      await loadData();

    } catch (error) {

      console.error(
        "Error deleting activity:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete activity."
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
        Number(item.id) ===
        Number(leadId)
    );

    return lead
      ? lead.name
      : `Lead #${leadId}`;
  };


  const getCustomerName = (customerId) => {

    if (!customerId) {
      return "-";
    }

    const customer =
      customers.find(
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
        Number(item.id) ===
        Number(userId)
    );

    return user
      ? user.name
      : `User #${userId}`;
  };


  const formatDate = (date) => {

    if (!date) {
      return "Not scheduled";
    }

    const value =
      String(date).split("T")[0];

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const getTypeClass = (type) => {

    switch (
      String(type || "")
        .toUpperCase()
    ) {
      case "CALL":
        return "type-call";

      case "EMAIL":
        return "type-email";

      case "MEETING":
        return "type-meeting";

      case "WHATSAPP":
        return "type-whatsapp";

      case "NOTE":
        return "type-note";

      default:
        return "type-other";
    }
  };


  /* =========================================
     VIEW ALL ACTIVITIES
  ========================================= */

  const viewAllActivities = () => {
    setSearch("");
    setTypeFilter("ALL");

    // Wait for the cleared filters to render, then move to the complete list.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        activitiesTableRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  };


  /* =========================================
     FILTER
  ========================================= */

  const filteredActivities =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();

      return activities.filter(
        (activity) => {

          const subject =
            String(
              activity.subject || ""
            ).toLowerCase();

          const description =
            String(
              activity.description || ""
            ).toLowerCase();

          const leadName =
            getLeadName(
              activity.leadId
            ).toLowerCase();

          const customerName =
            getCustomerName(
              activity.customerId
            ).toLowerCase();

          const employeeName =
            getUserName(
              activity.userId
            ).toLowerCase();

          const matchesSearch =
            !value ||
            subject.includes(value) ||
            description.includes(value) ||
            leadName.includes(value) ||
            customerName.includes(value) ||
            employeeName.includes(value);

          const matchesType =
            typeFilter === "ALL" ||
            String(
              activity.type || ""
            ).toUpperCase() ===
              typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );

    }, [
      activities,
      leads,
      customers,
      users,
      search,
      typeFilter,
    ]);


  /* =========================================
     STATISTICS
  ========================================= */

  const totalActivities =
    activities.length;

  const callActivities =
    activities.filter(
      (item) =>
        String(item.type || "")
          .toUpperCase() === "CALL"
    ).length;

  const emailActivities =
    activities.filter(
      (item) =>
        String(item.type || "")
          .toUpperCase() === "EMAIL"
    ).length;

  const meetingActivities =
    activities.filter(
      (item) =>
        String(item.type || "")
          .toUpperCase() === "MEETING"
    ).length;

  const whatsappActivities =
    activities.filter(
      (item) =>
        String(item.type || "")
          .toUpperCase() === "WHATSAPP"
    ).length;

  const today = new Date();

  const todayString =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

  const todayActivities =
    activities.filter(
      (activity) =>
        activity.activityDate &&
        String(
          activity.activityDate
        ).startsWith(todayString)
    ).length;


  /* =========================================
     CSS
  ========================================= */

  const pageStyles = `

    * {
      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }

    .activities-page,
    .activities-page *,
    .activity-modal-overlay,
    .activity-modal-overlay *,
    .activity-modal,
    .activity-modal * {
      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    /* =====================================
       PAGE
    ===================================== */

    .activities-page {
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

    .activities-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      padding:
        28px 0 22px;
    }


    .activities-page-header h1 {
      margin: 0;

      color: #10182f;

      font-size: 30px;

      font-weight: 900;

      letter-spacing: -0.8px;
    }


    .activities-page-header p {
      margin:
        7px 0 0;

      color: #71809a;

      font-size: 14px;

      font-weight: 400;
    }


    /* =====================================
       HERO
    ===================================== */

    .activities-hero {
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


    .activity-stars {
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
          circle at 45% 31%,
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
    }


    /* =====================================
       HERO CONTENT
    ===================================== */

    .activity-hero-content {
      position: relative;
      z-index: 20;

      width: 48%;

      padding:
        50px 0 45px 52px;
    }


    .activity-status {
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


    .activity-status-dot {
      width: 8px;
      height: 8px;

      border-radius: 50%;

      background: #22d3ee;

      box-shadow:
        0 0 12px
        rgba(34,211,238,.85);
    }


    .activity-hero-content h2 {
      margin:
        25px 0 0;

      color: white;

      font-size: 49px;

      line-height: 1.04;

      letter-spacing: -2.4px;

      font-weight: 900;
    }


    .activity-hero-content h2 span {
      color: #a99aff;
    }


    .activity-hero-description {
      max-width: 490px;

      margin:
        20px 0 0;

      color: #aab5d2;

      font-size: 15px;

      line-height: 1.7;

      font-weight: 600;
    }


    /* =====================================
       HERO BUTTONS
    ===================================== */

    .activity-hero-actions {
      display: flex;
      gap: 12px;

      margin-top: 25px;
    }


    .activity-hero-primary {
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
    }


    .activity-hero-secondary {
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


    /* =====================================
       MINI STATS
    ===================================== */

    .activity-mini-stats {
      display: flex;
      gap: 30px;

      margin-top: 32px;
    }


    .activity-mini-stat strong {
      display: block;

      color: white;

      font-size: 24px;

      font-weight: 900;
    }


    .activity-mini-stat span {
      display: block;

      margin-top: 4px;

      color: #8995b8;

      font-size: 11px;

      font-weight: 700;
    }


    /* =====================================
       3D ACTIVITY SATELLITE SPACE VISUAL
    ===================================== */

    .communication-space { position: absolute; right: 1%; top: 0; width: 54%; height: 100%; overflow: hidden; perspective: 1200px; pointer-events: none; }

    .activity-space-glow { position: absolute; left: 55%; top: 51%; width: 390px; height: 390px; transform: translate(-50%,-50%); border-radius: 50%; background: radial-gradient(circle, rgba(112,138,255,.20) 0%, rgba(77,111,255,.12) 30%, rgba(34,211,238,.08) 48%, transparent 73%); filter: blur(18px); animation: activityGlowPulse 5.5s ease-in-out infinite; }

    .activity-orbit { position: absolute; left: 55%; top: 51%; border-radius: 50%; border: 1px solid rgba(135,157,255,.28); transform-style: preserve-3d; box-shadow: 0 0 18px rgba(89,117,255,.08); animation: activityOrbitPulse 3.5s ease-in-out infinite; }
    .activity-orbit.one { width: 420px; height: 145px; transform: translate(-50%,-50%) rotateX(68deg) rotateZ(-18deg); }
    .activity-orbit.two { width: 330px; height: 115px; border-color: rgba(34,211,238,.24); transform: translate(-50%,-50%) rotateX(68deg) rotateZ(61deg); animation-duration: 4.4s; animation-direction: reverse; }
    .activity-orbit.three { width: 280px; height: 390px; border-color: rgba(157,124,255,.18); transform: translate(-50%,-50%) rotateY(70deg) rotateZ(18deg); animation-duration: 5.2s; }

    .activity-orbit-dot { position: absolute; left: 50%; top: -4px; width: 8px; height: 8px; transform: translateX(-50%); border-radius: 50%; background: #8de8ff; box-shadow: 0 0 7px rgba(141,232,255,.95), 0 0 18px rgba(72,198,255,.65); }
    .activity-orbit.two .activity-orbit-dot { background: #a99aff; box-shadow: 0 0 7px rgba(169,154,255,.95), 0 0 18px rgba(139,92,246,.65); }

    .activity-satellite { position: absolute; left: 55%; top: 51%; width: 180px; height: 120px; transform: translate(-50%,-50%) rotateX(9deg) rotateY(-16deg) rotateZ(-3deg); transform-style: preserve-3d; z-index: 10; filter: drop-shadow(0 18px 22px rgba(0,0,0,.34)); animation: activitySatelliteFloat 5.5s ease-in-out infinite; }

    .satellite-body { position: absolute; left: 52px; top: 35px; width: 76px; height: 52px; border-radius: 13px 15px 12px 11px; background: linear-gradient(145deg, #ffffff 0%, #d9e4ff 18%, #8799d7 42%, #4a5ba4 72%, #202957 100%); border: 1px solid rgba(255,255,255,.72); box-shadow: inset 9px 7px 13px rgba(255,255,255,.34), inset -12px -12px 18px rgba(24,34,87,.62), 0 0 20px rgba(111,145,255,.38); transform: translateZ(14px); }
    .satellite-body::before { content: ""; position: absolute; left: 12px; top: 11px; width: 21px; height: 12px; border-radius: 4px; background: linear-gradient(135deg, #f8ffff, #69ddff 42%, #3559d8 100%); box-shadow: 0 0 9px rgba(87,224,255,.82); }
    .satellite-body::after { content: ""; position: absolute; right: 11px; top: 13px; width: 8px; height: 8px; border-radius: 50%; background: #5ee7ff; box-shadow: 0 0 8px rgba(94,231,255,.95), 0 0 18px rgba(34,211,238,.48); }

    .satellite-panel { position: absolute; width: 64px; height: 38px; top: 42px; border-radius: 5px; border: 1px solid rgba(148,181,255,.70); background: linear-gradient(135deg, #101d56 0%, #263d91 36%, #536bd0 70%, #17275f 100%); box-shadow: inset 0 0 13px rgba(100,194,255,.18), 0 0 10px rgba(66,125,255,.18); }
    .satellite-panel::before { content: ""; position: absolute; inset: 5px; background: repeating-linear-gradient(90deg, rgba(152,206,255,.28) 0 1px, transparent 1px 11px), repeating-linear-gradient(0deg, rgba(152,206,255,.20) 0 1px, transparent 1px 9px); }
    .satellite-panel.left { left: -6px; transform: translateZ(2px) rotateY(-17deg) rotateZ(-4deg); }
    .satellite-panel.right { right: -6px; transform: translateZ(2px) rotateY(17deg) rotateZ(4deg); }

    .satellite-arm { position: absolute; left: 43px; top: 57px; width: 100px; height: 3px; border-radius: 4px; background: linear-gradient(90deg, #b9c9f4, #677bbd, #b9c9f4); box-shadow: 0 0 5px rgba(177,201,255,.36); }
    .satellite-dish { position: absolute; left: 73px; top: 5px; width: 52px; height: 29px; border-radius: 50% 50% 42% 42%; background: radial-gradient(ellipse at 35% 35%, #ffffff 0%, #c7d7ff 20%, #687bc4 52%, #27356e 100%); border: 1px solid rgba(255,255,255,.66); box-shadow: 0 0 15px rgba(119,151,255,.38); transform: rotate(-13deg) translateZ(22px); }
    .satellite-dish::after { content: ""; position: absolute; left: 24px; top: 22px; width: 3px; height: 26px; background: linear-gradient(#dbe7ff, #6679b9); transform: rotate(14deg); transform-origin: top center; }

    .satellite-signal { position: absolute; left: 103px; top: -5px; width: 82px; height: 82px; border: 1px solid rgba(88,224,255,.28); border-left-color: transparent; border-bottom-color: transparent; border-radius: 50%; transform: rotate(24deg); animation: signalPulse 2.2s ease-out infinite; }
    .satellite-signal.two { width: 116px; height: 116px; left: 91px; top: -17px; opacity: .55; animation-delay: -.75s; }

    .activity-data-node { position: absolute; z-index: 12; width: 9px; height: 9px; border-radius: 50%; background: #a9f0ff; box-shadow: 0 0 8px rgba(169,240,255,.98), 0 0 20px rgba(58,206,255,.72); animation: activityNodePulse 2.4s ease-in-out infinite; }
    .activity-data-node.one { left: 35%; top: 31%; }
    .activity-data-node.two { left: 73%; top: 32%; width: 6px; height: 6px; animation-delay: -.7s; }
    .activity-data-node.three { left: 76%; top: 70%; width: 7px; height: 7px; animation-delay: -1.3s; }

    .activity-signal-wave { position: absolute; left: 55%; top: 51%; width: 205px; height: 205px; transform: translate(-50%,-50%); border: 1px solid rgba(61,220,255,.20); border-radius: 50%; animation: activityWave 3.8s ease-out infinite; }
    .activity-signal-wave.two { width: 255px; height: 255px; animation-delay: -1.25s; }
    .activity-signal-wave.three { width: 305px; height: 305px; animation-delay: -2.5s; }

    @keyframes activitySatelliteFloat { 0%,100% { transform: translate(-50%,-50%) rotateX(9deg) rotateY(-16deg) rotateZ(-3deg) translate3d(0,0,0); } 50% { transform: translate(-50%,-50%) rotateX(12deg) rotateY(-10deg) rotateZ(1deg) translate3d(7px,-9px,12px); } }
    @keyframes activityOrbitPulse { 0%,100% { opacity: .58; } 50% { opacity: 1; filter: brightness(1.18); } }
    @keyframes activityGlowPulse { 0%,100% { opacity: .55; transform: translate(-50%,-50%) scale(.94); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.07); } }
    @keyframes signalPulse { 0% { opacity: .10; transform: rotate(24deg) scale(.72); } 55% { opacity: .85; } 100% { opacity: 0; transform: rotate(24deg) scale(1.16); } }
    @keyframes activityNodePulse { 0%,100% { opacity: .45; transform: scale(.72); } 50% { opacity: 1; transform: scale(1.25); } }
    @keyframes activityWave { 0% { opacity: .06; transform: translate(-50%,-50%) scale(.65); } 45% { opacity: .45; } 100% { opacity: 0; transform: translate(-50%,-50%) scale(1.08); } }


    /* =====================================
       SPACE METRICS
    ===================================== */

    .activity-space-metric {
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
    }


    .activity-space-metric.one {
      left: 4%;
      top: 12%;
    }


    .activity-space-metric.two {
      right: 0;
      top: 55%;
    }


    .activity-space-metric.three {
      left: 13%;
      bottom: 8%;
    }


    .activity-space-metric strong {
      display: block;

      color: white;

      font-size: 22px;

      font-weight: 900;
    }


    .activity-space-metric span {
      display: block;

      margin-top: 3px;

      color: #8e9abb;

      font-size: 10px;

      font-weight: 800;
    }


    /* =====================================
       SECTIONS
    ===================================== */

    .activity-section {
      margin-top: 38px;
    }


    .activity-section-title {
      margin-bottom: 17px;
    }


    .activity-section-title h2 {
      margin: 0;

      color: #13203b;

      font-size: 27px;

      font-weight: 900;

      letter-spacing: -.7px;
    }


    .activity-section-title p {
      margin:
        5px 0 0;

      color: #75839c;

      font-size: 13px;
    }


    /* =====================================
       OVERVIEW
    ===================================== */

    .activity-overview-grid {
      display: grid;

      grid-template-columns:
        repeat(4,minmax(0,1fr));

      gap: 17px;
    }


    .activity-overview-card {
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


    .activity-overview-icon {
      width: 44px;
      height: 44px;

      display: grid;
      place-items: center;

      border-radius: 13px;

      font-size: 19px;

      font-weight: 900;
    }


    .activity-icon-all {
      color: #4356d9;
      background: #eef0ff;
    }


    .activity-icon-call {
      color: #087ea4;
      background: #e7f8fc;
    }


    .activity-icon-meeting {
      color: #7c45c7;
      background: #f3eaff;
    }


    .activity-icon-today {
      color: #078b65;
      background: #e5faf2;
    }


    .activity-overview-value {
      margin-top: 15px;

      color: #101a33;

      font-size: 29px;

      font-weight: 900;
    }


    .activity-overview-label {
      margin-top: 3px;

      color: #71809a;

      font-size: 12px;

      font-weight: 700;
    }


    /* =====================================
       CONTROLS
    ===================================== */

    .activity-controls {
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


    .activity-search {
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

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .activity-filter {
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

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .activity-results {
      color: #8290a7;

      font-size: 11px;

      font-weight: 800;
    }


    /* =====================================
       TABLE
    ===================================== */

    .activity-table-wrapper {
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


    .activity-table {
      width: 100%;

      min-width: 1080px;

      border-collapse:
        collapse;
    }


    .activity-table th {
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

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .activity-table td {
      padding:
        16px 15px;

      border-bottom:
        1px solid
        #edf0f5;

      color: #647189;

      font-size: 11px;

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .activity-subject {
      color: #17213a;

      font-size: 13px;

      font-weight: 900;
    }


    .activity-secondary {
      margin-top: 4px;

      color: #9aa5b7;

      font-size: 10px;
    }


    .activity-description {
      max-width: 220px;

      color: #7c879a;

      font-size: 10px;

      line-height: 1.5;
    }


    /* =====================================
       BADGES
    ===================================== */

    .activity-badge {
      display: inline-flex;

      padding:
        6px 9px;

      border-radius: 20px;

      font-size: 9px;

      font-weight: 900;
    }


    .type-note {
      color: #59667a;
      background: #eef1f5;
    }


    .type-call {
      color: #087ea4;
      background: #e7f8fc;
    }


    .type-email {
      color: #4356d9;
      background: #eef0ff;
    }


    .type-meeting {
      color: #7c45c7;
      background: #f3eaff;
    }


    .type-whatsapp {
      color: #078363;
      background: #e1f9ef;
    }


    .type-other {
      color: #69768d;
      background: #f1f3f6;
    }


    /* =====================================
       ACTIONS
    ===================================== */

    .activity-actions {
      display: flex;
      gap: 5px;
    }


    .activity-action {
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


    /* =====================================
       MODAL
       IMPORTANT FONT FIX
    ===================================== */

    .activity-modal-overlay {

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


    .activity-modal {

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


    .activity-modal-header {

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


    .activity-modal-header h2 {

      margin: 0;

      color: #15203a;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 21px;

      line-height: 1.25;

      font-weight: 900;
    }


    .activity-modal-header p {

      margin:
        5px 0 0;

      color: #8b97a9;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 11px;

      line-height: 1.4;

      font-weight: 400;
    }


    .activity-close {

      width: 38px;
      height: 38px;

      border: 0;

      border-radius: 9px;

      color: #68758b;

      background: #f1f3f8;

      cursor: pointer;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 18px;

      font-weight: 900;
    }


    /* =====================================
       FORM
    ===================================== */

    .activity-form {

      padding: 23px;

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .activity-form-grid {

      display: grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );

      gap: 14px;
    }


    .activity-form-field {

      display: flex;

      flex-direction: column;

      gap: 6px;

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .activity-form-field.full {

      grid-column: 1 / -1;
    }


    .activity-form-field label {

      color: #59667d;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 10px;

      line-height: 1.2;

      font-weight: 900;

      text-transform: uppercase;
    }


    .activity-form-field input,
    .activity-form-field select,
    .activity-form-field textarea {

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


    .activity-form-field input,
    .activity-form-field select {

      height: 43px;

      padding:
        0 11px;
    }


    .activity-form-field textarea {

      min-height: 90px;

      padding: 11px;

      resize: vertical;

      line-height: 1.5;
    }


    .activity-form-field input::placeholder,
    .activity-form-field textarea::placeholder {

      color: #8a8f99;

      opacity: 1;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 12px;

      font-weight: 400;
    }


    .activity-form-field input:focus,
    .activity-form-field select:focus,
    .activity-form-field textarea:focus {

      border-color:
        #7965ee;

      box-shadow:
        0 0 0 3px
        rgba(121,101,238,.08);
    }


    /* =====================================
       ERROR
    ===================================== */

    .activity-form-error {

      margin-bottom: 15px;

      padding:
        10px 12px;

      border-radius: 8px;

      color: #c24454;

      background: #fff0f2;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 11px;

      font-weight: 700;
    }


    /* =====================================
       MODAL FOOTER
    ===================================== */

    .activity-modal-footer {

      display: flex;

      justify-content: flex-end;

      gap: 9px;

      margin-top: 20px;

      padding-top: 17px;

      border-top:
        1px solid
        #edf0f5;
    }


    .activity-cancel {

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

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 12px;

      font-weight: 800;
    }


    .activity-save {

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

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      font-size: 12px;

      font-weight: 900;
    }


    /* =====================================
       DETAILS
    ===================================== */

    .activity-details {

      padding: 23px;

      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .activity-profile {

      display: flex;

      align-items: center;

      gap: 13px;

      padding: 15px;

      margin-bottom: 17px;

      border-radius: 13px;

      background: #f7f8fc;
    }


    .activity-profile-icon {

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


    .activity-profile h3 {

      margin: 0;

      color: #17213a;

      font-size: 17px;

      font-weight: 900;
    }


    .activity-profile p {

      margin:
        4px 0 0;

      color: #8b97a9;

      font-size: 11px;

      font-weight: 400;
    }


    .activity-details-grid {

      display: grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0,1fr)
        );

      gap: 10px;
    }


    .activity-detail-box {

      padding: 12px;

      border:
        1px solid
        #e8ebf1;

      border-radius: 10px;

      background: #fbfcfe;
    }


    .activity-detail-box.full {

      grid-column: 1 / -1;
    }


    .activity-detail-label {

      color: #98a2b3;

      font-size: 9px;

      font-weight: 900;

      letter-spacing: .06em;

      text-transform: uppercase;
    }


    .activity-detail-value {

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

      .activity-hero-content {
        width: 53%;
      }

      .communication-space {
        width: 52%;
      }

      .activity-satellite {
        transform: translate(-50%,-50%) scale(.88) rotateX(9deg) rotateY(-16deg) rotateZ(-3deg);
      }

      .activity-orbit.one {
        width: 350px;
      }

      .activity-orbit.two {
        width: 285px;
      }

      .activity-overview-grid {
        grid-template-columns:
          repeat(2,1fr);
      }
    }


    @media(max-width:800px) {

      .activities-hero {
        min-height: 680px;
      }

      .activity-hero-content {

        width: 100%;

        padding:
          40px 30px 0;
      }

      .activity-hero-content h2 {
        font-size: 40px;
      }

      .communication-space {

        top: 320px;

        left: 0;
        right: 0;

        width: 100%;

        height: 350px;
      }

      .activity-satellite {
        left: 54%;
        top: 52%;
      }
    }


    @media(max-width:600px) {

      .activities-page-header {
        padding-top: 18px;
      }

      .activities-page-header h1 {
        font-size: 26px;
      }

      .activities-hero {

        min-height: 640px;

        border-radius: 22px;
      }

      .activity-hero-content {
        padding:
          28px 22px 0;
      }

      .activity-hero-content h2 {
        font-size: 34px;
      }

      .activity-hero-description {
        font-size: 13px;
      }

      .activity-mini-stats {
        gap: 18px;
      }

      .communication-space {

        top: 310px;

        height: 310px;

        transform:
          scale(.82);

        transform-origin:
          top center;
      }

      .activity-satellite {
        left: 54%;
        top: 52%;
      }
      .activity-overview-grid {
        grid-template-columns: 1fr;
      }

      .activity-controls {

        align-items: stretch;

        flex-direction: column;
      }

      .activity-search,
      .activity-filter {
        width: 100%;
      }

      .activity-form-grid,
      .activity-details-grid {
        grid-template-columns: 1fr;
      }

      .activity-form-field.full,
      .activity-detail-box.full {
        grid-column: auto;
      }

      .activity-modal-overlay {
        padding: 8px;
      }

      .activity-modal {
        max-height: 96vh;
      }

      .activity-modal-header {
        padding:
          21px 17px;
      }

      .activity-form,
      .activity-details {
        padding: 17px;
      }
    }



    /* ===== PRIYONIX DARK SPACE THEME + WORKSPACE FRAME ===== */
    .activities-page {
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

    .activities-page-header {
      min-width: 0;
      gap: 18px;
      padding: 8px 2px 24px !important;
      margin: 0;
    }
    .activities-page-header h1 { color: #f4f7ff !important; }
    .activities-page-header p { color: #a9bbda !important; }

    .activities-hero {
      width: 100%;
      max-width: 100%;
      margin: 0 0 34px;
      border: 1px solid rgba(124, 157, 255, 0.12);
    }

    .activity-section { margin-top: 30px; }
    .activity-section-title h2 { color: #f4f7ff !important; }
    .activity-section-title p { color: #a9bbda !important; }

    .activity-overview-grid,
    .activity-controls,
    .activity-table-wrapper {
      width: 100%;
      min-width: 0;
    }

    .activity-overview-card {
      background: rgba(13, 27, 56, 0.96) !important;
      border-color: rgba(124, 157, 255, 0.22) !important;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16) !important;
    }
    /* Match the rounded top-right accent used on Follow-Ups cards. */
    .activity-overview-card::after {
      content: "";
      position: absolute;
      width: 95px;
      height: 95px;
      right: -30px;
      top: -30px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.14) !important;
      pointer-events: none;
    }
    .activity-overview-icon,
    .activity-overview-value,
    .activity-overview-label {
      position: relative;
      z-index: 2;
    }
    /* Match the colorful icon tiles used on the Follow-Ups cards. */
    .activity-overview-icon.activity-icon-all {
      color: #5b55ff !important;
      background: #eef0ff !important;
    }
    .activity-overview-icon.activity-icon-call {
      color: #087ea4 !important;
      background: #e7f8fc !important;
    }
    .activity-overview-icon.activity-icon-meeting {
      color: #7c45c7 !important;
      background: #f3eaff !important;
    }
    .activity-overview-icon.activity-icon-today {
      color: #078b65 !important;
      background: #e1f9ef !important;
    }
    .activity-overview-value { color: #f4f7ff !important; }
    .activity-overview-label { color: #a9bbda !important; }

    .activity-controls {
      margin-top: 26px;
      background: rgba(13, 27, 56, 0.96) !important;
      border-color: rgba(124, 157, 255, 0.22) !important;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14) !important;
    }
    .activity-search,
    .activity-filter {
      min-width: 0;
      color: #f4f7ff !important;
      background: #0a1730 !important;
      border-color: #30466f !important;
    }
    .activity-search::placeholder { color: #8094b8 !important; opacity: 1; }
    .activity-search:focus,
    .activity-filter:focus {
      border-color: #8b7cff !important;
      box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
    }
    .activity-results { color: #a9bbda !important; }

    .activity-table-wrapper {
      margin-bottom: 6px;
      background: rgba(13, 27, 56, 0.96) !important;
      border-color: rgba(124, 157, 255, 0.22) !important;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16) !important;
    }
    .activity-table { background: transparent !important; }
    .activity-table th {
      color: #a9bbda !important;
      background: #101f3b !important;
      border-bottom-color: #263d68 !important;
    }
    .activity-table td {
      color: #c4d0e7 !important;
      border-bottom-color: rgba(124, 157, 255, 0.14) !important;
    }
    .activity-table tbody tr { background: transparent !important; }
    .activity-table tbody tr:hover { background: rgba(92, 105, 190, 0.12) !important; }
    .activity-subject { color: #f4f7ff !important; }
    .activity-secondary,
    .activity-description { color: #9aadd0 !important; }

    .activity-action {
      color: #dbe7ff !important;
      background: #142544 !important;
      border-color: #30466f !important;
    }
    .activity-action:hover {
      color: #fff !important;
      background: #25396a !important;
      border-color: #8b7cff !important;
    }

    .activity-empty {
      color: #a9bbda !important;
      background: rgba(13, 27, 56, 0.8) !important;
      border: 1px solid rgba(124, 157, 255, 0.18);
      border-radius: 16px;
    }
    .activity-empty h3 { color: #f4f7ff !important; }
    .activity-empty p { color: #a9bbda !important; }
    .activity-form-error {
      color: #ffdce2 !important;
      background: rgba(194, 68, 84, 0.18) !important;
      border: 1px solid rgba(255, 133, 151, 0.28);
    }

    /* Activity modal: anchored inside the main workspace below the top bar. */
    .activity-modal-overlay {
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
      background: rgba(4, 9, 25, 0.72) !important;
    }
    .activity-modal {
      flex: 0 1 850px !important;
      width: min(850px, 100%) !important;
      min-width: 0 !important;
      max-height: calc(100dvh - 112px) !important;
      margin: 0 auto !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      overscroll-behavior: contain;
      color: #eaf0ff !important;
      background: #0d1b38 !important;
      border: 1px solid rgba(124, 157, 255, 0.22) !important;
      border-radius: 20px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.42) !important;
    }
    .activity-modal-header {
      position: sticky;
      top: 0;
      z-index: 5;
      background: #0d1b38 !important;
      border-bottom-color: rgba(124, 157, 255, 0.18) !important;
    }
    .activity-modal-header h2 { color: #f4f7ff !important; }
    .activity-modal-header p { color: #a9bbda !important; }
    .activity-close {
      color: #dbe7ff !important;
      background: #1a2d4d !important;
    }
    .activity-form,
    .activity-details { min-width: 0; }
    .activity-form-field label { color: #b9c8e4 !important; }
    .activity-form-field input,
    .activity-form-field select,
    .activity-form-field textarea {
      min-width: 0;
      max-width: 100%;
      color: #f4f7ff !important;
      background: #09172f !important;
      border-color: #30466f !important;
      color-scheme: dark;
    }
    .activity-form-field input::placeholder,
    .activity-form-field textarea::placeholder { color: #8094b8 !important; opacity: 1; }
    .activity-form-field select option { color: #f4f7ff; background: #0d1b38; }
    .activity-form-field input:focus,
    .activity-form-field select:focus,
    .activity-form-field textarea:focus {
      border-color: #8b7cff !important;
      box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
    }
    .activity-form-field input[type="date"] { color-scheme: dark !important; }
    .activity-form-field input[type="date"]::-webkit-calendar-picker-indicator {
      filter: brightness(0) invert(1) !important;
      -webkit-filter: brightness(0) invert(1) !important;
      opacity: 1 !important;
      cursor: pointer !important;
    }
    .activity-modal-footer { border-top-color: rgba(124, 157, 255, 0.18) !important; }
    .activity-cancel {
      color: #dbe7ff !important;
      background: #142544 !important;
      border-color: #30466f !important;
    }
    .activity-cancel:hover { background: #20365a !important; }
    .activity-profile { background: #142544 !important; }
    .activity-profile h3 { color: #f4f7ff !important; }
    .activity-profile p { color: #a9bbda !important; }
    .activity-detail-box {
      background: #0a1730 !important;
      border-color: #30466f !important;
    }
    .activity-detail-label { color: #91a6ca !important; }
    .activity-detail-value { color: #e3ebfb !important; }

    /* Hide scrollbars without disabling scroll. */
    .activity-modal,
    .activity-modal-overlay {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    .activity-modal::-webkit-scrollbar,
    .activity-modal-overlay::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      background: transparent !important;
    }

    @media (max-width: 1050px) and (min-width: 801px) {
      .activities-page { padding: 14px 14px 30px !important; }
      .activity-modal-overlay { inset: 78px 0 0 245px !important; padding: 14px 14px 16px !important; }
      .activity-modal { max-height: calc(100dvh - 108px) !important; }
    }
    @media (max-width: 800px) {
      .activities-page { padding: 12px 12px 28px !important; border-radius: 16px; }
      .activities-page-header { padding: 8px 2px 20px !important; }
      .activity-modal-overlay { inset: 68px 0 0 0 !important; padding: 12px 12px 14px !important; }
      .activity-modal { width: 100% !important; max-height: calc(100dvh - 94px) !important; border-radius: 16px; }
    }
    @media (max-width: 600px) {
      .activity-form-grid,
      .activity-details-grid { grid-template-columns: minmax(0, 1fr) !important; }
      .activity-form-field.full,
      .activity-detail-box.full { grid-column: auto !important; }
      .activity-form,
      .activity-details { padding: 16px !important; }
      .activity-modal-header { padding: 16px !important; }
      .activity-modal-footer { flex-wrap: wrap; }
      .activity-modal-footer button { flex: 1 1 auto; }
      .activity-actions { flex-wrap: wrap; }
      .activity-section-title h2 { font-size: 23px !important; }
    }

    /* ===== RESPONSIVE POLISH — all devices ===== */
    @media (max-width: 600px) {
      .activity-search,
      .activity-filter {
        flex: 0 0 auto;
        width: 100%;
        min-width: 0;
      }

      .activity-hero-actions {
        flex-wrap: wrap;
      }

      .activity-space-metric {
        display: none;
      }
    }

    @media (max-width: 400px) {
      .activity-hero-primary,
      .activity-hero-secondary {
        flex: 1 1 100%;
        justify-content: center;
      }
    }

    @media (max-width: 360px) {
      .activities-page-header h1 {
        font-size: 23px;
      }

      .activity-hero-content h2 {
        font-size: 29px;
      }

      .activities-hero {
        min-height: 560px;
      }
    }

    @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
      .activities-hero {
        min-height: 360px !important;
      }

      .communication-space {
        display: none;
      }
    }

  `;


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

          .activity-loading {
            min-height: 100vh;

            display: grid;

            place-items: center;

            background: #071329;

            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .activity-loading h2 {
            color: #f4f7ff;

            font-size: 21px;

            font-weight: 900;

            text-align: center;
          }

        `}</style>

        <div className="
          activity-loading
        ">

          <h2>
            Loading Activities...
          </h2>

        </div>
      </>
    );
  }


  return (
    <>
      <style>
        {pageStyles}
      </style>


      <div className="
        activities-page
      ">


        {/* =====================================
            HEADER
        ===================================== */}

        <div className="
          activities-page-header
        ">

          <div>

            <h1>
              Activity Management
            </h1>

            <p>
              Track and manage every
              customer interaction.
            </p>

          </div>

        </div>


        {/* =====================================
            HERO
        ===================================== */}

        <section className="
          activities-hero
        ">

          <div className="
            activity-stars
          " />


          <div className="
            activity-hero-content
          ">

            <div className="
              activity-status
            ">

              <span className="
                activity-status-dot
              " />

              ACTIVITY SYSTEM ONLINE

            </div>


            <h2>

              Every conversation.

              <br />

              <span>
                Every connection.
              </span>

            </h2>


            <p className="
              activity-hero-description
            ">

              Track calls, emails,
              meetings, messages and
              notes from one connected
              PriyoniX CRM workspace.

            </p>


            <div className="
              activity-hero-actions
            ">

              <button
                className="
                  activity-hero-primary
                "
                onClick={openAddModal}
              >
                Add New Activity →
              </button>


              <button
                className="
                  activity-hero-secondary
                "
                type="button"
                onClick={viewAllActivities}
              >
                View All Activities
              </button>

            </div>


            <div className="
              activity-mini-stats
            ">

              <div className="
                activity-mini-stat
              ">

                <strong>
                  {totalActivities}
                </strong>

                <span>
                  Total Activities
                </span>

              </div>


              <div className="
                activity-mini-stat
              ">

                <strong>
                  {todayActivities}
                </strong>

                <span>
                  Today
                </span>

              </div>


              <div className="
                activity-mini-stat
              ">

                <strong>
                  {meetingActivities}
                </strong>

                <span>
                  Meetings
                </span>

              </div>

            </div>

          </div>


          {/* =====================================
              SPACE VISUAL
          ===================================== */}

          <div className="
            communication-space
          ">

            <div className="
              activity-space-glow
            " />

            <div className="
              activity-orbit one
            ">
              <span className="
                activity-orbit-dot
              " />
            </div>

            <div className="
              activity-orbit two
            ">
              <span className="
                activity-orbit-dot
              " />
            </div>

            <div className="
              activity-orbit three
            " />

            <div className="
              activity-signal-wave
            " />

            <div className="
              activity-signal-wave two
            " />

            <div className="
              activity-signal-wave three
            " />

            <div className="
              activity-satellite
            ">

              <span className="
                satellite-panel left
              " />

              <span className="
                satellite-panel right
              " />

              <span className="
                satellite-arm
              " />

              <span className="
                satellite-body
              " />

              <span className="
                satellite-dish
              " />

              <span className="
                satellite-signal
              " />

              <span className="
                satellite-signal two
              " />

            </div>

            <span className="
              activity-data-node one
            " />

            <span className="
              activity-data-node two
            " />

            <span className="
              activity-data-node three
            " />

            <div className="
              activity-space-metric one
            ">
              <strong>{callActivities}</strong>
              <span>Calls</span>
            </div>

            <div className="
              activity-space-metric two
            ">
              <strong>{emailActivities}</strong>
              <span>Emails</span>
            </div>

            <div className="
              activity-space-metric three
            ">
              <strong>{whatsappActivities}</strong>
              <span>Messages</span>
            </div>

          </div>

        </section>


        {/* =====================================
            OVERVIEW
        ===================================== */}

        <section className="
          activity-section
        ">

          <div className="
            activity-section-title
          ">

            <h2>
              Activity Overview
            </h2>

            <p>
              Monitor your customer
              communication at a glance.
            </p>

          </div>


          <div className="
            activity-overview-grid
          ">


            <div className="
              activity-overview-card
            ">

              <div className="
                activity-overview-icon
                activity-icon-all
              ">
                ◉
              </div>

              <div className="
                activity-overview-value
              ">
                {totalActivities}
              </div>

              <div className="
                activity-overview-label
              ">
                Total Activities
              </div>

            </div>


            <div className="
              activity-overview-card
            ">

              <div className="
                activity-overview-icon
                activity-icon-call
              ">
                ☎
              </div>

              <div className="
                activity-overview-value
              ">
                {callActivities}
              </div>

              <div className="
                activity-overview-label
              ">
                Calls
              </div>

            </div>


            <div className="
              activity-overview-card
            ">

              <div className="
                activity-overview-icon
                activity-icon-meeting
              ">
                ◇
              </div>

              <div className="
                activity-overview-value
              ">
                {meetingActivities}
              </div>

              <div className="
                activity-overview-label
              ">
                Meetings
              </div>

            </div>


            <div className="
              activity-overview-card
            ">

              <div className="
                activity-overview-icon
                activity-icon-today
              ">
                ✓
              </div>

              <div className="
                activity-overview-value
              ">
                {todayActivities}
              </div>

              <div className="
                activity-overview-label
              ">
                Today's Activities
              </div>

            </div>

          </div>


          {/* =====================================
              FILTERS
          ===================================== */}

          <div className="
            activity-controls
          ">

            <input
              className="
                activity-search
              "
              type="text"
              placeholder="
                Search activities, leads,
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
                activity-filter
              "
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

              {activityTypes.map(
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


            <span className="
              activity-results
            ">

              Showing{" "}
              {filteredActivities.length}{" "}
              of{" "}
              {activities.length}

            </span>

          </div>


          {/* =====================================
              TABLE
          ===================================== */}

          <div
            ref={activitiesTableRef}
            className="
              activity-table-wrapper
            "
            style={{
              scrollMarginTop: "20px",
            }}
          >

            <table className="
              activity-table
            ">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Date</th>

                  <th>Type</th>

                  <th>Subject</th>

                  <th>Lead</th>

                  <th>Customer</th>

                  <th>Employee</th>

                  <th>Description</th>

                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {filteredActivities.map(
                  (activity) => (

                    <tr
                      key={activity.id}
                    >

                      <td>
                        {activity.id}
                      </td>


                      <td>
                        {formatDate(
                          activity.activityDate
                        )}
                      </td>


                      <td>

                        <span
                          className={`
                            activity-badge
                            ${getTypeClass(
                              activity.type
                            )}
                          `}
                        >
                          {
                            activity.type ||
                            "OTHER"
                          }
                        </span>

                      </td>


                      <td>

                        <div className="
                          activity-subject
                        ">
                          {
                            activity.subject ||
                            "-"
                          }
                        </div>

                        <div className="
                          activity-secondary
                        ">
                          Activity #
                          {activity.id}
                        </div>

                      </td>


                      <td>
                        {getLeadName(
                          activity.leadId
                        )}
                      </td>


                      <td>
                        {getCustomerName(
                          activity.customerId
                        )}
                      </td>


                      <td>
                        {getUserName(
                          activity.userId
                        )}
                      </td>


                      <td>

                        <div className="
                          activity-description
                        ">
                          {
                            activity.description ||
                            "-"
                          }
                        </div>

                      </td>


                      <td>

                        <div className="
                          activity-actions
                        ">

                          <button
                            type="button"
                            className="
                              activity-action
                            "
                            onClick={() => {

                              setSelectedActivity(
                                activity
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
                              activity-action
                            "
                            onClick={() =>
                              handleEdit(
                                activity
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            className="
                              activity-action
                            "
                            onClick={() =>
                              handleDelete(
                                activity.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


            {filteredActivities.length === 0 && (

              <div className="
                activity-empty
              ">

                <h3>
                  No activities found
                </h3>

                <p>
                  Add a new activity or
                  change your filters.
                </p>

              </div>

            )}

          </div>

        </section>

      </div>


      {/* =====================================
          ADD / EDIT MODAL
      ===================================== */}

      {showModal && (

        <div
          className="
            activity-modal-overlay
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
            activity-modal
          ">


            <div className="
              activity-modal-header
            ">

              <div>

                <h2>

                  {editingId
                    ? "Edit Activity"
                    : "Add New Activity"}

                </h2>

                <p>
                  Record a customer
                  communication or interaction.
                </p>

              </div>


              <button
                type="button"
                className="
                  activity-close
                "
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            <form
              className="
                activity-form
              "
              onSubmit={handleSubmit}
            >

              {error && (

                <div className="
                  activity-form-error
                ">
                  {error}
                </div>

              )}


              <div className="
                activity-form-grid
              ">


                <div className="
                  activity-form-field
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
                  activity-form-field
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


                {currentUserRole !== "EMPLOYEE" && currentUserRole !== "SALES" && (
                  <div className="
                    activity-form-field
                  ">

                    <label>
                      Employee
                    </label>

                    <select
                      name="userId"
                      value={form.userId}
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select Employee
                      </option>

                      {users
                        .filter(
                          (user) =>
                            user.active
                        )
                        .map(
                          (user) => (

                            <option
                              key={user.id}
                              value={user.id}
                            >
                              {user.name}
                            </option>

                          )
                        )}

                    </select>

                  </div>
                )}


                <div className="
                  activity-form-field
                ">

                  <label>
                    Activity Type
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={
                      handleChange
                    }
                  >

                    <option value="NOTE">
                      Note
                    </option>

                    <option value="CALL">
                      Call
                    </option>

                    <option value="EMAIL">
                      Email
                    </option>

                    <option value="MEETING">
                      Meeting
                    </option>

                    <option value="WHATSAPP">
                      WhatsApp
                    </option>

                    <option value="OTHER">
                      Other
                    </option>

                  </select>

                </div>


                <div className="
                  activity-form-field
                ">

                  <label>
                    Subject
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={
                      form.subject
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Activity subject"
                    required
                  />

                </div>


                <div className="
                  activity-form-field
                ">

                  <label>
                    Activity Date
                  </label>

                  <input
                    type="datetime-local"
                    step="1"
                    name="activityDate"
                    value={
                      form.activityDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="
                  activity-form-field
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
                      Enter activity details...
                    "
                    rows="4"
                  />

                </div>

              </div>


              <div className="
                activity-modal-footer
              ">

                <button
                  type="button"
                  className="
                    activity-cancel
                  "
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="
                    activity-save
                  "
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Activity"
                    : "Add Activity"}

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
        selectedActivity && (

          <div
            className="
              activity-modal-overlay
            "
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {

                setShowDetails(false);

                setSelectedActivity(
                  null
                );

              }

            }}
          >

            <div className="
              activity-modal
            ">

              <div className="
                activity-modal-header
              ">

                <div>

                  <h2>
                    Activity Details
                  </h2>

                  <p>
                    Complete communication
                    history information.
                  </p>

                </div>


                <button
                  type="button"
                  className="
                    activity-close
                  "
                  onClick={() => {

                    setShowDetails(
                      false
                    );

                    setSelectedActivity(
                      null
                    );

                  }}
                >
                  ×
                </button>

              </div>


              <div className="
                activity-details
              ">

                <div className="
                  activity-profile
                ">

                  <div className="
                    activity-profile-icon
                  ">
                    A
                  </div>

                  <div>

                    <h3>
                      {
                        selectedActivity.subject ||
                        "Activity"
                      }
                    </h3>

                    <p>
                      Activity #
                      {selectedActivity.id}
                    </p>

                  </div>

                </div>


                <div className="
                  activity-details-grid
                ">


                  <div className="
                    activity-detail-box
                  ">

                    <div className="
                      activity-detail-label
                    ">
                      Activity Date
                    </div>

                    <div className="
                      activity-detail-value
                    ">
                      {formatDate(
                        selectedActivity.activityDate
                      )}
                    </div>

                  </div>


                  <div className="
                    activity-detail-box
                  ">

                    <div className="
                      activity-detail-label
                    ">
                      Type
                    </div>

                    <div className="
                      activity-detail-value
                    ">

                      <span
                        className={`
                          activity-badge
                          ${getTypeClass(
                            selectedActivity.type
                          )}
                        `}
                      >
                        {
                          selectedActivity.type ||
                          "OTHER"
                        }
                      </span>

                    </div>

                  </div>


                  <div className="
                    activity-detail-box
                  ">

                    <div className="
                      activity-detail-label
                    ">
                      Lead
                    </div>

                    <div className="
                      activity-detail-value
                    ">
                      {getLeadName(
                        selectedActivity.leadId
                      )}
                    </div>

                  </div>


                  <div className="
                    activity-detail-box
                  ">

                    <div className="
                      activity-detail-label
                    ">
                      Customer
                    </div>

                    <div className="
                      activity-detail-value
                    ">
                      {getCustomerName(
                        selectedActivity.customerId
                      )}
                    </div>

                  </div>


                  <div className="
                    activity-detail-box
                  ">

                    <div className="
                      activity-detail-label
                    ">
                      Employee
                    </div>

                    <div className="
                      activity-detail-value
                    ">
                      {getUserName(
                        selectedActivity.userId
                      )}
                    </div>

                  </div>


                  <div className="
                    activity-detail-box
                  ">

                    <div className="
                      activity-detail-label
                    ">
                      Subject
                    </div>

                    <div className="
                      activity-detail-value
                    ">
                      {
                        selectedActivity.subject ||
                        "-"
                      }
                    </div>

                  </div>


                  <div className="
                    activity-detail-box
                    full
                  ">

                    <div className="
                      activity-detail-label
                    ">
                      Description
                    </div>

                    <div className="
                      activity-detail-value
                    ">
                      {
                        selectedActivity.description ||
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

export default Activities;