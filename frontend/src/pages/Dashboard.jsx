import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import logo from "../assets/priyonix_logo.jpeg";

function Dashboard() {

  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [followUps, setFollowUps] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState("");

  const user = useMemo(() => {

    try {

      return JSON.parse(localStorage.getItem("crmUser")) || {};

    } catch {

      return {};

    }

  }, []);

  useEffect(() => {

    loadDashboard();

  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setDashboardError("");

    try {
      const results = await Promise.allSettled([
        api.get("/leads"),
        api.get("/customers"),
        api.get("/follow-ups"),
        api.get("/tasks"),
      ]);

      const readArray = (result) =>
        result.status === "fulfilled" && Array.isArray(result.value.data)
          ? result.value.data
          : [];

      // Clear a failed section rather than silently showing stale values.
      setLeads(readArray(results[0]));
      setCustomers(readArray(results[1]));
      setFollowUps(readArray(results[2]));
      setTasks(readArray(results[3]));

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Dashboard request ${index + 1} failed:`, result.reason);
        }
      });

      const failedCount = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failedCount === results.length) {
        setDashboardError(
          "Dashboard data could not be loaded. Check your connection or session, then try again."
        );
      } else if (failedCount > 0) {
        setDashboardError(
          `${failedCount} dashboard section${failedCount > 1 ? "s" : ""} could not be loaded. Some metrics may be incomplete.`
        );
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setDashboardError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const normalize = (value) =>

    String(value || "")

      .trim()

      .toUpperCase();

  const totalLeads = leads.length;

  const newLeads = leads.filter(

    (lead) => normalize(lead.status) === "NEW"

  ).length;

  const wonLeads = leads.filter(

    (lead) => normalize(lead.status) === "WON"

  ).length;

  const lostLeads = leads.filter(

    (lead) => normalize(lead.status) === "LOST"

  ).length;

  const activeLeads = leads.filter(

    (lead) =>

      !["WON", "LOST"].includes(normalize(lead.status))

  ).length;

  const pendingFollowUps = followUps.filter(

    (item) =>

      !["COMPLETED", "CANCELLED"].includes(

        normalize(item.status)

      )

  ).length;

  const pendingTasks = tasks.filter(

    (task) =>

      !["COMPLETED", "DONE", "CANCELLED"].includes(

        normalize(task.status)

      )

  ).length;

  const completedTasks = tasks.filter((task) =>

    ["COMPLETED", "DONE"].includes(normalize(task.status))

  ).length;

  const conversionRate =

    totalLeads > 0

      ? Math.round((wonLeads / totalLeads) * 100)

      : 0;

  const pipelineStages = [

    "NEW",

    "CONTACTED",

    "QUALIFIED",

    "DISCUSSION",

    "PROPOSAL",

    "WON",

  ];

  const pipeline = pipelineStages.map((stage) => ({

    name: stage,

    count: leads.filter(

      (lead) => normalize(lead.status) === stage

    ).length,

  }));

  const maxPipeline = Math.max(

    ...pipeline.map((item) => item.count),

    1

  );

  const recentLeads = [...leads]

    .sort((a, b) => (b.id || 0) - (a.id || 0))

    .slice(0, 5);

  const recentTasks = [...tasks]

    .sort((a, b) => (b.id || 0) - (a.id || 0))

    .slice(0, 5);

  const getInitial = () => {

    if (user?.name) {

      return user.name.charAt(0).toUpperCase();

    }

    return "P";

  };

  return (

    <>

      <style>{`

        * {

          box-sizing: border-box;

        }

        .dashboard {

          min-height: 100vh;

          padding: 32px;

          overflow: hidden;

          position: relative;

          color: #172033;

          background:

            radial-gradient(

              circle at 76% 12%,

              rgba(99, 102, 241, 0.12),

              transparent 28%

            ),

            radial-gradient(

              circle at 10% 80%,

              rgba(14, 165, 233, 0.08),

              transparent 30%

            ),

            linear-gradient(

              135deg,

              #f8faff 0%,

              #f4f7ff 48%,

              #fafaff 100%

            );

          font-family:

            Inter,

            ui-sans-serif,

            system-ui,

            -apple-system,

            BlinkMacSystemFont,

            "Segoe UI",

            sans-serif;

        }

        .dashboard::before {

          content: "";

          position: fixed;

          width: 500px;

          height: 500px;

          right: -220px;

          top: -220px;

          border-radius: 50%;

          background: rgba(99, 102, 241, 0.08);

          filter: blur(40px);

          pointer-events: none;

        }

        .topbar {

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 20px;

          margin-bottom: 30px;

          position: relative;

          z-index: 20;

        }

        .welcome-small {

          margin: 0 0 7px;

          color: #64748b;

          font-size: 16px;

          font-weight: 700;

          letter-spacing: 0.04em;

          text-transform: uppercase;

        }

        .welcome-title {

          margin: 0;

          font-size: clamp(30px, 3vw, 44px);

          line-height: 1.1;

          color: #111827;

          font-weight: 850;

          letter-spacing: -1.5px;

        }

        .welcome-title span {

          background: linear-gradient(

            90deg,

            #4f46e5,

            #7c3aed,

            #0ea5e9

          );

          -webkit-background-clip: text;

          background-clip: text;

          color: transparent;

        }

        .welcome-description {

          margin: 10px 0 0;

          color: #64748b;

          font-size: 17px;

          line-height: 1.6;

        }

        .topbar-right {

          display: flex;

          align-items: center;

          gap: 13px;

        }

        .refresh-button {

          height: 48px;

          padding: 0 19px;

          border: 1px solid #e2e8f0;

          border-radius: 14px;

          background: rgba(255, 255, 255, 0.9);

          color: #334155;

          font-size: 15px;

          font-weight: 750;

          cursor: pointer;

          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);

          transition: 0.2s ease;

        }

        .refresh-button:hover {

          transform: translateY(-2px);

          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);

        }

        .profile-chip {

          display: flex;

          align-items: center;

          gap: 11px;

          padding: 7px 14px 7px 7px;

          border-radius: 16px;

          border: 1px solid #e2e8f0;

          background: rgba(255, 255, 255, 0.9);

          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);

        }

        .profile-avatar {

          width: 42px;

          height: 42px;

          display: grid;

          place-items: center;

          border-radius: 13px;

          background: linear-gradient(135deg, #4f46e5, #7c3aed);

          color: white;

          font-weight: 900;

          font-size: 18px;

        }

        .profile-name {

          margin: 0;

          font-size: 15px;

          color: #172033;

          font-weight: 800;

        }

        .profile-role {

          margin: 2px 0 0;

          color: #94a3b8;

          font-size: 12px;

          font-weight: 700;

        }

        /* ================================

           HERO

        ================================= */

        .hero {

          min-height: 620px;

          position: relative;

          overflow: hidden;

          display: grid;

          grid-template-columns: minmax(0, 0.92fr) minmax(520px, 1.08fr);

          align-items: center;

          border-radius: 34px;

          padding: 52px;

          margin-bottom: 30px;

          background:

            radial-gradient(

              circle at 74% 45%,

              rgba(89, 71, 255, 0.3),

              transparent 25%

            ),

            radial-gradient(

              circle at 90% 20%,

              rgba(0, 217, 255, 0.16),

              transparent 22%

            ),

            radial-gradient(

              circle at 30% 90%,

              rgba(122, 67, 255, 0.13),

              transparent 25%

            ),

            linear-gradient(

              135deg,

              #090b24 0%,

              #10113c 48%,

              #080a25 100%

            );

          box-shadow:

            0 35px 70px rgba(15, 23, 42, 0.2),

            inset 0 1px 0 rgba(255, 255, 255, 0.1);

        }

        .space-grid {

          position: absolute;

          inset: 0;

          opacity: 0.25;

          background-image:

            linear-gradient(

              rgba(255,255,255,0.025) 1px,

              transparent 1px

            ),

            linear-gradient(

              90deg,

              rgba(255,255,255,0.025) 1px,

              transparent 1px

            );

          background-size: 55px 55px;

          transform: perspective(500px) rotateX(58deg) scale(1.5);

          transform-origin: bottom;

        }

        .stars,

        .stars::before,

        .stars::after {

          position: absolute;

          content: "";

          width: 3px;

          height: 3px;

          border-radius: 50%;

          background: white;

          box-shadow:

            80px 70px white,

            190px 130px rgba(255,255,255,.8),

            340px 50px rgba(255,255,255,.65),

            510px 120px white,

            680px 65px rgba(255,255,255,.8),

            800px 180px white,

            920px 80px rgba(255,255,255,.7),

            1030px 210px white,

            1140px 100px rgba(255,255,255,.65),

            1280px 170px white,

            100px 360px rgba(255,255,255,.8),

            270px 460px white,

            450px 330px rgba(255,255,255,.6),

            690px 450px white,

            890px 350px rgba(255,255,255,.8),

            1110px 490px white;

          animation: twinkle 3s ease-in-out infinite alternate;

        }

        .stars {

          left: 0;

          top: 0;

        }

        .stars::before {

          left: 40px;

          top: 100px;

          transform: scale(0.6);

          opacity: 0.7;

        }

        .stars::after {

          left: -80px;

          top: 210px;

          transform: scale(0.35);

          opacity: 0.5;

        }

        @keyframes twinkle {

          from {

            opacity: 0.35;

          }

          to {

            opacity: 1;

          }

        }

        .hero-copy {

          position: relative;

          z-index: 10;

          min-width: 0;

          max-width: 570px;

        }

        .hero-badge {

          display: inline-flex;

          align-items: center;

          gap: 9px;

          padding: 9px 14px;

          border-radius: 100px;

          margin-bottom: 22px;

          border: 1px solid rgba(139, 140, 255, 0.25);

          background: rgba(102, 89, 255, 0.1);

          color: #c7d2fe;

          font-size: 14px;

          font-weight: 800;

        }

        .badge-dot {

          width: 9px;

          height: 9px;

          border-radius: 50%;

          background: #22d3ee;

          box-shadow: 0 0 14px #22d3ee;

        }

        .hero-title {

          margin: 0;

          color: white;

          font-size: clamp(42px, 5vw, 68px);

          line-height: 1.02;

          letter-spacing: -2.7px;

          font-weight: 900;

        }

        .hero-title span {

          background: linear-gradient(

            90deg,

            #9da5ff,

            #d8b4fe,

            #67e8f9

          );

          -webkit-background-clip: text;

          background-clip: text;

          color: transparent;

        }

        .hero-description {

          max-width: 520px;

          margin: 22px 0 0;

          color: #aeb8d5;

          font-size: 18px;

          line-height: 1.75;

          font-weight: 500;

        }

        .hero-buttons {

          display: flex;

          flex-wrap: wrap;

          gap: 13px;

          margin-top: 30px;

        }

        .hero-button {

          border: 0;

          padding: 15px 22px;

          border-radius: 14px;

          font-size: 15px;

          font-weight: 800;

          cursor: pointer;

          transition: 0.25s ease;

        }

        .hero-button.primary {

          color: white;

          background: linear-gradient(

            135deg,

            #6366f1,

            #8b5cf6

          );

          box-shadow: 0 12px 28px rgba(99, 102, 241, 0.3);

        }

        .hero-button.secondary {

          color: #dbeafe;

          border: 1px solid rgba(255,255,255,0.15);

          background: rgba(255,255,255,0.07);

        }

        .hero-button:hover {

          transform: translateY(-3px);

        }

        .mini-stats {

          display: flex;

          flex-wrap: wrap;

          gap: 30px;

          margin-top: 38px;

        }

        .mini-stat strong {

          display: block;

          color: white;

          font-size: 25px;

          font-weight: 900;

        }

        .mini-stat span {

          display: block;

          margin-top: 3px;

          color: #7f8bab;

          font-size: 13px;

          font-weight: 700;

        }

        /* ================================

           PLANET SYSTEM

        ================================= */

        .planet-area {

          position: relative;

          z-index: 8;

          min-width: 0;

          max-width: 100%;

          height: 530px;

          display: flex;

          align-items: center;

          justify-content: center;

          perspective: 1200px;

          overflow: visible;

        }

        .planet-system {

          position: relative;

          width: 490px;

          height: 490px;

          display: flex;

          align-items: center;

          justify-content: center;

          transform-style: preserve-3d;

        }

        .planet-light {

          position: absolute;

          width: 400px;

          height: 400px;

          border-radius: 50%;

          background: rgba(86, 68, 255, 0.22);

          filter: blur(65px);

          animation: glowPulse 3.5s ease-in-out infinite;

        }

        @keyframes glowPulse {

          0%,

          100% {

            transform: scale(0.9);

            opacity: 0.55;

          }

          50% {

            transform: scale(1.12);

            opacity: 1;

          }

        }

        /* MAIN LOGO PLANET */

        .logo-planet {

          position: absolute;

          z-index: 20;

          width: 245px;

          height: 245px;

          border-radius: 50%;

          display: flex;

          justify-content: center;

          align-items: center;

          overflow: hidden;

          background:

            radial-gradient(

              circle at 31% 24%,

              rgba(255,255,255,.9),

              rgba(170,180,255,.28) 8%,

              transparent 23%

            ),

            radial-gradient(

              circle at 65% 70%,

              #4223a8,

              transparent 48%

            ),

            linear-gradient(

              135deg,

              #172c73 0%,

              #5134d8 38%,

              #6d28d9 68%,

              #111c55 100%

            );

          box-shadow:

            inset -35px -30px 60px rgba(2, 6, 23, 0.75),

            inset 25px 20px 45px rgba(255,255,255,0.14),

            0 0 35px rgba(96, 85, 255, 0.65),

            0 0 85px rgba(74, 61, 255, 0.38),

            0 35px 55px rgba(0,0,0,0.55);

          animation:

            planetFloat 5s ease-in-out infinite;

        }

        .logo-planet::before {

          content: "";

          position: absolute;

          inset: -30%;

          background:

            repeating-linear-gradient(

              8deg,

              transparent 0px,

              transparent 24px,

              rgba(255,255,255,0.045) 25px,

              rgba(255,255,255,0.045) 34px,

              transparent 35px,

              transparent 58px

            );

          border-radius: 50%;

          animation: planetSurface 15s linear infinite;

        }

        .logo-planet::after {

          content: "";

          position: absolute;

          inset: 0;

          border-radius: 50%;

          background:

            radial-gradient(

              circle at 30% 25%,

              rgba(255,255,255,.25),

              transparent 25%

            ),

            linear-gradient(

              90deg,

              transparent 45%,

              rgba(0,0,0,.3) 100%

            );

          pointer-events: none;

        }

        @keyframes planetSurface {

          from {

            transform: translateX(-20%) rotate(0deg);

          }

          to {

            transform: translateX(20%) rotate(360deg);

          }

        }

        @keyframes planetFloat {

          0%,

          100% {

            transform: translateY(0px) rotate(-2deg);

          }

          50% {

            transform: translateY(-15px) rotate(2deg);

          }

        }

        .planet-logo-holder {

          position: relative;

          z-index: 5;

          width: 155px;

          height: 155px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          padding: 18px;

          background: rgba(255,255,255,0.94);

          box-shadow:

            0 15px 40px rgba(0,0,0,.3),

            inset 0 0 20px rgba(99,102,241,.12);

        }

        .planet-logo {

          display: block;

          width: 100%;

          height: 100%;

          object-fit: contain;

          border-radius: 50%;

        }

        /* PLANET RING */

        .planet-ring {

          position: absolute;

          z-index: 15;

          width: 440px;

          height: 155px;

          border-radius: 50%;

          transform-style: preserve-3d;

          transform: rotateX(67deg) rotateZ(-13deg);

          border: 15px solid rgba(125, 132, 255, 0.26);

          box-shadow:

            0 0 0 2px rgba(190, 196, 255, 0.14),

            0 0 28px rgba(99, 102, 241, 0.3),

            inset 0 0 24px rgba(103, 232, 249, 0.18);

          animation: ringSpin 7s linear infinite;

        }

        .planet-ring::before {

          content: "";

          position: absolute;

          inset: -25px;

          border-radius: 50%;

          border: 5px solid rgba(103, 232, 249, 0.18);

        }

        .planet-ring::after {

          content: "";

          position: absolute;

          inset: 12px;

          border-radius: 50%;

          border: 4px solid rgba(216, 180, 254, 0.16);

        }

        @keyframes ringSpin {

          0% {

            transform:

              rotateX(67deg)

              rotateZ(-13deg)

              rotateY(0deg);

          }

          100% {

            transform:

              rotateX(67deg)

              rotateZ(347deg)

              rotateY(360deg);

          }

        }

        /* OUTER ORBIT */

        .outer-orbit {

          position: absolute;

          z-index: 5;

          width: 475px;

          height: 475px;

          border-radius: 50%;

          border: 1px solid rgba(148, 163, 255, 0.19);

          transform: rotateX(72deg) rotateZ(28deg);

          animation: orbitRotate 16s linear infinite;

        }

        .outer-orbit::before {

          content: "";

          position: absolute;

          width: 13px;

          height: 13px;

          border-radius: 50%;

          left: 45px;

          top: 38px;

          background: #67e8f9;

          box-shadow:

            0 0 10px #67e8f9,

            0 0 25px #22d3ee;

        }

        @keyframes orbitRotate {

          from {

            transform:

              rotateX(72deg)

              rotateZ(28deg);

          }

          to {

            transform:

              rotateX(72deg)

              rotateZ(388deg);

          }

        }

        .vertical-orbit {

          position: absolute;

          width: 355px;

          height: 355px;

          border: 1px solid rgba(167, 139, 250, 0.15);

          border-radius: 50%;

          transform: rotateY(72deg) rotateX(22deg);

          animation: verticalSpin 12s linear infinite reverse;

        }

        @keyframes verticalSpin {

          from {

            transform:

              rotateY(72deg)

              rotateX(22deg)

              rotateZ(0deg);

          }

          to {

            transform:

              rotateY(72deg)

              rotateX(22deg)

              rotateZ(360deg);

          }

        }

        /* FLOATING DATA CARDS */

        .floating-card {

          position: absolute;

          z-index: 30;

          min-width: 150px;

          padding: 14px 17px;

          border-radius: 17px;

          border: 1px solid rgba(255,255,255,0.13);

          background: rgba(15, 18, 58, 0.7);

          backdrop-filter: blur(16px);

          box-shadow: 0 18px 38px rgba(0,0,0,.25);

          animation: cardFloat 4s ease-in-out infinite;

        }

        .floating-card strong {

          display: block;

          color: white;

          font-size: 23px;

          font-weight: 900;

        }

        .floating-card span {

          display: block;

          margin-top: 3px;

          color: #9aa7c8;

          font-size: 12px;

          font-weight: 700;

        }

        .floating-card.one {

          top: 50px;

          left: 8px;

        }

        .floating-card.two {

          right: -5px;

          top: 135px;

          animation-delay: -1.5s;

        }

        .floating-card.three {

          bottom: 48px;

          left: 25px;

          animation-delay: -2.5s;

        }

        @keyframes cardFloat {

          0%,

          100% {

            transform: translateY(0px);

          }

          50% {

            transform: translateY(-12px);

          }

        }

        .planet-shadow {

          position: absolute;

          bottom: 55px;

          width: 260px;

          height: 40px;

          border-radius: 50%;

          background: rgba(0,0,0,.55);

          filter: blur(18px);

          animation: shadowPulse 5s ease-in-out infinite;

        }

        @keyframes shadowPulse {

          0%,

          100% {

            transform: scale(1);

            opacity: 0.5;

          }

          50% {

            transform: scale(.85);

            opacity: .3;

          }

        }

        /* ================================

           KPI CARDS

        ================================= */

        .section-heading {

          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          gap: 20px;

          margin: 38px 0 18px;

        }

        .section-heading h2 {

          margin: 0;

          color: #172033;

          font-size: 27px;

          letter-spacing: -0.6px;

        }

        .section-heading p {

          margin: 5px 0 0;

          color: #64748b;

          font-size: 15px;

        }

        .kpi-grid {

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 18px;

        }

        .kpi-card {

          position: relative;

          overflow: hidden;

          min-height: 165px;

          padding: 23px;

          border-radius: 23px;

          background: white;

          border: 1px solid #e8ecf5;

          box-shadow: 0 12px 35px rgba(15,23,42,.055);

          transition: .25s ease;

        }

        .kpi-card:hover {

          transform: translateY(-5px);

          box-shadow: 0 18px 45px rgba(15,23,42,.1);

        }

        .kpi-card::after {

          content: "";

          position: absolute;

          width: 90px;

          height: 90px;

          right: -25px;

          top: -25px;

          border-radius: 50%;

          background: var(--accent-soft);

        }

        .kpi-icon {

          width: 46px;

          height: 46px;

          display: grid;

          place-items: center;

          border-radius: 14px;

          background: var(--accent-soft);

          color: var(--accent);

          font-size: 21px;

        }

        .kpi-value {

          margin-top: 19px;

          color: #111827;

          font-size: 34px;

          line-height: 1;

          font-weight: 900;

        }

        .kpi-label {

          margin-top: 8px;

          color: #64748b;

          font-size: 15px;

          font-weight: 700;

        }

        /* ================================

           CONTENT CARDS

        ================================= */

        .content-grid {

          display: grid;

          grid-template-columns: 1.15fr .85fr;

          gap: 20px;

          margin-top: 20px;

        }

        .panel {

          padding: 26px;

          border-radius: 24px;

          background: white;

          border: 1px solid #e8ecf5;

          box-shadow: 0 12px 35px rgba(15,23,42,.05);

        }

        .panel-title {

          margin: 0;

          color: #172033;

          font-size: 21px;

          font-weight: 850;

        }

        .panel-subtitle {

          margin: 6px 0 22px;

          color: #94a3b8;

          font-size: 14px;

        }

        .pipeline-row {

          display: grid;

          grid-template-columns: 105px 1fr 45px;

          align-items: center;

          gap: 12px;

          margin-bottom: 17px;

        }

        .pipeline-name {

          color: #475569;

          font-size: 13px;

          font-weight: 800;

        }

        .pipeline-track {

          height: 11px;

          overflow: hidden;

          border-radius: 100px;

          background: #edf0f7;

        }

        .pipeline-fill {

          height: 100%;

          border-radius: inherit;

          min-width: 5px;

          background: linear-gradient(

            90deg,

            #6366f1,

            #8b5cf6,

            #22d3ee

          );

        }

        .pipeline-count {

          color: #111827;

          text-align: right;

          font-weight: 900;

        }

        .action-grid {

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 12px;

        }

        .action-button {

          min-height: 105px;

          padding: 18px;

          text-align: left;

          border: 1px solid #e6eaf2;

          border-radius: 18px;

          background: #fafbff;

          cursor: pointer;

          transition: .2s ease;

        }

        .action-button:hover {

          transform: translateY(-3px);

          background: #f5f3ff;

          border-color: #c4b5fd;

        }

        .action-icon {

          font-size: 24px;

        }

        .action-button strong {

          display: block;

          margin-top: 9px;

          color: #172033;

          font-size: 15px;

        }

        .action-button span {

          display: block;

          margin-top: 3px;

          color: #94a3b8;

          font-size: 12px;

        }

        .tables-grid {

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 20px;

          margin-top: 20px;

        }

        .simple-list {

          display: flex;

          flex-direction: column;

          gap: 10px;

        }

        .list-item {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding: 15px;

          border-radius: 15px;

          background: #f8fafc;

          border: 1px solid #eef2f7;

        }

        .list-item-main {

          min-width: 0;

        }

        .list-item-title {

          margin: 0;

          color: #1e293b;

          font-size: 15px;

          font-weight: 800;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }

        .list-item-text {

          margin: 5px 0 0;

          color: #94a3b8;

          font-size: 12px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }

        .status-pill {

          flex-shrink: 0;

          padding: 7px 10px;

          border-radius: 100px;

          color: #4f46e5;

          background: #eef2ff;

          font-size: 11px;

          font-weight: 900;

        }

        .empty-state {

          padding: 28px;

          border-radius: 16px;

          text-align: center;

          color: #94a3b8;

          background: #f8fafc;

          font-size: 14px;

        }

        .loading-screen {

          min-height: 500px;

          display: grid;

          place-items: center;

          font-size: 18px;

          font-weight: 800;

          color: #6366f1;

        }

        @media (max-width: 1250px) {

          .hero {

            grid-template-columns: minmax(0, 1fr);

            padding: 44px 40px;

          }

          .planet-system {

            transform: scale(.88);

          }

          .kpi-grid {

            grid-template-columns: repeat(2, 1fr);

          }

        }

        @media (max-width: 1000px) {

          .dashboard {

            padding: 22px;

          }

          .hero {

            grid-template-columns: minmax(0, 1fr);

            padding: 40px 30px;

          }

          .hero-copy {

            max-width: 720px;

          }

          .planet-area {

            height: 520px;

          }

          .content-grid,

          .tables-grid {

            grid-template-columns: 1fr;

          }

        }

        @media (max-width: 700px) {

          .dashboard {

            padding: 14px;

          }

          .topbar {

            align-items: flex-start;

          }

          .topbar-right {

            display: none;

          }

          .welcome-title {

            font-size: 30px;

          }

          .welcome-description {

            font-size: 15px;

          }

          .hero {

            min-height: auto;

            padding: 35px 20px 10px;

            border-radius: 25px;

          }

          .hero-title {

            font-size: 42px;

          }

          .hero-description {

            font-size: 16px;

          }

          .planet-area {

            height: 420px;

          }

          .planet-system {

            transform: scale(.72);

          }

          .kpi-grid {

            grid-template-columns: 1fr;

          }

          .action-grid {

            grid-template-columns: 1fr;

          }

          .panel {

            padding: 20px;

          }

        }

        @media (max-width: 480px) {

          .hero-title {

            font-size: 36px;

          }

          .planet-area {

            height: 350px;

          }

          .planet-system {

            transform: scale(.58);

          }

          .mini-stats {

            gap: 18px;

          }

          .hero-buttons {

            flex-direction: column;

          }

          .hero-button {

            width: 100%;

          }

          .section-heading {

            flex-direction: column;

            align-items: flex-start;

            gap: 10px;

          }

          .section-heading h2 {

            font-size: 22px;

          }

          .panel-title {

            font-size: 18px;

          }

          .pipeline-row {

            grid-template-columns: 72px 1fr 30px;

            gap: 8px;

          }

          .floating-card {

            min-width: 0;

            padding: 10px 12px;

          }

          .floating-card strong {

            font-size: 18px;

          }

          .floating-card span {

            font-size: 10px;

          }

        }

        @media (max-width: 360px) {

          .dashboard {

            padding: 10px;

          }

          .hero {

            border-radius: 18px;

            padding: 28px 14px 8px;

          }

          .hero-title {

            font-size: 32px;

          }

          .planet-area {

            height: 300px;

          }

          .planet-system {

            transform: scale(.5);

          }

          .section-heading h2 {

            font-size: 20px;

          }

          .panel-title {

            font-size: 17px;

          }

        }

        @media (max-height: 480px) and (orientation: landscape) {

          .loading-screen {

            min-height: 220px;

          }

          .hero {

            min-height: auto;

          }

        }

        /* ===== DARK SPACE THEME OVERRIDES ===== */
        /* Match the Leads page with a clear inner workspace frame. */
        .dashboard {
          display: block;
          position: relative;
          z-index: 0;
          width: 100%;
          min-width: 0;
          min-height: calc(100vh - 112px);
          margin: 0 0 18px;
          box-sizing: border-box;
          border: 1px solid rgba(124, 157, 255, 0.16);
          border-radius: 22px;
          color: #f4f7ff;
          background:
            radial-gradient(circle at 78% 10%, rgba(70, 90, 255, 0.12), transparent 30%),
            radial-gradient(circle at 12% 80%, rgba(53, 229, 255, 0.06), transparent 28%),
            #071329;
          font-family: Inter, "Segoe UI", Arial, sans-serif;
        }

        @media (max-width: 700px) {
          .dashboard {
            border-radius: 16px;
            margin-bottom: 12px;
          }
        }
        .welcome-small { color: #8eaddc; }
        .welcome-title { color: #f4f7ff; }
        .welcome-description { color: #a9bbda; }

        /* Keep the dashboard's duplicate toolbar controls hidden. */
        .dashboard .topbar-right { display: none !important; }
        .refresh-button, .profile-chip { display: none !important; }

        /* Main cards */
        .panel, .kpi-card {
          color: #f4f7ff;
          background: rgba(13, 27, 56, 0.96);
          border: 1px solid rgba(124, 157, 255, 0.22);
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.18);
        }

        /* Section heading */
        .dashboard .section-heading h2 { color: #f4f7ff !important; }
        .dashboard .section-heading p { color: #a9bbda !important; }

        /* KPI cards and labels */
        .dashboard .kpi-value { color: #f4f7ff !important; }
        .dashboard .kpi-label { color: #a9bbda !important; }
        .dashboard .kpi-icon {
          color: var(--accent) !important;
          background: var(--accent-soft) !important;
        }

        /* Sales pipeline */
        .dashboard .pipeline-name { color: #b7c6e5 !important; }
        .dashboard .pipeline-count { color: #f4f7ff !important; }
        .dashboard .pipeline-track { background: #263653 !important; }

        /* Panel headings and supporting text */
        .dashboard .panel-title { color: #f4f7ff !important; }
        .dashboard .panel-subtitle { color: #a9bbda !important; }

        /* Action Center buttons */
        .dashboard .action-button {
          color: #f4f7ff;
          background: #142544 !important;
          border: 1px solid #30466f !important;
        }
        .dashboard .action-icon { color: #9ec5ff; }
        .dashboard .action-button strong { color: #f4f7ff !important; }
        .dashboard .action-button span { color: #a9bbda !important; }
        .dashboard .action-button:hover {
          background: #1b3157 !important;
          border-color: #746bff !important;
        }

        /* Recent leads and recent tasks */
        .dashboard .list-item {
          background: #142544 !important;
          border: 1px solid #263d68 !important;
        }
        .dashboard .list-item-title { color: #f4f7ff !important; }
        .dashboard .list-item-text { color: #a9bbda !important; }
        .dashboard .status-pill {
          background: rgba(57, 140, 255, 0.14) !important;
          color: #9ec5ff !important;
        }
        .dashboard .empty-state {
          color: #a9bbda !important;
          background: #142544 !important;
          border: 1px solid #263d68;
        }
        .dashboard .loading-screen { color: #dbeafe; }

      `}</style>

      <div className="dashboard">

        {dashboardError && (
          <div
            role="alert"
            style={{
              marginBottom: 18,
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid #f3a6ad",
              background: "#fff1f2",
              color: "#9f1239",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>{dashboardError}</span>
            <button type="button" onClick={loadDashboard}>
              Retry
            </button>
          </div>
        )}

        {/* TOP HEADER */}

        <div className="topbar">

          <div>

            <p className="welcome-small">

              PriyoniX CRM

            </p>

            <h1 className="welcome-title">

              Welcome back,{" "}

              <span>{user?.name || "Admin"}</span>

            </h1>

            <p className="welcome-description">

              Here is what is happening with your CRM today.

            </p>

          </div>

          <div className="topbar-right">

            <button

              className="refresh-button"

              onClick={loadDashboard}

            >

              ↻ Refresh

            </button>

            <div className="profile-chip">

              <div className="profile-avatar">

                {getInitial()}

              </div>

              <div>

                <p className="profile-name">

                  {user?.name || "Admin"}

                </p>

                <p className="profile-role">

                  {user?.role || "USER"}

                </p>

              </div>

            </div>

          </div>

        </div>

        {loading ? (

          <div className="loading-screen">

            Loading CRM Dashboard...

          </div>

        ) : (

          <>

            {/* SPACE HERO */}

            <section className="hero">

              <div className="space-grid"></div>

              <div className="stars"></div>

              <div className="hero-copy">

                <div className="hero-badge">

                  <span className="badge-dot"></span>

                  CRM SYSTEM ONLINE

                </div>

                <h2 className="hero-title">

                  Your business.

                  <br />

                  One <span>universe.</span>

                </h2>

                <p className="hero-description">

                  Manage leads, customers, follow-ups and

                  tasks from one connected PriyoniX CRM

                  workspace.

                </p>

                <div className="hero-buttons">

                  <button

                    className="hero-button primary"

                    onClick={() => navigate("/leads")}

                  >

                    Manage Leads →

                  </button>

                  <button

                    className="hero-button secondary"

                    onClick={() => navigate("/customers")}

                  >

                    View Customers

                  </button>

                </div>

                <div className="mini-stats">

                  <div className="mini-stat">

                    <strong>{totalLeads}</strong>

                    <span>Total Leads</span>

                  </div>

                  <div className="mini-stat">

                    <strong>{customers.length}</strong>

                    <span>Customers</span>

                  </div>

                  <div className="mini-stat">

                    <strong>{conversionRate}%</strong>

                    <span>Conversion</span>

                  </div>

                </div>

              </div>

              {/* 3D PLANET */}

              <div className="planet-area">

                <div className="planet-system">

                  <div className="planet-light"></div>

                  <div className="outer-orbit"></div>

                  <div className="vertical-orbit"></div>

                  {/* SATURN / JUPITER RING */}

                  <div className="planet-ring"></div>

                  {/* PRIYONIX PLANET */}

                  <div className="logo-planet">

                    <div className="planet-logo-holder">

                      <img

                        src={logo}

                        alt="PriyoniX"

                        className="planet-logo"

                      />

                    </div>

                  </div>

                  {/* FLOATING CRM DATA */}

                  <div className="floating-card one">

                    <strong>{activeLeads}</strong>

                    <span>Active Leads</span>

                  </div>

                  <div className="floating-card two">

                    <strong>{conversionRate}%</strong>

                    <span>Conversion Rate</span>

                  </div>

                  <div className="floating-card three">

                    <strong>{pendingTasks}</strong>

                    <span>Pending Tasks</span>

                  </div>

                  <div className="planet-shadow"></div>

                </div>

              </div>

            </section>

            {/* KPI SECTION */}

            <div className="section-heading">

              <div>

                <h2>CRM Overview</h2>

                <p>

                  Live overview of your sales and customer

                  activity.

                </p>

              </div>

            </div>

            <div className="kpi-grid">

              <KpiCard

                icon="◎"

                value={totalLeads}

                label="Total Leads"

                accent="#4f46e5"

                soft="#eef2ff"

              />

              <KpiCard

                icon="✦"

                value={newLeads}

                label="New Leads"

                accent="#0284c7"

                soft="#e0f2fe"

              />

              <KpiCard

                icon="✓"

                value={wonLeads}

                label="Won Leads"

                accent="#059669"

                soft="#d1fae5"

              />

              <KpiCard

                icon="⌁"

                value={customers.length}

                label="Customers"

                accent="#7c3aed"

                soft="#f3e8ff"

              />

              <KpiCard

                icon="◷"

                value={pendingFollowUps}

                label="Pending Follow-Ups"

                accent="#d97706"

                soft="#fef3c7"

              />

              <KpiCard

                icon="▣"

                value={pendingTasks}

                label="Pending Tasks"

                accent="#db2777"

                soft="#fce7f3"

              />

              <KpiCard

                icon="✓"

                value={completedTasks}

                label="Completed Tasks"

                accent="#0891b2"

                soft="#cffafe"

              />

              <KpiCard

                icon="↗"

                value={`${conversionRate}%`}

                label="Conversion Rate"

                accent="#6366f1"

                soft="#e0e7ff"

              />

            </div>

            {/* PIPELINE + ACTIONS */}

            <div className="content-grid">

              <div className="panel">

                <h3 className="panel-title">

                  Sales Pipeline

                </h3>

                <p className="panel-subtitle">

                  Lead movement through your CRM pipeline.

                </p>

                {pipeline.map((stage) => (

                  <div

                    className="pipeline-row"

                    key={stage.name}

                  >

                    <div className="pipeline-name">

                      {stage.name}

                    </div>

                    <div className="pipeline-track">

                      <div

                        className="pipeline-fill"

                        style={{

                          width: `${

                            (stage.count / maxPipeline) *

                            100

                          }%`,

                        }}

                      ></div>

                    </div>

                    <div className="pipeline-count">

                      {stage.count}

                    </div>

                  </div>

                ))}

                <div

                  className="pipeline-row"

                  style={{ marginBottom: 0 }}

                >

                  <div className="pipeline-name">

                    LOST

                  </div>

                  <div className="pipeline-track">

                    <div

                      className="pipeline-fill"

                      style={{

                        width: `${

                          (lostLeads / maxPipeline) * 100

                        }%`,

                      }}

                    ></div>

                  </div>

                  <div className="pipeline-count">

                    {lostLeads}

                  </div>

                </div>

              </div>

              <div className="panel">

                <h3 className="panel-title">

                  Action Center

                </h3>

                <p className="panel-subtitle">

                  Quickly access important CRM modules.

                </p>

                <div className="action-grid">

                  <ActionButton

                    icon="+"

                    title="Add Lead"

                    text="Create a new opportunity"

                    onClick={() => navigate("/leads")}

                  />

                  <ActionButton

                    icon="◉"

                    title="Customers"

                    text="Manage customer records"

                    onClick={() =>

                      navigate("/customers")

                    }

                  />

                  <ActionButton

                    icon="◷"

                    title="Follow-Ups"

                    text="Check pending follow-ups"

                    onClick={() =>

                      navigate("/follow-ups")

                    }

                  />

                  <ActionButton

                    icon="✓"

                    title="Tasks"

                    text="Manage CRM tasks"

                    onClick={() => navigate("/tasks")}

                  />

                </div>

              </div>

            </div>

            {/* RECENT DATA */}

            <div className="tables-grid">

              <div className="panel">

                <h3 className="panel-title">

                  Recent Leads

                </h3>

                <p className="panel-subtitle">

                  Latest leads added to PriyoniX CRM.

                </p>

                {recentLeads.length === 0 ? (

                  <div className="empty-state">

                    No leads available yet.

                  </div>

                ) : (

                  <div className="simple-list">

                    {recentLeads.map((lead) => (

                      <div

                        className="list-item"

                        key={lead.id}

                      >

                        <div className="list-item-main">

                          <p className="list-item-title">

                            {lead.name}

                          </p>

                          <p className="list-item-text">

                            {lead.company ||

                              lead.email ||

                              "No company information"}

                          </p>

                        </div>

                        <div className="status-pill">

                          {lead.status || "NEW"}

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

              <div className="panel">

                <h3 className="panel-title">

                  Recent Tasks

                </h3>

                <p className="panel-subtitle">

                  Latest activities requiring attention.

                </p>

                {recentTasks.length === 0 ? (

                  <div className="empty-state">

                    No tasks available yet.

                  </div>

                ) : (

                  <div className="simple-list">

                    {recentTasks.map((task) => (

                      <div

                        className="list-item"

                        key={task.id}

                      >

                        <div className="list-item-main">

                          <p className="list-item-title">

                            {task.title}

                          </p>

                          <p className="list-item-text">

                            {task.dueDate

                              ? `Due ${task.dueDate}`

                              : task.description ||

                                "No due date"}

                          </p>

                        </div>

                        <div className="status-pill">

                          {task.status || "PENDING"}

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

          </>

        )}

      </div>

    </>

  );

}

function KpiCard({

  icon,

  value,

  label,

  accent,

  soft,

}) {

  return (

    <div

      className="kpi-card"

      style={{

        "--accent": accent,

        "--accent-soft": soft,

      }}

    >

      <div className="kpi-icon">

        {icon}

      </div>

      <div className="kpi-value">

        {value}

      </div>

      <div className="kpi-label">

        {label}

      </div>

    </div>

  );

}

function ActionButton({

  icon,

  title,

  text,

  onClick,

}) {

  return (

    <button

      className="action-button"

      onClick={onClick}

    >

      <div className="action-icon">

        {icon}

      </div>

      <strong>{title}</strong>

      <span>{text}</span>

    </button>

  );

}

export default Dashboard;
