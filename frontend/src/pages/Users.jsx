import { useEffect, useMemo, useRef, useState } from "react";

import api from "../services/api";



function Users() {

  const [users, setUsers] = useState([]);

  const [editingId, setEditingId] = useState(null);



  const [form, setForm] = useState({

    name: "",

    email: "",

    password: "",

    role: "EMPLOYEE",

    phone: "",

    active: true,

  });



  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");



  const formRef = useRef(null);

  const usersTableRef = useRef(null);



  useEffect(() => {

    loadUsers();

  }, []);



  const loadUsers = async () => {

    try {

      const response = await api.get("/users");

      setUsers(response.data || []);

    } catch (error) {

      console.error("Error loading users:", error);

      alert("Failed to load users.");

    }

  };



  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;



    setForm({

      ...form,

      [name]: type === "checkbox" ? checked : value,

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();



    try {

      const data = {

        name: form.name,

        email: form.email,

        password: form.password,

        role: form.role,

        phone: form.phone,

        active: form.active,

      };



      if (editingId) {

        await api.put(`/users/${editingId}`, data);

        alert("User updated successfully!");

      } else {

        await api.post("/users", data);

        alert("User created successfully!");

      }



      resetForm();

      await loadUsers();

    } catch (error) {

      console.error("Error saving user:", error);



      if (error.response?.data?.message) {

        alert(error.response.data.message);

      } else {

        alert("Failed to save user.");

      }

    }

  };



  const handleEdit = (user) => {

    setEditingId(user.id);



    setForm({

      name: user.name || "",

      email: user.email || "",

      password: "",

      role: user.role || "EMPLOYEE",

      phone: user.phone || "",

      active: user.active,

    });



    window.requestAnimationFrame(() => {

      formRef.current?.scrollIntoView({

        behavior: "smooth",

        block: "start",

      });

    });

  };



  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      alert("User deleted successfully!");
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);

      const status = error.response?.status;
      const responseData = error.response?.data;
      const serverMessage =
        typeof responseData === "string"
          ? responseData
          : responseData?.message ||
            responseData?.error ||
            responseData?.detail;

      let reason =
        serverMessage || error.message || "No additional details were returned.";

      if (!serverMessage && status === 401) {
        reason = "Your session may have expired. Sign in again and retry.";
      } else if (!serverMessage && status === 403) {
        reason = "Your account does not have permission to delete users.";
      } else if (!serverMessage && status === 404) {
        reason = "The user or delete endpoint was not found.";
      } else if (!serverMessage && status === 409) {
        reason = "The user may still be referenced by CRM records, so the server rejected deletion.";
      } else if (!error.response) {
        reason = "No response from the server. Check that the backend is running and the API URL is correct.";
      }

      alert(
        `Failed to delete user.\n\nHTTP status: ${status || "No response"}\nReason: ${reason}`
      );
    }
  };


  const handleToggleActive = async (user) => {

    try {

      const data = {

        name: user.name,

        email: user.email,

        password: user.password,

        role: user.role,

        phone: user.phone,

        active: !user.active,

      };



      await api.put(`/users/${user.id}`, data);

      await loadUsers();

    } catch (error) {

      console.error("Error updating user status:", error);

      alert("Failed to update user status.");

    }

  };



  const resetForm = () => {

    setEditingId(null);



    setForm({

      name: "",

      email: "",

      password: "",

      role: "EMPLOYEE",

      phone: "",

      active: true,

    });

  };



  const filteredUsers = useMemo(() => {

    const query = search.trim().toLowerCase();



    return users.filter((user) => {

      const matchesSearch =

        !query ||

        String(user.name || "").toLowerCase().includes(query) ||

        String(user.email || "").toLowerCase().includes(query) ||

        String(user.phone || "").toLowerCase().includes(query);



      const matchesRole =

        roleFilter === "ALL" ||

        String(user.role || "").toUpperCase() === roleFilter;



      const matchesStatus =

        statusFilter === "ALL" ||

        (statusFilter === "ACTIVE" && user.active) ||

        (statusFilter === "INACTIVE" && !user.active);



      return matchesSearch && matchesRole && matchesStatus;

    });

  }, [users, search, roleFilter, statusFilter]);



  const activeUsers = users.filter((user) => user.active).length;

  const inactiveUsers = users.filter((user) => !user.active).length;

  const adminUsers = users.filter(

    (user) => String(user.role || "").toUpperCase() === "ADMIN"

  ).length;



  const viewAllUsers = () => {

    setSearch("");

    setRoleFilter("ALL");

    setStatusFilter("ALL");



    window.requestAnimationFrame(() => {

      window.requestAnimationFrame(() => {

        usersTableRef.current?.scrollIntoView({

          behavior: "smooth",

          block: "start",

        });

      });

    });

  };



  return (

    <div className="users-page">

      <style>{`

        * {

          box-sizing: border-box;

        }



        .users-page {

          min-height: 100vh;

          padding: 0 0 50px;

          color: #edf3ff;

          font-family: Arial, Helvetica, sans-serif;

          background:

            radial-gradient(circle at 70% 18%, rgba(91,72,255,.18), transparent 27%),

            radial-gradient(circle at 25% 75%, rgba(56,189,248,.10), transparent 25%),

            linear-gradient(135deg, #090d2c 0%, #11164b 47%, #08182d 100%);

          overflow: hidden;

          position: relative;

        }



        .users-page::before {

          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          opacity: .8;

          background-image:

            radial-gradient(circle at 8% 13%, rgba(255,255,255,.9) 0 1px, transparent 1.7px),

            radial-gradient(circle at 21% 31%, rgba(255,255,255,.7) 0 1px, transparent 1.7px),

            radial-gradient(circle at 35% 11%, rgba(255,255,255,.8) 0 1px, transparent 1.7px),

            radial-gradient(circle at 48% 27%, rgba(255,255,255,.65) 0 1px, transparent 1.7px),

            radial-gradient(circle at 64% 10%, rgba(255,255,255,.9) 0 1px, transparent 1.7px),

            radial-gradient(circle at 78% 30%, rgba(255,255,255,.8) 0 1px, transparent 1.7px),

            radial-gradient(circle at 91% 15%, rgba(255,255,255,.65) 0 1px, transparent 1.7px),

            radial-gradient(circle at 84% 67%, rgba(255,255,255,.8) 0 1px, transparent 1.7px),

            radial-gradient(circle at 53% 74%, rgba(255,255,255,.65) 0 1px, transparent 1.7px),

            radial-gradient(circle at 16% 82%, rgba(255,255,255,.7) 0 1px, transparent 1.7px);

          animation: userStars 9s ease-in-out infinite alternate;

        }



        .users-page::after {

          content: "";

          position: absolute;

          width: 600px;

          height: 600px;

          left: -280px;

          top: 330px;

          border-radius: 50%;

          background: rgba(91,72,255,.13);

          filter: blur(100px);

          pointer-events: none;

        }



        .users-hero {

          min-height: 650px;

          position: relative;

          overflow: hidden;

          padding: 40px 36px 20px;

          border-bottom: 1px solid rgba(157,174,255,.12);

        }



        .users-hero-content {

          position: relative;

          z-index: 20;

          width: 49%;

          max-width: 590px;

          padding-top: 4px;

        }



        .users-status {

          display: inline-flex;

          align-items: center;

          gap: 9px;

          padding: 8px 14px;

          border: 1px solid rgba(120,143,255,.45);

          border-radius: 999px;

          background: rgba(25,35,88,.48);

          color: #d9e1ff;

          font-size: 11px;

          font-weight: 900;

          letter-spacing: .02em;

          box-shadow: 0 0 25px rgba(72,91,255,.12);

        }



        .users-status-dot {

          width: 8px;

          height: 8px;

          border-radius: 50%;

          background: #28d7f3;

          box-shadow: 0 0 12px #28d7f3;

          animation: statusPulse 1.8s ease-in-out infinite;

        }



        .users-title {

          margin: 30px 0 0;

          color: #fff;

          font-size: 49px;

          line-height: 1.04;

          font-weight: 900;

          letter-spacing: -2.4px;

        }



        .users-title span {

          display: block;

          color: #a58aff;

        }



        .users-description {

          max-width: 500px;

          margin: 20px 0 0;

          color: #aebbd8;

          font-size: 15px;

          line-height: 1.7;

          font-weight: 600;

        }



        .users-hero-actions {

          display: flex;

          gap: 12px;

          flex-wrap: wrap;

          margin-top: 26px;

        }



        .users-primary-button,

        .users-secondary-button {

          min-height: 47px;

          padding: 0 20px;

          border-radius: 12px;

          font-size: 13px;

          font-weight: 900;

          cursor: pointer;

          transition: .25s ease;

        }



        .users-primary-button {

          border: 0;

          color: white;

          background: linear-gradient(135deg, #6f4cff, #a14cf2);

          box-shadow: 0 12px 30px rgba(103,75,255,.32);

        }



        .users-primary-button:hover {

          transform: translateY(-2px);

          box-shadow: 0 16px 35px rgba(103,75,255,.46);

        }



        .users-secondary-button {

          border: 1px solid rgba(141,157,227,.25);

          color: #dce5ff;

          background: rgba(34,42,96,.56);

        }



        .users-secondary-button:hover {

          border-color: rgba(154,139,255,.65);

          background: rgba(62,53,128,.62);

        }



        .users-mini-stats {

          display: flex;

          gap: 34px;

          margin-top: 36px;

        }



        .users-mini-stat strong {

          display: block;

          color: #fff;

          font-size: 24px;

          font-weight: 900;

        }



        .users-mini-stat span {

          display: block;

          margin-top: 5px;

          color: #8997ba;

          font-size: 11px;

          font-weight: 700;

        }



        /* 3D USER NETWORK */

        .user-space {

          position: absolute;

          right: 2%;

          top: 0;

          width: 55%;

          height: 650px;

          perspective: 1100px;

          z-index: 5;

        }



        .user-space-glow {

          position: absolute;

          left: 50%;

          top: 49%;

          width: 290px;

          height: 290px;

          transform: translate(-50%, -50%);

          border-radius: 50%;

          background: radial-gradient(

            circle,

            rgba(118,94,255,.42) 0%,

            rgba(66,150,255,.17) 38%,

            transparent 72%

          );

          filter: blur(20px);

          animation: userGlow 4.5s ease-in-out infinite;

        }



        .user-orbit {

          position: absolute;

          left: 50%;

          top: 50%;

          width: 440px;

          height: 180px;

          transform: translate(-50%, -50%) rotateX(67deg) rotateZ(-18deg);

          border: 1px solid rgba(135,154,255,.38);

          border-radius: 50%;

          box-shadow: 0 0 30px rgba(93,103,255,.12);

          animation: userOrbit 12s linear infinite;

        }



        .user-orbit.two {

          width: 500px;

          height: 220px;

          transform: translate(-50%, -50%) rotateX(67deg) rotateZ(48deg);

          border-color: rgba(60,207,255,.23);

          animation-duration: 17s;

          animation-direction: reverse;

        }



        .user-orbit.three {

          width: 360px;

          height: 520px;

          transform: translate(-50%, -50%) rotateY(67deg) rotateZ(15deg);

          border-color: rgba(174,125,255,.19);

          animation-duration: 20s;

        }



        .user-core {

          position: absolute;

          left: 50%;

          top: 50%;

          width: 175px;

          height: 175px;

          transform: translate(-50%, -50%);

          border-radius: 50%;

          background:

            radial-gradient(circle at 33% 24%, #d8e6ff 0 4%, transparent 5%),

            radial-gradient(circle at 65% 31%, rgba(106,213,255,.95) 0 5%, transparent 6%),

            radial-gradient(circle at 45% 65%, rgba(129,89,255,.85) 0 7%, transparent 8%),

            radial-gradient(circle at 50% 48%, #3246a8 0%, #1a286f 42%, #0a1037 74%, #050822 100%);

          border: 1px solid rgba(172,194,255,.55);

          box-shadow:

            inset -20px -22px 35px rgba(0,0,0,.55),

            inset 15px 12px 30px rgba(129,155,255,.28),

            0 0 30px rgba(103,116,255,.55),

            0 0 80px rgba(72,109,255,.28);

          animation: userCoreFloat 5s ease-in-out infinite;

          z-index: 10;

        }



        .user-core::before {

          content: "";

          position: absolute;

          width: 66px;

          height: 66px;

          left: 54px;

          top: 27px;

          border-radius: 50% 50% 45% 45%;

          background:

            radial-gradient(circle at 35% 30%, #fff 0 5%, transparent 6%),

            linear-gradient(145deg, #b7d8ff, #4f70c9 55%, #1d2c68);

          border: 2px solid rgba(225,239,255,.7);

          box-shadow: 0 0 18px rgba(132,201,255,.55);

        }



        .user-core::after {

          content: "";

          position: absolute;

          left: 39px;

          bottom: 25px;

          width: 98px;

          height: 51px;

          border-radius: 50px 50px 20px 20px;

          background: linear-gradient(145deg, #7b68f5, #273a99 55%, #121947);

          border: 1px solid rgba(178,193,255,.45);

          box-shadow: inset 0 8px 16px rgba(181,170,255,.18);

        }



        .user-node {

          position: absolute;

          width: 58px;

          height: 58px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          border: 1px solid rgba(175,193,255,.55);

          background: radial-gradient(circle at 32% 25%, #d8f5ff, #5f72e9 28%, #20275f 66%, #0a0e2a 100%);

          box-shadow: 0 0 24px rgba(83,133,255,.45);

          z-index: 12;

        }



        .user-node::before {

          content: "";

          width: 19px;

          height: 19px;

          border-radius: 50%;

          background: #dce9ff;

          box-shadow: 0 0 12px rgba(201,226,255,.7);

        }



        .user-node::after {

          content: "";

          position: absolute;

          width: 29px;

          height: 15px;

          bottom: 9px;

          border-radius: 18px 18px 8px 8px;

          background: #7b8df1;

        }



        .user-node.one {

          left: 18%;

          top: 29%;

          animation: nodeFloatOne 4.6s ease-in-out infinite;

        }



        .user-node.two {

          right: 12%;

          top: 28%;

          animation: nodeFloatTwo 5.2s ease-in-out infinite;

        }



        .user-node.three {

          left: 17%;

          bottom: 23%;

          animation: nodeFloatThree 4.9s ease-in-out infinite;

        }



        .user-node.four {

          right: 15%;

          bottom: 21%;

          animation: nodeFloatFour 5.5s ease-in-out infinite;

        }



        .connection {

          position: absolute;

          height: 1px;

          transform-origin: left center;

          background: linear-gradient(90deg, rgba(113,153,255,.06), rgba(123,145,255,.55), rgba(73,216,255,.08));

          box-shadow: 0 0 8px rgba(90,151,255,.35);

          z-index: 7;

          overflow: hidden;

        }



        .connection::after {

          content: "";

          position: absolute;

          left: -30px;

          top: -2px;

          width: 30px;

          height: 5px;

          border-radius: 50%;

          background: #7ceaff;

          box-shadow: 0 0 14px #7ceaff;

          animation: dataTravel 2.6s linear infinite;

        }



        .connection.one {

          left: 28%;

          top: 40%;

          width: 160px;

          transform: rotate(-25deg);

        }



        .connection.two {

          left: 56%;

          top: 39%;

          width: 170px;

          transform: rotate(21deg);

        }



        .connection.three {

          left: 28%;

          top: 61%;

          width: 165px;

          transform: rotate(25deg);

        }



        .connection.four {

          left: 56%;

          top: 61%;

          width: 170px;

          transform: rotate(-22deg);

        }



        .data-dot {

          position: absolute;

          width: 6px;

          height: 6px;

          border-radius: 50%;

          background: #76eaff;

          box-shadow: 0 0 12px #76eaff;

          animation: dataDot 2.2s ease-in-out infinite;

        }



        .data-dot.one { left: 38%; top: 23%; animation-delay: .2s; }

        .data-dot.two { left: 72%; top: 52%; animation-delay: .8s; }

        .data-dot.three { left: 34%; top: 73%; animation-delay: 1.3s; }

        .data-dot.four { left: 80%; top: 76%; animation-delay: 1.8s; }



        .user-metric-card {

          position: absolute;

          z-index: 25;

          min-width: 148px;

          padding: 13px 15px;

          border: 1px solid rgba(157,177,255,.18);

          border-radius: 14px;

          background: rgba(16,25,66,.68);

          backdrop-filter: blur(14px);

          box-shadow: 0 14px 40px rgba(0,0,0,.24);

        }



        .user-metric-card strong {

          display: block;

          color: #fff;

          font-size: 22px;

          font-weight: 900;

        }



        .user-metric-card span {

          display: block;

          margin-top: 3px;

          color: #98a8ce;

          font-size: 10px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: .05em;

        }



        .user-metric-card.one {

          right: 5%;

          top: 24%;

          animation: metricFloat 5s ease-in-out infinite;

        }



        .user-metric-card.two {

          right: 1%;

          bottom: 22%;

          animation: metricFloat 5.7s ease-in-out infinite reverse;

        }



        .user-metric-card.three {

          left: 5%;

          bottom: 17%;

          animation: metricFloat 4.8s ease-in-out infinite;

        }



        .users-content {

          position: relative;

          z-index: 30;

          padding: 28px 36px 0;

        }



        .users-section-title {

          margin: 0;

          color: #fff;

          font-size: 27px;

          font-weight: 900;

          letter-spacing: -.7px;

        }



        .users-section-description {

          margin: 6px 0 0;

          color: #91a1c4;

          font-size: 13px;

        }



        .users-overview-grid {

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 17px;

          margin-top: 20px;

        }



        .users-overview-card {

          min-height: 140px;

          padding: 21px;

          position: relative;

          overflow: hidden;

          border: 1px solid rgba(157,177,255,.15);

          border-radius: 20px;

          background: linear-gradient(145deg, rgba(26,36,91,.88), rgba(12,19,51,.92));

          box-shadow: 0 14px 35px rgba(0,0,0,.18);

        }



        .users-overview-card::after {

          content: "";

          position: absolute;

          right: -30px;

          bottom: -45px;

          width: 130px;

          height: 130px;

          border-radius: 50%;

          background: rgba(101,85,255,.13);

          filter: blur(20px);

        }



        .users-overview-icon {

          width: 43px;

          height: 43px;

          display: grid;

          place-items: center;

          border-radius: 13px;

          color: #e9edff;

          background: rgba(107,91,255,.17);

          border: 1px solid rgba(146,132,255,.22);

          font-size: 18px;

          font-weight: 900;

        }



        .users-overview-value {

          margin-top: 15px;

          color: #fff;

          font-size: 29px;

          font-weight: 900;

        }



        .users-overview-label {

          margin-top: 3px;

          color: #8495bb;

          font-size: 12px;

          font-weight: 700;

        }



        .users-controls {

          display: flex;

          align-items: center;

          gap: 10px;

          flex-wrap: wrap;

          margin-top: 24px;

          padding: 15px;

          border: 1px solid rgba(157,177,255,.14);

          border-radius: 17px;

          background: rgba(15,24,60,.75);

          box-shadow: 0 12px 30px rgba(0,0,0,.15);

        }



        .users-search,

        .users-filter {

          height: 43px;

          border: 1px solid rgba(151,169,229,.18);

          border-radius: 10px;

          outline: none;

          color: #e9efff;

          background: rgba(27,38,84,.82);

          font-size: 12px;

        }



        .users-search {

          flex: 1 1 320px;

          padding: 0 14px;

        }



        .users-filter {

          padding: 0 12px;

          font-weight: 700;

        }



        .users-search::placeholder {

          color: #7788ad;

        }



        .users-search:focus,

        .users-filter:focus {

          border-color: rgba(131,112,255,.7);

          box-shadow: 0 0 0 3px rgba(113,91,255,.09);

        }



        .users-results {

          margin-left: auto;

          color: #8495b8;

          font-size: 11px;

          font-weight: 800;

        }



        .users-table-card {

          margin-top: 17px;

          overflow: hidden;

          border: 1px solid rgba(157,177,255,.14);

          border-radius: 20px;

          background: rgba(13,21,54,.86);

          box-shadow: 0 15px 40px rgba(0,0,0,.18);

        }



        .users-table-scroll {

          overflow-x: auto;

        }



        .users-table {

          width: 100%;

          min-width: 900px;

          border-collapse: collapse;

        }



        .users-table th {

          padding: 15px;

          text-align: left;

          color: #7f91b6;

          background: rgba(24,34,76,.85);

          border-bottom: 1px solid rgba(157,177,255,.12);

          font-size: 10px;

          font-weight: 900;

          letter-spacing: .06em;

          text-transform: uppercase;

        }



        .users-table td {

          padding: 16px 15px;

          border-bottom: 1px solid rgba(157,177,255,.08);

          color: #aab8d4;

          font-size: 11px;

        }



        .users-table tbody tr {

          transition: .2s ease;

        }



        .users-table tbody tr:hover {

          background: rgba(72,82,150,.13);

        }



        .users-profile-cell {

          display: flex;

          align-items: center;

          gap: 11px;

        }



        .users-avatar {

          width: 39px;

          height: 39px;

          flex: 0 0 39px;

          display: grid;

          place-items: center;

          border-radius: 50%;

          color: white;

          background: radial-gradient(circle at 30% 25%, #cceeff, #6c62ee 38%, #22285e 100%);

          border: 1px solid rgba(187,204,255,.3);

          box-shadow: 0 0 16px rgba(91,117,255,.25);

          font-size: 13px;

          font-weight: 900;

        }



        .users-name {

          color: #f0f4ff;

          font-size: 13px;

          font-weight: 900;

        }



        .users-id {

          margin-top: 3px;

          color: #7182a8;

          font-size: 9px;

        }



        .users-role-badge,

        .users-status-badge {

          display: inline-flex;

          align-items: center;

          padding: 6px 9px;

          border-radius: 999px;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .03em;

        }



        .users-role-badge {

          color: #d8d2ff;

          border: 1px solid rgba(143,124,255,.22);

          background: rgba(104,85,255,.13);

        }



        .users-status-badge.active {

          color: #7ff5c2;

          border: 1px solid rgba(62,224,159,.22);

          background: rgba(33,196,132,.11);

        }



        .users-status-badge.inactive {

          color: #ff9eaa;

          border: 1px solid rgba(255,105,126,.22);

          background: rgba(225,52,78,.10);

        }



        .users-actions {

          display: flex;

          gap: 6px;

          flex-wrap: wrap;

        }



        .users-action {

          padding: 7px 9px;

          border: 1px solid rgba(153,171,231,.18);

          border-radius: 8px;

          color: #cbd7f5;

          background: rgba(42,53,103,.65);

          cursor: pointer;

          font-size: 9px;

          font-weight: 800;

          transition: .2s ease;

        }



        .users-action:hover {

          border-color: rgba(143,125,255,.55);

          transform: translateY(-1px);

        }



        .users-action.danger {

          color: #ffabb5;

          border-color: rgba(255,93,116,.18);

          background: rgba(144,31,52,.16);

        }



        .users-empty {

          padding: 45px 20px;

          text-align: center;

          color: #7f90b5;

          font-size: 13px;

        }



        .users-form-section {

          margin-top: 28px;

          scroll-margin-top: 20px;

        }



        .users-form-card {

          margin-top: 16px;

          padding: 23px;

          border: 1px solid rgba(157,177,255,.14);

          border-radius: 20px;

          background: linear-gradient(145deg, rgba(24,34,78,.9), rgba(11,18,48,.92));

          box-shadow: 0 15px 40px rgba(0,0,0,.17);

        }



        .users-form-heading {

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 15px;

          margin-bottom: 20px;

        }



        .users-form-heading h2 {

          margin: 0;

          color: #fff;

          font-size: 21px;

          font-weight: 900;

        }



        .users-form-heading p {

          margin: 5px 0 0;

          color: #8596ba;

          font-size: 11px;

        }



        .users-edit-indicator {

          padding: 7px 10px;

          border: 1px solid rgba(143,124,255,.22);

          border-radius: 999px;

          color: #d8d1ff;

          background: rgba(101,81,255,.12);

          font-size: 9px;

          font-weight: 900;

        }



        .users-form-grid {

          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 15px;

        }



        .users-field {

          min-width: 0;

        }



        .users-field.full {

          grid-column: 1 / -1;

        }



        .users-field label {

          display: block;

          margin-bottom: 7px;

          color: #aebbd8;

          font-size: 10px;

          font-weight: 900;

        }



        .users-input,

        .users-select {

          width: 100%;

          height: 43px;

          padding: 0 12px;

          border: 1px solid rgba(151,169,229,.18);

          border-radius: 10px;

          outline: none;

          color: #edf3ff;

          background: rgba(9,16,43,.78);

          font-size: 12px;

        }



        .users-input::placeholder {

          color: #68799f;

        }



        .users-input:focus,

        .users-select:focus {

          border-color: rgba(137,116,255,.75);

          box-shadow: 0 0 0 3px rgba(109,85,255,.08);

        }



        .users-checkbox {

          min-height: 43px;

          display: flex;

          align-items: center;

          gap: 9px;

          color: #cbd6f0;

          font-size: 12px;

          font-weight: 700;

        }



        .users-checkbox input {

          width: 17px;

          height: 17px;

          accent-color: #7658ff;

        }



        .users-form-actions {

          display: flex;

          gap: 9px;

          margin-top: 20px;

          flex-wrap: wrap;

        }



        @keyframes userStars {

          from { transform: translate3d(0, 0, 0); opacity: .62; }

          to { transform: translate3d(0, -7px, 0); opacity: 1; }

        }



        @keyframes statusPulse {

          0%,100% { opacity: .6; transform: scale(.85); }

          50% { opacity: 1; transform: scale(1.2); }

        }



        @keyframes userGlow {

          0%,100% { transform: translate(-50%, -50%) scale(.92); opacity: .7; }

          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }

        }



        @keyframes userOrbit {

          from { transform: translate(-50%, -50%) rotateX(67deg) rotateZ(-18deg); }

          to { transform: translate(-50%, -50%) rotateX(67deg) rotateZ(342deg); }

        }



        @keyframes userCoreFloat {

          0%,100% { transform: translate(-50%, -50%) translateY(0) rotateY(-5deg); }

          50% { transform: translate(-50%, -50%) translateY(-10px) rotateY(8deg); }

        }



        @keyframes nodeFloatOne {

          0%,100% { transform: translate(0,0); }

          50% { transform: translate(-7px,-12px); }

        }



        @keyframes nodeFloatTwo {

          0%,100% { transform: translate(0,0); }

          50% { transform: translate(9px,-8px); }

        }



        @keyframes nodeFloatThree {

          0%,100% { transform: translate(0,0); }

          50% { transform: translate(-8px,8px); }

        }



        @keyframes nodeFloatFour {

          0%,100% { transform: translate(0,0); }

          50% { transform: translate(8px,9px); }

        }



        @keyframes dataTravel {

          from { left: -30px; opacity: 0; }

          15% { opacity: 1; }

          85% { opacity: 1; }

          to { left: 100%; opacity: 0; }

        }



        @keyframes dataDot {

          0%,100% { transform: scale(.65); opacity: .35; }

          50% { transform: scale(1.5); opacity: 1; }

        }



        @keyframes metricFloat {

          0%,100% { transform: translateY(0); }

          50% { transform: translateY(-9px); }

        }



        @media (max-width: 1100px) {

          .users-hero {

            min-height: 700px;

          }



          .users-hero-content {

            width: 55%;

          }



          .user-space {

            right: -7%;

            width: 60%;

            transform: scale(.88);

            transform-origin: right center;

          }



          .users-overview-grid {

            grid-template-columns: repeat(2, minmax(0, 1fr));

          }

        }



        @media (max-width: 800px) {

          .users-hero {

            min-height: 760px;

            padding: 32px 25px 0;

          }



          .users-hero-content {

            width: 100%;

            max-width: none;

          }



          .users-title {

            font-size: 40px;

          }



          .user-space {

            top: 320px;

            right: 0;

            width: 100%;

            height: 410px;

            transform: scale(.82);

            transform-origin: top center;

          }



          .users-content {

            padding: 25px;

          }



          .users-results {

            width: 100%;

            margin-left: 0;

          }

        }



        @media (max-width: 600px) {

          .users-hero {

            min-height: 700px;

            padding: 28px 20px 0;

          }



          .users-title {

            font-size: 34px;

            letter-spacing: -1.5px;

          }



          .users-description {

            font-size: 13px;

          }



          .users-mini-stats {

            gap: 20px;

          }



          .user-space {

            top: 305px;

            height: 350px;

            transform: scale(.68);

          }



          .users-content {

            padding: 22px 15px;

          }



          .users-overview-grid {

            grid-template-columns: 1fr;

          }



          .users-form-grid {

            grid-template-columns: 1fr;

          }



          .users-field.full {

            grid-column: auto;

          }



          .users-form-heading {

            flex-direction: column;

          }

        }



        @media (max-width: 430px) {

          .users-title {

            font-size: 31px;

          }



          .users-mini-stats {

            gap: 15px;

          }



          .users-mini-stat strong {

            font-size: 21px;

          }



          .user-space {

            transform: scale(.58);

            top: 310px;

          }



          .users-hero-actions {

            flex-direction: column;

          }



          .users-primary-button,

          .users-secondary-button {

            width: 100%;

          }

        }

      

        /* =====================================
           PRIYONIX CRM WORKSPACE FRAME
        ===================================== */
        .users-page {
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          margin: 0;
          padding: 12px;
          border: 1px solid rgba(125, 157, 255, 0.28);
          border-radius: 20px;
          color: #edf3ff;
          background:
            radial-gradient(circle at 82% 8%, rgba(91, 72, 255, 0.10), transparent 29%),
            linear-gradient(145deg, #071329 0%, #0a1731 58%, #081329 100%);
          position: relative;
          isolation: isolate;
        }

        .users-hero {
          border: 1px solid rgba(137, 163, 255, 0.16);
          border-radius: 25px;
          background-clip: padding-box;
        }

        .users-content {
          padding: 28px 24px 20px;
        }

        /* Bring the overview cards in line with the other CRM modules. */
        .users-overview-card {
          border: 1px solid rgba(124, 157, 255, 0.20);
          border-radius: 20px;
          background: linear-gradient(145deg, rgba(15, 29, 58, 0.98), rgba(11, 23, 47, 0.98));
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.18);
        }

        .users-overview-card::after {
          right: -28px;
          top: -28px;
          bottom: auto;
          width: 94px;
          height: 94px;
          border-radius: 50%;
          background: rgba(81, 106, 201, 0.18);
          filter: none;
        }

        .users-overview-card:nth-child(1) .users-overview-icon {
          color: #5b52ff;
          background: #eef0ff;
          border-color: transparent;
        }

        .users-overview-card:nth-child(2) .users-overview-icon {
          color: #0284c7;
          background: #e0f2fe;
          border-color: transparent;
        }

        .users-overview-card:nth-child(3) .users-overview-icon {
          color: #db2777;
          background: #fce7f3;
          border-color: transparent;
        }

        .users-overview-card:nth-child(4) .users-overview-icon {
          color: #059669;
          background: #d1fae5;
          border-color: transparent;
        }

        .users-overview-value {
          color: #f4f7ff;
        }

        .users-overview-label {
          color: #a9bbda;
        }

        .users-form-card,
        .users-table-card,
        .users-controls {
          border-color: rgba(124, 157, 255, 0.20);
        }

        .users-form-card {
          border-radius: 20px;
          box-shadow: 0 15px 36px rgba(0, 0, 0, 0.18);
        }

        .users-table-card {
          border-radius: 20px;
        }

        .users-table {
          color: #eaf0ff;
        }

        .users-empty {
          color: #a9bbda;
        }

        @media (max-width: 800px) {
          .users-page {
            padding: 9px;
            border-radius: 16px;
          }

          .users-hero {
            border-radius: 22px;
          }

          .users-content {
            padding: 24px 16px 16px;
          }
        }

        @media (max-width: 600px) {
          .users-page {
            padding: 6px;
            border-radius: 14px;
          }

          .users-hero {
            border-radius: 18px;
          }

          .users-content {
            padding: 22px 10px 12px;
          }
        }

        /* ===== RESPONSIVE POLISH — all devices ===== */
        @media (max-width: 600px) {
          .users-search,
          .users-filter {
            flex: 0 0 auto;
            width: 100%;
            min-width: 0;
          }

          .users-mini-stats {
            flex-wrap: wrap;
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .users-mini-stats {
            flex-wrap: wrap;
            gap: 12px;
          }
        }

        @media (max-width: 360px) {
          .users-hero {
            min-height: 560px !important;
          }
        }

        @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
          .users-hero {
            min-height: 360px !important;
          }

          .user-space {
            display: none;
          }
        }

      `}</style>



      <section className="users-hero">

        <div className="users-hero-content">

          <div className="users-status">

            <span className="users-status-dot" />

            USER SYSTEM ONLINE

          </div>



          <h1 className="users-title">

            Every person.

            <span>Every role. One system.</span>

          </h1>



          <p className="users-description">

            Manage CRM users, roles, account access and active status

            from one connected PriyoniX workspace.

          </p>



          <div className="users-hero-actions">

            <button

              type="button"

              className="users-primary-button"

              onClick={() => {

                resetForm();

                window.requestAnimationFrame(() => {

                  formRef.current?.scrollIntoView({

                    behavior: "smooth",

                    block: "start",

                  });

                });

              }}

            >

              Add New User →

            </button>



            <button

              type="button"

              className="users-secondary-button"

              onClick={viewAllUsers}

            >

              View All Users

            </button>

          </div>



          <div className="users-mini-stats">

            <div className="users-mini-stat">

              <strong>{users.length}</strong>

              <span>Total Users</span>

            </div>



            <div className="users-mini-stat">

              <strong>{activeUsers}</strong>

              <span>Active</span>

            </div>



            <div className="users-mini-stat">

              <strong>{adminUsers}</strong>

              <span>Admins</span>

            </div>

          </div>

        </div>



        <div className="user-space" aria-hidden="true">

          <div className="user-space-glow" />



          <div className="user-orbit" />

          <div className="user-orbit two" />

          <div className="user-orbit three" />



          <div className="connection one" />

          <div className="connection two" />

          <div className="connection three" />

          <div className="connection four" />



          <div className="user-core" />



          <div className="user-node one" />

          <div className="user-node two" />

          <div className="user-node three" />

          <div className="user-node four" />



          <span className="data-dot one" />

          <span className="data-dot two" />

          <span className="data-dot three" />

          <span className="data-dot four" />



          <div className="user-metric-card one">

            <strong>{activeUsers}</strong>

            <span>Active Users</span>

          </div>



          <div className="user-metric-card two">

            <strong>{inactiveUsers}</strong>

            <span>Inactive Users</span>

          </div>



          <div className="user-metric-card three">

            <strong>{users.length}</strong>

            <span>Connected Accounts</span>

          </div>

        </div>

      </section>



      <main className="users-content">

        <section>

          <h2 className="users-section-title">User Overview</h2>

          <p className="users-section-description">

            Monitor your CRM access network and account availability.

          </p>



          <div className="users-overview-grid">

            <div className="users-overview-card">

              <div className="users-overview-icon">◉</div>

              <div className="users-overview-value">{users.length}</div>

              <div className="users-overview-label">Total Users</div>

            </div>



            <div className="users-overview-card">

              <div className="users-overview-icon">✓</div>

              <div className="users-overview-value">{activeUsers}</div>

              <div className="users-overview-label">Active Accounts</div>

            </div>



            <div className="users-overview-card">

              <div className="users-overview-icon">×</div>

              <div className="users-overview-value">{inactiveUsers}</div>

              <div className="users-overview-label">Inactive Accounts</div>

            </div>



            <div className="users-overview-card">

              <div className="users-overview-icon">★</div>

              <div className="users-overview-value">{adminUsers}</div>

              <div className="users-overview-label">Administrator Accounts</div>

            </div>

          </div>

        </section>



        <section

          ref={formRef}

          className="users-form-section"

        >

          <h2 className="users-section-title">

            {editingId ? "Edit User" : "Add New User"}

          </h2>



          <p className="users-section-description">

            {editingId

              ? "Update the selected user's account information."

              : "Create a new CRM user and assign the required access role."}

          </p>



          <div className="users-form-card">

            <div className="users-form-heading">

              <div>

                <h2>{editingId ? "Edit User Account" : "Create User Account"}</h2>

                <p>

                  Manage identity, role, contact information and account status.

                </p>

              </div>



              {editingId && (

                <span className="users-edit-indicator">

                  EDITING USER #{editingId}

                </span>

              )}

            </div>



            <form onSubmit={handleSubmit}>

              <div className="users-form-grid">

                <div className="users-field">

                  <label>Name</label>

                  <input

                    className="users-input"

                    type="text"

                    name="name"

                    placeholder="Enter employee name"

                    value={form.name}

                    onChange={handleChange}

                    required

                  />

                </div>



                <div className="users-field">

                  <label>Email</label>

                  <input

                    className="users-input"

                    type="email"

                    name="email"

                    placeholder="Enter email"

                    value={form.email}

                    onChange={handleChange}

                    required

                  />

                </div>



                <div className="users-field">

                  <label>Password {editingId ? "(optional)" : ""}</label>

                  <input

                    className="users-input"

                    type="password"

                    name="password"

                    placeholder={editingId ? "Enter new password if needed" : "Enter password"}

                    value={form.password}

                    onChange={handleChange}

                    required={!editingId}

                  />

                </div>



                <div className="users-field">

                  <label>Phone</label>

                  <input

                    className="users-input"

                    type="text"

                    name="phone"

                    placeholder="Enter phone number"

                    value={form.phone}

                    onChange={handleChange}

                  />

                </div>



                <div className="users-field">

                  <label>Role</label>

                  <select

                    className="users-select"

                    name="role"

                    value={form.role}

                    onChange={handleChange}

                  >

                    <option value="ADMIN">Admin</option>

                    <option value="MANAGER">Manager</option>

                    <option value="EMPLOYEE">Employee</option>

                    <option value="SALES">Sales</option>

                  </select>

                </div>



                <div className="users-field">

                  <label>Account Status</label>

                  <label className="users-checkbox">

                    <input

                      type="checkbox"

                      name="active"

                      checked={form.active}

                      onChange={handleChange}

                    />

                    Active Account

                  </label>

                </div>

              </div>



              <div className="users-form-actions">

                <button

                  type="submit"

                  className="users-primary-button"

                >

                  {editingId ? "Update User" : "Create User"}

                </button>



                {editingId && (

                  <button

                    type="button"

                    className="users-secondary-button"

                    onClick={resetForm}

                  >

                    Cancel

                  </button>

                )}

              </div>

            </form>

          </div>

        </section>



        <section

          ref={usersTableRef}

          style={{ scrollMarginTop: "20px", marginTop: "35px" }}

        >

          <h2 className="users-section-title">User Directory</h2>

          <p className="users-section-description">

            Search, filter and manage every CRM account.

          </p>



          <div className="users-controls">

            <input

              className="users-search"

              type="text"

              placeholder="Search by name, email or phone..."

              value={search}

              onChange={(e) => setSearch(e.target.value)}

            />



            <select

              className="users-filter"

              value={roleFilter}

              onChange={(e) => setRoleFilter(e.target.value)}

            >

              <option value="ALL">All Roles</option>

              <option value="ADMIN">Admin</option>

              <option value="MANAGER">Manager</option>

              <option value="EMPLOYEE">Employee</option>

              <option value="SALES">Sales</option>

            </select>



            <select

              className="users-filter"

              value={statusFilter}

              onChange={(e) => setStatusFilter(e.target.value)}

            >

              <option value="ALL">All Status</option>

              <option value="ACTIVE">Active</option>

              <option value="INACTIVE">Inactive</option>

            </select>



            <span className="users-results">

              Showing {filteredUsers.length} of {users.length} users

            </span>

          </div>



          <div className="users-table-card">

            <div className="users-table-scroll">

              <table className="users-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>User</th>

                    <th>Email</th>

                    <th>Phone</th>

                    <th>Role</th>

                    <th>Status</th>

                    <th>Actions</th>

                  </tr>

                </thead>



                <tbody>

                  {filteredUsers.map((user) => (

                    <tr key={user.id}>

                      <td>#{user.id}</td>



                      <td>

                        <div className="users-profile-cell">

                          <div className="users-avatar">

                            {String(user.name || "U")

                              .charAt(0)

                              .toUpperCase()}

                          </div>



                          <div>

                            <div className="users-name">

                              {user.name}

                            </div>

                            <div className="users-id">

                              CRM ACCOUNT

                            </div>

                          </div>

                        </div>

                      </td>



                      <td>{user.email}</td>



                      <td>{user.phone || "-"}</td>



                      <td>

                        <span className="users-role-badge">

                          {user.role}

                        </span>

                      </td>



                      <td>

                        <span

                          className={`users-status-badge ${

                            user.active ? "active" : "inactive"

                          }`}

                        >

                          {user.active ? "ACTIVE" : "INACTIVE"}

                        </span>

                      </td>



                      <td>

                        <div className="users-actions">

                          <button

                            type="button"

                            className="users-action"

                            onClick={() => handleEdit(user)}

                          >

                            Edit

                          </button>



                          <button

                            type="button"

                            className="users-action"

                            onClick={() => handleToggleActive(user)}

                          >

                            {user.active ? "Deactivate" : "Activate"}

                          </button>



                          <button

                            type="button"

                            className="users-action danger"

                            onClick={() => handleDelete(user.id)}

                          >

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>



              {filteredUsers.length === 0 && (

                <div className="users-empty">

                  No users found for the selected filters.

                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>

  );

}



export default Users;
