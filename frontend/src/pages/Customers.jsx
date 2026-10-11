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
  customerType: "REGULAR",
  status: "ACTIVE",
  notes: "",
  assignedUserId: "",
};

const statuses = [
  "ACTIVE",
  "INACTIVE",
];

const customerTypes = [
  "REGULAR",
  "PREMIUM",
  "VIP",
];

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

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

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const customerTableRef = useRef(null);

  const [form, setForm] =
    useState(emptyForm);

  const [error, setError] =
    useState("");

  /* =========================================
     LOAD CUSTOMERS
  ========================================= */

  useEffect(() => {
    loadCustomers();
    loadCurrentUser();
    loadUsers();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Unable to load current user", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get("/users/active");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Unable to load active users", error);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response =
        await api.get("/customers");

      setCustomers(
        response.data || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     CUSTOMER COUNTS
  ========================================= */

  const countStatus = (status) => {
    return customers.filter(
      (customer) =>
        String(
          customer.status || ""
        ).toUpperCase() === status
    ).length;
  };

  const countType = (type) => {
    return customers.filter(
      (customer) =>
        String(
          customer.customerType || ""
        ).toUpperCase() === type
    ).length;
  };

  const totalCustomers =
    customers.length;

  const activeCustomers =
    countStatus("ACTIVE");

  const inactiveCustomers =
    countStatus("INACTIVE");

  const regularCustomers =
    countType("REGULAR");

  const premiumCustomers =
    countType("PREMIUM");

  const vipCustomers =
    countType("VIP");

  const activeRate =
    totalCustomers > 0
      ? Math.round(
          (activeCustomers /
            totalCustomers) *
            100
        )
      : 0;

  /* =========================================
     FILTER
  ========================================= */

  const filteredCustomers = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return customers.filter(
      (customer) => {

        const matchesSearch =
          !value ||
          String(
            customer.name || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            customer.email || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            customer.phone || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            customer.company || ""
          )
            .toLowerCase()
            .includes(value) ||
          String(
            customer.location || ""
          )
            .toLowerCase()
            .includes(value);

        const matchesStatus =
          statusFilter === "ALL" ||
          String(
            customer.status || ""
          ).toUpperCase() ===
            statusFilter;

        const matchesType =
          typeFilter === "ALL" ||
          String(
            customer.customerType || ""
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
    customers,
    search,
    statusFilter,
    typeFilter,
  ]);

  /* =========================================
     ADD CUSTOMER
  ========================================= */

  const openAddModal = () => {
    if (
      currentUser?.role?.toUpperCase() ===
      "EMPLOYEE"
    ) {
      return;
    }

    setEditingId(null);

    setForm({
      ...emptyForm,
      assignedUserId:
        currentUser?.role?.toUpperCase() ===
        "SALES"
          ? String(currentUser.id)
          : "",
    });

    setError("");

    setShowModal(true);
  };

  /* =========================================
     EDIT CUSTOMER
  ========================================= */

  const openEditModal = (customer) => {
    setEditingId(customer.id);

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      company: customer.company || "",
      location: customer.location || "",
      source: customer.source || "",
      requirement:
        customer.requirement || "",
      customerType:
        customer.customerType ||
        "REGULAR",
      status:
        customer.status ||
        "ACTIVE",
      notes: customer.notes || "",
      assignedUserId:
        customer.assignedUserId != null
          ? String(customer.assignedUserId)
          : "",
    });

    setError("");

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
     SAVE CUSTOMER
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError(
        "Customer name is required."
      );

      return;
    }

    try {
      setSaving(true);

      const role =
        currentUser?.role?.toUpperCase();

      const payload = {
        ...form,
        assignedUserId:
          role === "SALES"
            ? currentUser.id
            : form.assignedUserId
              ? Number(form.assignedUserId)
              : null,
      };

      if (editingId) {
        await api.put(
          `/customers/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/customers",
          payload
        );
      }

      await loadCustomers();

      closeModal();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE
  ========================================= */

  const deleteCustomer = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/customers/${id}`
      );

      setCustomers((old) =>
        old.filter(
          (customer) =>
            customer.id !== id
        )
      );

      if (
        selectedCustomer?.id === id
      ) {
        setSelectedCustomer(null);

        setShowDetails(false);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete customer."
      );
    }
  };

  /* =========================================
     FORMAT TYPE
  ========================================= */

  const formatType = (type) => {
    if (!type) {
      return "REGULAR";
    }

    return String(type)
      .toUpperCase();
  };

  /* =========================================
     VIEW DETAILS
  ========================================= */

  const viewCustomer = (customer) => {
    setSelectedCustomer(customer);

    setShowDetails(true);
  };

  /* =========================================
     VIEW ALL CUSTOMERS
  ========================================= */

  const handleViewAllCustomers = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");

    // Always move to the complete customer list.
    requestAnimationFrame(() => {
      customerTableRef.current?.scrollIntoView({
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

        .customers-page {
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

        .customers-page-header {
          display: flex;

          justify-content: space-between;

          align-items: center;

          padding:
            28px 0 22px;
        }

        .customers-page-header h1 {
          margin: 0;

          color: #10182f;

          font-size: 30px;

          font-weight: 900;

          letter-spacing: -0.8px;
        }

        .customers-page-header p {
          margin:
            7px 0 0;

          color: #71809a;

          font-size: 14px;
        }


        /* =====================================
           HERO
        ===================================== */

        .customers-hero {
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

        .customer-hero-stars {
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

        .customer-hero-content {
          position: relative;

          z-index: 20;

          width: 48%;

          padding:
            50px 0 45px 52px;
        }

        .customer-hero-status {
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

        .customer-hero-status-dot {
          width: 8px;

          height: 8px;

          border-radius: 50%;

          background: #22d3ee;

          box-shadow:
            0 0 12px
            rgba(34,211,238,.85);
        }

        .customer-hero-content h2 {
          margin:
            25px 0 0;

          color: white;

          font-size: 49px;

          line-height: 1.04;

          letter-spacing: -2.4px;

          font-weight: 900;
        }

        .customer-hero-content h2 span {
          color: #a99aff;
        }

        .customer-hero-description {
          max-width: 490px;

          margin:
            20px 0 0;

          color: #aab5d2;

          font-size: 15px;

          line-height: 1.7;

          font-weight: 600;
        }

        .customer-hero-actions {
          display: flex;

          gap: 12px;

          margin-top: 25px;
        }

        .customer-hero-primary {
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

        .customer-hero-primary:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 16px 30px
            rgba(103,80,235,.38);
        }

        .customer-hero-secondary {
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

        .customer-hero-mini-stats {
          display: flex;

          gap: 30px;

          margin-top: 32px;
        }

        .customer-hero-mini-stat strong {
          display: block;

          color: white;

          font-size: 24px;

          font-weight: 900;
        }

        .customer-hero-mini-stat span {
          display: block;

          margin-top: 4px;

          color: #8995b8;

          font-size: 11px;

          font-weight: 700;
        }


        /* =====================================
           STAR AREA
        ===================================== */

        .earth-area {
          position: absolute;

          right: 2%;

          top: 0;

          width: 53%;

          height: 100%;

          perspective: 1000px;
        }


        /* =====================================
           3D FIVE-POINT STAR
        ===================================== */

        .customer-star-orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 300px;
          height: 145px;
          transform:
            translate(-50%, -50%)
            rotate(-18deg);
          border:
            1px solid
            rgba(255,214,96,.25);
          border-radius: 50%;
          box-shadow:
            0 0 22px
            rgba(255,180,55,.14),
            inset 0 0 18px
            rgba(255,214,96,.06);
          z-index: 3;
          animation:
            customerStarOrbit
            10s
            linear
            infinite;
        }

        @keyframes customerStarOrbit {
          from {
            transform:
              translate(-50%, -50%)
              rotate(-18deg);
          }

          to {
            transform:
              translate(-50%, -50%)
              rotate(342deg);
          }
        }

        .customer-star {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 170px;
          height: 170px;
          z-index: 7;
          transform:
            translate(-50%, -50%);
          overflow: visible;
          clip-path:
            polygon(
              50% 0%,
              61% 35%,
              98% 35%,
              68% 57%,
              79% 100%,
              50% 73%,
              21% 100%,
              32% 57%,
              2% 35%,
              39% 35%
            );
          background:
            radial-gradient(
              circle at 35% 24%,
              #ffffff 0%,
              #fffde0 10%,
              #fff29a 23%,
              #ffd23f 39%,
              #ff9b20 59%,
              #f05220 78%,
              #a91e24 100%
            );
          filter:
            drop-shadow(0 0 8px rgba(255,245,155,.95))
            drop-shadow(0 0 22px rgba(255,194,48,.95))
            drop-shadow(0 0 48px rgba(255,105,27,.72))
            drop-shadow(0 0 82px rgba(255,68,30,.42));
          animation:
            customerStarFloat
            4.8s
            ease-in-out
            infinite;
        }

        .customer-star::before {
          content: "";
          position: absolute;
          inset: 0;
          clip-path:
            polygon(
              50% 0%,
              61% 35%,
              98% 35%,
              68% 57%,
              79% 100%,
              50% 73%,
              21% 100%,
              32% 57%,
              2% 35%,
              39% 35%
            );
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.82) 0%,
              rgba(255,255,255,.20) 18%,
              transparent 35%,
              rgba(135,22,20,.30) 74%,
              rgba(69,10,22,.58) 100%
            );
          z-index: 1;
          animation:
            customerStarSurface
            7s
            linear
            infinite;
          pointer-events: none;
        }

        .customer-star::after {
          content: "";
          position: absolute;
          inset: -30px;
          clip-path:
            polygon(
              50% 0%,
              56% 38%,
              100% 50%,
              56% 62%,
              50% 100%,
              44% 62%,
              0% 50%,
              44% 38%
            );
          background:
            radial-gradient(
              ellipse at center,
              rgba(255,235,105,.38),
              rgba(255,135,31,.18) 38%,
              transparent 72%
            );
          filter: blur(8px);
          opacity: .9;
          z-index: -1;
          animation:
            customerStarRays
            8s
            linear
            infinite;
          pointer-events: none;
        }

        .customer-star-surface {
          position: absolute;
          inset: 10px;
          clip-path:
            polygon(
              50% 0%,
              61% 35%,
              98% 35%,
              68% 57%,
              79% 100%,
              50% 73%,
              21% 100%,
              32% 57%,
              2% 35%,
              39% 35%
            );
          background:
            radial-gradient(
              circle at 63% 27%,
              rgba(255,255,195,.95) 0 7px,
              transparent 15px
            ),
            radial-gradient(
              circle at 30% 53%,
              rgba(191,51,21,.38) 0 10px,
              transparent 18px
            ),
            radial-gradient(
              circle at 67% 66%,
              rgba(166,39,18,.32) 0 8px,
              transparent 15px
            ),
            radial-gradient(
              circle at 45% 42%,
              rgba(255,239,112,.52) 0 9px,
              transparent 17px
            );
          mix-blend-mode: screen;
          animation:
            customerStarSurface
            7s
            linear
            infinite;
          z-index: 2;
          pointer-events: none;
        }

        .customer-star-corona {
          position: absolute;
          inset: -11px;
          clip-path:
            polygon(
              50% 0%,
              61% 35%,
              98% 35%,
              68% 57%,
              79% 100%,
              50% 73%,
              21% 100%,
              32% 57%,
              2% 35%,
              39% 35%
            );
          background:
            rgba(255,216,78,.20);
          filter: blur(1px);
          box-shadow:
            0 0 18px rgba(255,204,72,.65),
            0 0 38px rgba(255,130,38,.30);
          animation:
            customerStarCoronaRing
            3.4s
            ease-in-out
            infinite;
          pointer-events: none;
        }

        .customer-star-flare {
          position: absolute;
          display: block;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(255,255,190,.98) 0%,
              rgba(255,177,45,.72) 34%,
              transparent 76%
            );
          filter: blur(1px);
          pointer-events: none;
          z-index: 4;
        }

        .customer-star-flare.one {
          width: 50px;
          height: 18px;
          left: -15px;
          top: 65px;
          transform: rotate(-18deg);
          animation:
            customerStarFlareOne
            2.2s
            ease-in-out
            infinite;
        }

        .customer-star-flare.two {
          width: 18px;
          height: 52px;
          right: 65px;
          top: -15px;
          animation:
            customerStarFlareTwo
            2.7s
            ease-in-out
            infinite;
        }

        .customer-star-flare.three {
          width: 44px;
          height: 16px;
          right: -13px;
          bottom: 65px;
          transform: rotate(-18deg);
          animation:
            customerStarFlareThree
            2.5s
            ease-in-out
            infinite;
        }

        @keyframes customerStarFloat {
          0%,100% {
            transform:
              translate(-50%, -50%)
              translate(0,0)
              scale(1)
              rotate(0deg);
          }

          50% {
            transform:
              translate(-50%, -50%)
              translate(7px,-9px)
              scale(1.045)
              rotate(3deg);
          }
        }

        @keyframes customerStarCorona {
          0%,100% {
            opacity: .60;
            transform: scale(.92);
          }

          50% {
            opacity: 1;
            transform: scale(1.10);
          }
        }

        @keyframes customerStarRays {
          from {
            transform:
              rotate(0deg)
              scale(1);
          }

          to {
            transform:
              rotate(360deg)
              scale(1.03);
          }
        }

        @keyframes customerStarSurface {
          from {
            transform:
              rotate(0deg)
              scale(1);
          }

          to {
            transform:
              rotate(360deg)
              scale(1.035);
          }
        }

        @keyframes customerStarCoronaRing {
          0%,100% {
            opacity: .55;
            transform: scale(.96);
          }

          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes customerStarFlareOne {
          0%,100% {
            opacity: .55;
            transform:
              rotate(-18deg)
              scaleX(.78);
          }

          50% {
            opacity: 1;
            transform:
              rotate(-18deg)
              scaleX(1.22);
          }
        }

        @keyframes customerStarFlareTwo {
          0%,100% {
            opacity: .55;
            transform: scaleY(.78);
          }

          50% {
            opacity: 1;
            transform: scaleY(1.20);
          }
        }

        @keyframes customerStarFlareThree {
          0%,100% {
            opacity: .50;
            transform:
              rotate(-18deg)
              scaleX(.75);
          }

          50% {
            opacity: 1;
            transform:
              rotate(-18deg)
              scaleX(1.20);
          }
        }


        /* =====================================
           CUSTOMER CONNECTION POINTS
        ===================================== */

        .customer-point {
          position: absolute;

          z-index: 14;

          width: 7px;

          height: 7px;

          border-radius: 50%;

          background: #62efff;

          box-shadow:

            0 0 7px
            #62efff,

            0 0 15px
            rgba(98,239,255,.8);

          animation:
            customerPulse
            2s
            ease-in-out
            infinite;
        }

        .customer-point.one {
          left: 61px;

          top: 74px;
        }

        .customer-point.two {
          left: 129px;

          top: 61px;

          animation-delay:
            -.5s;
        }

        .customer-point.three {
          left: 154px;

          top: 116px;

          animation-delay:
            -1s;
        }

        .customer-point.four {
          left: 103px;

          top: 147px;

          animation-delay:
            -1.5s;
        }

        .customer-point.five {
          left: 173px;

          top: 155px;

          animation-delay:
            -.8s;
        }

        @keyframes customerPulse {

          0%,
          100% {
            transform:
              scale(.65);

            opacity: .5;
          }

          50% {
            transform:
              scale(1.25);

            opacity: 1;
          }
        }


        /* =====================================
           SATELLITE
        ===================================== */

        .customer-satellite {
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

        .customer-satellite::before {
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

        .customer-satellite::after {
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
            customerEngine
            .8s
            ease-in-out
            infinite
            alternate;
        }

        @keyframes customerEngine {

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

        .customer-satellite-window {
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

        .customer-satellite-wing {
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

        .customer-satellite-wing.top {
          left: 25px;

          top: 1px;

          transform:
            rotate(-12deg);
        }

        .customer-satellite-wing.bottom {
          left: 28px;

          top: 25px;

          transform:
            rotate(12deg);
        }


        /* =====================================
           SATELLITE ONE
        ===================================== */

        .customer-satellite.one {
          right: 9%;

          top: 17%;

          transform:
            rotate(-8deg);

          animation:
            customerSatelliteOne
            6s
            ease-in-out
            infinite;
        }

        @keyframes customerSatelliteOne {

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

        .customer-satellite.two {
          left: 11%;

          bottom: 13%;

          transform:
            rotate(12deg);

          animation:
            customerSatelliteTwo
            7s
            ease-in-out
            infinite;
        }

        @keyframes customerSatelliteTwo {

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

        .customer-metric {
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
            customerMetricFloat
            5s
            ease-in-out
            infinite;
        }

        .customer-metric.one {
          left: 4%;

          top: 12%;
        }

        .customer-metric.two {
          right: 0;

          top: 55%;

          animation-delay:
            -1.7s;
        }

        .customer-metric.three {
          left: 13%;

          bottom: 8%;

          animation-delay:
            -3s;
        }

        @keyframes customerMetricFloat {

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

        .customer-metric strong {
          display: block;

          color: white;

          font-size: 22px;

          font-weight: 900;
        }

        .customer-metric span {
          display: block;

          margin-top: 3px;

          color: #8e9abb;

          font-size: 10px;

          font-weight: 800;
        }


        /* =====================================
           SECTION TITLE
        ===================================== */

        .customer-section-title {
          margin-top: 38px;

          margin-bottom: 17px;
        }

        .customer-section-title h2 {
          margin: 0;

          color: #13203b;

          font-size: 27px;

          font-weight: 900;

          letter-spacing: -.7px;
        }

        .customer-section-title p {
          margin:
            6px 0 0;

          color: #7d8aa1;

          font-size: 12px;

          font-weight: 600;
        }


        /* =====================================
           OVERVIEW CARDS
        ===================================== */

        .customer-overview-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 17px;
        }

        .customer-overview-card {
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

        .customer-overview-card::after {
          content: "";

          position: absolute;

          width: 95px;

          height: 95px;

          right: -30px;

          top: -30px;

          border-radius: 50%;

          background: #edf0ff;
        }

        .customer-overview-icon {
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

        .customer-overview-value {
          position: relative;

          z-index: 2;

          margin-top: 15px;

          color: #101a33;

          font-size: 29px;

          font-weight: 900;
        }

        .customer-overview-label {
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

        .customer-controls {
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

        .customer-search {
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

        .customer-search:focus {
          border-color: #7965ee;

          box-shadow:
            0 0 0 3px
            rgba(121,101,238,.08);
        }

        .customer-filter {
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

        .customer-results {
          color: #8290a7;

          font-size: 11px;

          font-weight: 800;
        }


        /* =====================================
           TABLE
        ===================================== */

        .customer-table-wrapper {
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

        .customer-table {
          width: 100%;

          min-width: 1080px;

          border-collapse: collapse;
        }

        .customer-table th {
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

        .customer-table td {
          padding:
            16px 15px;

          border-bottom:
            1px solid
            #edf0f5;

          color: #647189;

          font-size: 11px;
        }

        .customer-table tbody tr:hover {
          background: #fbfcff;
        }


        /* =====================================
           CUSTOMER NAME
        ===================================== */

        .customer-name {
          color: #17213a;

          font-size: 13px;

          font-weight: 900;
        }

        .customer-company {
          margin-top: 4px;

          color: #9aa5b7;

          font-size: 10px;
        }


        /* =====================================
           CUSTOMER AVATAR
        ===================================== */

        .customer-profile-cell {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .customer-avatar {
          width: 38px;

          height: 38px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 50%;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6255ee,
              #3b82f6
            );

          font-size: 13px;

          font-weight: 900;
        }


        /* =====================================
           BADGES
        ===================================== */

        .customer-badge {
          display: inline-flex;

          padding:
            6px 9px;

          border-radius: 20px;

          font-size: 9px;

          font-weight: 900;
        }

        .customer-status-active {
          color: #078363;

          background: #e1f9ef;
        }

        .customer-status-inactive {
          color: #7d8798;

          background: #eef1f5;
        }

        .customer-type-regular {
          color: #4356d9;

          background: #eef0ff;
        }

        .customer-type-premium {
          color: #7c45c7;

          background: #f3eaff;
        }

        .customer-type-vip {
          color: #ad7610;

          background: #fff6db;
        }


        /* =====================================
           TABLE ACTIONS
        ===================================== */

        .customer-table-actions {
          position: relative;
          z-index: 30;

          display: flex;

          gap: 5px;
        }

        .customer-table-action {
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

        .customer-table-action:hover {
          color: #6355dc;

          border-color: #bdb5ff;

          background: #f8f7ff;
        }

        .customer-view-action {
          cursor: pointer;
          pointer-events: auto;
        }

        .customer-table-action.delete:hover {
          color: #dc4b5c;

          border-color: #ffc4cc;

          background: #fff6f7;
        }


        /* =====================================
           EMPTY STATE
        ===================================== */

        .customer-empty-state {
          padding:
            70px 20px;

          text-align: center;
        }

        .customer-empty-state h3 {
          margin:
            13px 0 5px;

          color: #17213a;

          font-size: 18px;
        }

        .customer-empty-state p {
          margin: 0;

          color: #8c98aa;

          font-size: 12px;
        }

        .empty-earth {
          width: 58px;

          height: 58px;

          margin: auto;

          border-radius: 50%;

          background:
            radial-gradient(
              circle at 30% 25%,
              #bdf2ff,
              #298fdc 45%,
              #123e78
            );

          box-shadow:
            0 8px 22px
            rgba(74,85,104,.18);
        }


        /* =====================================
           MODAL
        ===================================== */

        .customer-modal-overlay {
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

        .customer-modal {
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

        .customer-modal-header {
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

        .customer-modal-header h2 {
          margin: 0;

          color: #15203a;

          font-size: 21px;

          font-weight: 900;
        }

        .customer-modal-header p {
          margin:
            5px 0 0;

          color: #8b97a9;

          font-size: 11px;
        }

        .customer-modal-close {
          width: 38px;

          height: 38px;

          border: 0;

          border-radius: 9px;

          color: #68758b;

          background: #f1f3f8;

          cursor: pointer;

          font-size: 20px;
        }

        .customer-modal-form {
          padding: 23px;
        }


        /* =====================================
           FORM
        ===================================== */

        .customer-form-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 14px;
        }

        .customer-form-field {
          display: flex;

          flex-direction: column;

          gap: 6px;
        }

        .customer-form-field.full {
          grid-column: 1 / -1;
        }

        .customer-form-field label {
          color: #59667d;

          font-size: 10px;

          font-weight: 900;

          text-transform: uppercase;
        }

        .customer-form-field input,
        .customer-form-field select,
        .customer-form-field textarea {
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

        .customer-form-field input,
        .customer-form-field select {
          height: 43px;

          padding:
            0 11px;
        }

        .customer-form-field textarea {
          min-height: 90px;

          padding: 11px;

          resize: vertical;
        }

        .customer-form-field input:focus,
        .customer-form-field select:focus,
        .customer-form-field textarea:focus {
          border-color: #7965ee;

          box-shadow:
            0 0 0 3px
            rgba(121,101,238,.08);
        }

        .customer-form-error {
          margin-bottom: 15px;

          padding:
            10px 12px;

          border-radius: 8px;

          color: #c24454;

          background: #fff0f2;

          font-size: 11px;

          font-weight: 700;
        }

        .customer-modal-footer {
          display: flex;

          justify-content: flex-end;

          gap: 9px;

          margin-top: 20px;

          padding-top: 17px;

          border-top:
            1px solid
            #edf0f5;
        }

        .customer-cancel-button {
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

        .customer-save-button {
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

        .customer-details {
          padding: 23px;
        }

        .customer-profile {
          display: flex;

          align-items: center;

          gap: 13px;

          padding: 15px;

          margin-bottom: 17px;

          border-radius: 13px;

          background: #f7f8fc;
        }

        .customer-details-avatar {
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

        .customer-profile h3 {
          margin: 0;

          color: #17213a;

          font-size: 17px;
        }

        .customer-profile p {
          margin:
            4px 0 0;

          color: #8b97a9;

          font-size: 11px;
        }

        .customer-details-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 10px;
        }

        .customer-detail-box {
          padding: 12px;

          border:
            1px solid
            #e8ebf1;

          border-radius: 10px;

          background: #fbfcfe;
        }

        .customer-detail-box.full {
          grid-column: 1 / -1;
        }

        .customer-detail-label {
          color: #98a2b3;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .06em;

          text-transform: uppercase;
        }

        .customer-detail-value {
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

          .customer-hero-content {
            width: 53%;
          }

          .earth-area {
            width: 52%;
          }

          .customer-star {
            left: 50%;
            top: 50%;
            right: auto;
            transform: translate(-50%, -50%) scale(.88);
            transform-origin: center;
          }

          .customer-star-orbit {
            left: 50%;
            top: 50%;
            right: auto;
            transform: translate(-50%, -50%) rotate(-18deg) scale(.88);
            transform-origin: center;
          }

          .customer-overview-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }


        @media(max-width:800px) {

          .customers-hero {
            min-height: 680px;
          }

          .customer-hero-content {
            width: 100%;

            padding:
              40px 30px 0;
          }

          .customer-hero-content h2 {
            font-size: 40px;
          }

          .earth-area {
            top: 320px;

            left: 0;

            right: 0;

            width: 100%;

            height: 350px;
          }
        }


        @media(max-width:600px) {

          .customers-page-header {
            padding-top: 18px;
          }

          .customers-page-header h1 {
            font-size: 26px;
          }

          .customers-hero {
            min-height: 640px;

            border-radius: 22px;
          }

          .customer-hero-content {
            padding:
              28px 22px 0;
          }

          .customer-hero-content h2 {
            font-size: 34px;
          }

          .customer-hero-description {
            font-size: 13px;
          }

          .customer-hero-mini-stats {
            gap: 18px;
          }

          .earth-area {
            top: 310px;

            height: 310px;

            transform:
              scale(.82);

            transform-origin:
              top center;
          }

          .customer-star {
            left: 50%;
            top: 50%;
            right: auto;
            transform: translate(-50%, -50%) scale(.72);
          }

          .customer-star-orbit {
            left: 50%;
            top: 50%;
            right: auto;
            transform: translate(-50%, -50%) rotate(-18deg) scale(.72);
          }

          .customer-satellite.one {
            right: 3%;
          }

          .customer-satellite.two {
            left: 4%;
          }

          .customer-overview-grid {
            grid-template-columns: 1fr;
          }

          .customer-controls {
            align-items: stretch;

            flex-direction: column;
          }

          .customer-search,
          .customer-filter {
            width: 100%;
          }

          .customer-form-grid,
          .customer-details-grid {
            grid-template-columns: 1fr;
          }

          .customer-form-field.full,
          .customer-detail-box.full {
            grid-column: auto;
          }

          .customer-modal-overlay {
            padding: 8px;
          }

          .customer-modal {
            max-height: 96vh;
          }
        }



        /* ===== PRIYONIX SPACE THEME: CUSTOMER PAGE ===== */
        .customers-page {
          display: block;
          position: relative;
          /* Avoid creating a stacking context that traps the modal behind the sidebar. */
          z-index: auto;
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

        .customers-page-header {
          min-width: 0;
          gap: 18px;
          padding: 8px 2px 24px !important;
          margin: 0;
        }

        .customers-page-header h1 {
          color: #f4f7ff !important;
        }

        .customers-page-header p {
          color: #a9bbda !important;
        }

        .customers-hero {
          width: 100%;
          max-width: 100%;
          margin: 0 0 34px;
          border: 1px solid rgba(124, 157, 255, 0.10);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.20);
        }

        .customer-section-title {
          margin-top: 0 !important;
          margin-bottom: 17px;
          padding-top: 0;
        }

        .customer-section-title h2 {
          color: #f4f7ff !important;
        }

        .customer-section-title p {
          color: #a9bbda !important;
        }

        .customer-overview-grid,
        .customer-controls,
        .customer-table-wrapper {
          width: 100%;
          min-width: 0;
        }

        .customer-overview-card {
          background: rgba(13, 27, 56, 0.96) !important;
          border-color: rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16) !important;
        }

        .customer-overview-card::after {
          background: rgba(99, 102, 241, 0.12) !important;
        }

        .customer-overview-value {
          color: #f4f7ff !important;
        }

        .customer-overview-label {
          color: #a9bbda !important;
        }

        .customer-controls {
          margin-top: 26px;
          background: rgba(13, 27, 56, 0.96) !important;
          border-color: rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14) !important;
        }

        .customer-search,
        .customer-filter {
          color: #f4f7ff !important;
          background: #0a1730 !important;
          border-color: #30466f !important;
        }

        .customer-search::placeholder {
          color: #8094b8 !important;
          opacity: 1;
        }

        .customer-search:focus,
        .customer-filter:focus {
          border-color: #8b7cff !important;
          box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
        }

        .customer-filter option,
        .customer-form-field select option {
          color: #f4f7ff;
          background: #0d1b38;
        }

        .customer-results {
          color: #a9bbda !important;
        }

        .customer-table-wrapper {
          margin-bottom: 6px;
          background: rgba(13, 27, 56, 0.96) !important;
          border-color: rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16) !important;
        }

        .customer-table th {
          color: #a9bbda !important;
          background: #101f3b !important;
          border-bottom-color: #263d68 !important;
        }

        .customer-table td {
          color: #c4d0e7 !important;
          border-bottom-color: rgba(124, 157, 255, 0.14) !important;
        }

        .customer-table tbody tr {
          background: transparent !important;
        }

        .customer-table tbody tr:hover {
          background: rgba(92, 105, 190, 0.12) !important;
        }

        .customer-name {
          color: #f4f7ff !important;
        }

        .customer-company {
          color: #9aadd0 !important;
        }

        .customer-table-action {
          color: #dbe7ff !important;
          background: #142544 !important;
          border-color: #30466f !important;
        }

        .customer-table-action:hover {
          color: #ffffff !important;
          background: #25396a !important;
          border-color: #8b7cff !important;
        }

        .customer-table-action.delete:hover {
          color: #ffdce2 !important;
          background: rgba(194, 68, 84, 0.18) !important;
          border-color: rgba(255, 133, 151, 0.55) !important;
        }

        .customer-empty-state h3 {
          color: #f4f7ff !important;
        }

        .customer-empty-state p {
          color: #a9bbda !important;
        }

        /* Add/edit and details modals use the same space palette. */
        .customer-modal-overlay {
          align-items: flex-start !important;
          justify-content: center !important;
          overflow-y: auto !important;
          padding: 84px 20px 24px !important;
          box-sizing: border-box;
          overscroll-behavior: contain;
        }

        .customer-modal {
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

        .customer-modal::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }

        .customer-modal-header {
          position: sticky;
          top: 0;
          z-index: 5;
          background: #0d1b38 !important;
          border-bottom-color: rgba(124, 157, 255, 0.18) !important;
        }

        .customer-modal-header h2 {
          color: #f4f7ff !important;
        }

        .customer-modal-header p {
          color: #a9bbda !important;
        }

        .customer-modal-close {
          color: #dbe7ff !important;
          background: #1a2d4d !important;
        }

        .customer-form-field label {
          color: #b9c8e4 !important;
        }

        .customer-form-field input,
        .customer-form-field select,
        .customer-form-field textarea {
          color: #f4f7ff !important;
          background: #09172f !important;
          border-color: #30466f !important;
          color-scheme: dark;
        }

        .customer-form-field input::placeholder,
        .customer-form-field textarea::placeholder {
          color: #8094b8 !important;
          opacity: 1;
        }

        .customer-form-field input:focus,
        .customer-form-field select:focus,
        .customer-form-field textarea:focus {
          border-color: #8b7cff !important;
          box-shadow: 0 0 0 3px rgba(124, 108, 255, 0.18) !important;
        }

        .customer-form-error {
          color: #ffdce2 !important;
          background: rgba(194, 68, 84, 0.18) !important;
          border: 1px solid rgba(255, 133, 151, 0.28);
        }

        .customer-modal-footer {
          border-top-color: rgba(124, 157, 255, 0.18) !important;
        }

        .customer-cancel-button {
          color: #dbe7ff !important;
          background: #142544 !important;
          border-color: #30466f !important;
        }

        .customer-cancel-button:hover {
          background: #20365a !important;
        }

        .customer-details {
          color: #eaf0ff;
        }

        .customer-profile {
          background: #142544 !important;
        }

        .customer-profile h3 {
          color: #f4f7ff !important;
        }

        .customer-profile p {
          color: #a9bbda !important;
        }

        .customer-detail-box {
          background: #0a1730 !important;
          border-color: #30466f !important;
        }

        .customer-detail-label {
          color: #91a6ca !important;
        }

        .customer-detail-value {
          color: #e3ebfb !important;
        }

        @media (max-width: 700px) {
          .customers-page {
            padding: 12px 12px 28px !important;
            border-radius: 16px;
          }

          .customers-page-header {
            padding: 8px 2px 20px !important;
          }

          .customer-modal-overlay {
            padding: 76px 10px 12px !important;
          }

          .customer-modal {
            width: 100%;
            max-height: calc(100dvh - 88px) !important;
          }
        }

        /* Keep customer modals inside the usable workspace, clear of the fixed sidebar and topbar. */
        .customer-modal-overlay {
          position: fixed !important;
          top: 78px !important;
          right: 0 !important;
          bottom: 0 !important;
          left: 278px !important;
          z-index: 2500 !important;
          display: flex !important;
          align-items: flex-start !important;
          justify-content: center !important;
          padding: 12px 14px 18px !important;
          overflow-y: auto !important;
          box-sizing: border-box !important;
          overscroll-behavior: contain;
        }

        .customer-modal {
          flex: 0 1 850px !important;
          width: min(850px, 100%) !important;
          max-width: 100% !important;
          max-height: calc(100dvh - 108px) !important;
          min-width: 0 !important;
          margin: 0 auto !important;
          overflow-y: auto !important;
        }

        @media (max-width: 1050px) and (min-width: 801px) {
          .customer-modal-overlay {
            left: 245px !important;
          }
        }

        @media (max-width: 800px) {
          .customer-modal-overlay {
            top: 68px !important;
            left: 0 !important;
            padding: 10px 12px 16px !important;
          }

          .customer-modal {
            max-height: calc(100dvh - 88px) !important;
          }
        }

        @media (max-width: 600px) {
          .customer-modal-overlay {
            top: 68px !important;
            padding: 8px !important;
          }

          .customer-modal-form {
            padding: 16px !important;
          }

          .customer-form-grid,
          .customer-details-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .customer-form-field.full,
          .customer-detail-box.full {
            grid-column: auto !important;
          }

          .customer-modal-footer {
            flex-wrap: wrap;
          }
        }

        /* ===== RESPONSIVE POLISH — all devices ===== */
        @media (max-width: 600px) {
          .customer-search,
          .customer-filter {
            flex: 0 0 auto;
            width: 100%;
            min-width: 0;
          }

          .customer-hero-actions {
            flex-wrap: wrap;
          }

          .customer-metric {
            display: none;
          }
        }

        @media (max-width: 400px) {
          .customer-hero-primary,
          .customer-hero-secondary {
            flex: 1 1 100%;
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .customers-page-header h1 {
            font-size: 23px;
          }

          .customer-hero-content h2 {
            font-size: 29px;
          }

          .customers-hero {
            min-height: 560px !important;
          }
        }

        @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
          .customers-hero {
            min-height: 360px !important;
          }

          .earth-area {
            display: none;
          }
        }

      `}</style>


      <div className="customers-page">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="customers-page-header">

          <div>

            <h1>
              Customer Management
            </h1>

            <p>
              Manage and grow your customer
              relationships.
            </p>

          </div>

        </div>


        {/* =====================================
            HERO
        ===================================== */}

        <section className="customers-hero">

          <div
            className="customer-hero-stars"
          />


          {/* ===================================
              HERO CONTENT
          =================================== */}

          <div
            className="
              customer-hero-content
            "
          >

            <div
              className="
                customer-hero-status
              "
            >

              <span
                className="
                  customer-hero-status-dot
                "
              />

              CUSTOMER SYSTEM ONLINE

            </div>


            <h2>

              Every relationship

              <br />

              <span>
                builds your business.
              </span>

            </h2>


            <p
              className="
                customer-hero-description
              "
            >

              Manage customers, relationships
              and business opportunities from
              one connected PriyoniX CRM
              workspace.

            </p>


            <div
              className="
                customer-hero-actions
              "
            >

              {currentUser?.role?.toUpperCase() !==
                "EMPLOYEE" && (
                <button
                  className="
                    customer-hero-primary
                  "
                  onClick={
                    openAddModal
                  }
                >
                  Add New Customer →
                </button>
              )}


              <button
                type="button"
                className="
                  customer-hero-secondary
                "
                onClick={handleViewAllCustomers}
              >
                View All Customers
              </button>

            </div>


            <div
              className="
                customer-hero-mini-stats
              "
            >

              <div
                className="
                  customer-hero-mini-stat
                "
              >

                <strong>
                  {totalCustomers}
                </strong>

                <span>
                  Total Customers
                </span>

              </div>


              <div
                className="
                  customer-hero-mini-stat
                "
              >

                <strong>
                  {activeCustomers}
                </strong>

                <span>
                  Active Customers
                </span>

              </div>


              <div
                className="
                  customer-hero-mini-stat
                "
              >

                <strong>
                  {activeRate}%
                </strong>

                <span>
                  Active Rate
                </span>

              </div>

            </div>

          </div>


          {/* ===================================
              5-POINT STAR SPACE
          =================================== */}

          <div className="earth-area">

            {/* =================================
                3D STAR
            ================================= */}

            <div className="customer-star-orbit" />

            <div className="customer-star">
              <div className="customer-star-corona" />
              <div className="customer-star-surface" />
              <span className="customer-star-flare one" />
              <span className="customer-star-flare two" />
              <span className="customer-star-flare three" />
            </div>


            {/* =================================
                SATELLITE ONE
            ================================= */}

            <div
              className="
                customer-satellite
                one
              "
            >

              <span
                className="
                  customer-satellite-wing
                  top
                "
              />

              <span
                className="
                  customer-satellite-wing
                  bottom
                "
              />

              <span
                className="
                  customer-satellite-window
                "
              />

            </div>


            {/* =================================
                SATELLITE TWO
            ================================= */}

            <div
              className="
                customer-satellite
                two
              "
            >

              <span
                className="
                  customer-satellite-wing
                  top
                "
              />

              <span
                className="
                  customer-satellite-wing
                  bottom
                "
              />

              <span
                className="
                  customer-satellite-window
                "
              />

            </div>


            {/* =================================
                CUSTOMER METRIC ONE
            ================================= */}

            <div
              className="
                customer-metric
                one
              "
            >

              <strong>
                {activeCustomers}
              </strong>

              <span>
                Active Customers
              </span>

            </div>


            {/* =================================
                CUSTOMER METRIC TWO
            ================================= */}

            <div
              className="
                customer-metric
                two
              "
            >

              <strong>
                {vipCustomers}
              </strong>

              <span>
                VIP Customers
              </span>

            </div>


            {/* =================================
                CUSTOMER METRIC THREE
            ================================= */}

            <div
              className="
                customer-metric
                three
              "
            >

              <strong>
                {premiumCustomers}
              </strong>

              <span>
                Premium Customers
              </span>

            </div>


          </div>

        </section>


        {/* =====================================
            CUSTOMER OVERVIEW
        ===================================== */}

        <div
          className="
            customer-section-title
          "
        >

          <h2>
            Customer Overview
          </h2>

          <p>
            Live overview of your customer
            database.
          </p>

        </div>


        <div
          className="
            customer-overview-grid
          "
        >

          <OverviewCard
            icon="◎"
            value={
              totalCustomers
            }
            label="Total Customers"
            color="#6255ee"
            bg="#eef0ff"
          />


          <OverviewCard
            icon="✦"
            value={
              activeCustomers
            }
            label="Active Customers"
            color="#159bd3"
            bg="#e5f7fc"
          />


          <OverviewCard
            icon="★"
            value={
              vipCustomers
            }
            label="VIP Customers"
            color="#ad7610"
            bg="#fff6db"
          />


          <OverviewCard
            icon="↗"
            value={`${activeRate}%`}
            label="Active Rate"
            color="#9251ed"
            bg="#f2eaff"
          />

        </div>


        {/* =====================================
            FILTERS
        ===================================== */}

        <div
          className="
            customer-controls
          "
        >

          <input
            className="
              customer-search
            "
            placeholder="
              Search customers...
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
              customer-filter
            "
            value={
              statusFilter
            }
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
            className="
              customer-filter
            "
            value={
              typeFilter
            }
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Types
            </option>

            {customerTypes.map(
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


          <span
            className="
              customer-results
            "
          >

            {filteredCustomers.length}

            {" "}

            results

          </span>

        </div>


        {/* =====================================
            CUSTOMER TABLE
        ===================================== */}

        <div
          ref={customerTableRef}
          className="
            customer-table-wrapper
          "
        >

          {loading ? (

            <div
              className="
                customer-empty-state
              "
            >

              <div
                className="
                  empty-earth
                "
              />

              <h3>
                Loading Customers
              </h3>

              <p>
                Getting your CRM data...
              </p>

            </div>

          ) : filteredCustomers.length ===
            0 ? (

            <div
              className="
                customer-empty-state
              "
            >

              <div
                className="
                  empty-earth
                "
              />

              <h3>
                No Customers Found
              </h3>

              <p>
                Add a customer or change
                your filters.
              </p>

            </div>

          ) : (

            <table
              className="
                customer-table
              "
            >

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Company
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Source
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredCustomers.map(
                  (customer) => (

                    <tr
                      key={
                        customer.id
                      }
                    >

                      <td>

                        <div
                          className="
                            customer-profile-cell
                          "
                        >

                          <div
                            className="
                              customer-avatar
                            "
                          >

                            {String(
                              customer.name ||
                                "C"
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <div
                              className="
                                customer-name
                              "
                            >
                              {
                                customer.name
                              }
                            </div>

                            <div
                              className="
                                customer-company
                              "
                            >
                              #
                              {
                                customer.id
                              }
                            </div>

                          </div>

                        </div>

                      </td>


                      <td>

                        {
                          customer.email ||
                          "No email"
                        }

                        <br />

                        {
                          customer.phone ||
                          "No phone"
                        }

                      </td>


                      <td>

                        {
                          customer.company ||
                          "Individual"
                        }

                      </td>


                      <td>

                        <span
                          className={`
                            customer-badge
                            customer-type-${formatType(
                              customer.customerType
                            ).toLowerCase()}
                          `}
                        >

                          {formatType(
                            customer.customerType
                          )}

                        </span>

                      </td>


                      <td>

                        <span
                          className={`
                            customer-badge
                            customer-status-${String(
                              customer.status ||
                                "ACTIVE"
                            ).toLowerCase()}
                          `}
                        >

                          {
                            customer.status ||
                            "ACTIVE"
                          }

                        </span>

                      </td>


                      <td>

                        {
                          customer.location ||
                          "Not provided"
                        }

                      </td>


                      <td>

                        {
                          customer.source ||
                          "Direct"
                        }

                      </td>


                      <td>

                        <div
                          className="
                            customer-table-actions
                          "
                        >

                          <button
                            type="button"
                            className="
                              customer-table-action
                              customer-view-action
                            "
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              viewCustomer(customer);
                            }}
                          >
                            View
                          </button>


                          {currentUser?.role?.toUpperCase() !==
                            "EMPLOYEE" && (
                            <button
                              className="
                                customer-table-action
                              "
                              onClick={() =>
                                openEditModal(
                                  customer
                                )
                              }
                            >
                              Edit
                            </button>
                          )}


                          {(currentUser?.role?.toUpperCase() ===
                            "ADMIN" ||
                            currentUser?.role?.toUpperCase() ===
                              "MANAGER") && (
                            <button
                              className="
                                customer-table-action
                                delete
                              "
                              onClick={() =>
                                deleteCustomer(
                                  customer.id
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
            className="
              customer-modal-overlay
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

            <div
              className="
                customer-modal
              "
            >

              <div
                className="
                  customer-modal-header
                "
              >

                <div>

                  <h2>

                    {editingId
                      ? "Edit Customer"
                      : "Add New Customer"}

                  </h2>

                  <p>
                    Enter the customer
                    information below.
                  </p>

                </div>


                <button
                  className="
                    customer-modal-close
                  "
                  onClick={
                    closeModal
                  }
                >
                  ×
                </button>

              </div>


              <form
                className="
                  customer-modal-form
                "
                onSubmit={
                  handleSubmit
                }
              >

                {error && (

                  <div
                    className="
                      customer-form-error
                    "
                  >

                    {error}

                  </div>

                )}


                <div
                  className="
                    customer-form-grid
                  "
                >

                  <Field
                    label="Customer Name *"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Customer name
                    "
                  />


                  <Field
                    label="Phone"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Phone number
                    "
                  />


                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Email address
                    "
                  />


                  <Field
                    label="Company"
                    name="company"
                    value={
                      form.company
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Company / Institution
                    "
                  />


                  <Field
                    label="Location"
                    name="location"
                    value={
                      form.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Location
                    "
                  />


                  <Field
                    label="Source"
                    name="source"
                    value={
                      form.source
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="
                      Website / Referral / Social
                    "
                  />


                  <div
                    className="
                      customer-form-field
                    "
                  >

                    <label>
                      Customer Type
                    </label>

                    <select
                      name="customerType"
                      value={form.customerType}
                      onChange={handleChange}
                    >

                      {customerTypes.map(
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


                  <div
                    className="
                      customer-form-field
                    "
                  >

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


                  {(currentUser?.role?.toUpperCase() ===
                    "ADMIN" ||
                    currentUser?.role?.toUpperCase() ===
                      "MANAGER" ||
                    currentUser?.role?.toUpperCase() ===
                      "SALES") && (

                    <div
                      className="
                        customer-form-field
                      "
                    >

                      <label>
                        Assigned Employee
                      </label>

                      {currentUser?.role?.toUpperCase() ===
                        "SALES" ? (

                        <input
                          value={
                            currentUser.name ||
                            currentUser.email ||
                            "Current User"
                          }
                          readOnly
                        />

                      ) : (

                        <select
                          name="assignedUserId"
                          value={
                            form.assignedUserId
                          }
                          onChange={
                            handleChange
                          }
                        >

                          <option value="">
                            Select Employee
                          </option>

                          {users
                            .filter((user) => {
                              const userRole =
                                String(
                                  user.role || ""
                                ).toUpperCase();

                              if (
                                currentUser?.role?.toUpperCase() ===
                                "MANAGER"
                              ) {
                                return (
                                  userRole ===
                                    "SALES" ||
                                  userRole ===
                                    "EMPLOYEE"
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
                                {" - "}
                                {user.role}
                              </option>

                            ))}

                        </select>

                      )}

                    </div>

                  )}


                  <div
                    className="
                      customer-form-field
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
                      onChange={
                        handleChange
                      }
                      placeholder="
                        Customer requirement...
                      "
                    />

                  </div>


                  <div
                    className="
                      customer-form-field
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
                      onChange={
                        handleChange
                      }
                      placeholder="
                        Additional notes...
                      "
                    />

                  </div>

                </div>


                <div
                  className="
                    customer-modal-footer
                  "
                >

                  <button
                    type="button"
                    className="
                      customer-cancel-button
                    "
                    onClick={
                      closeModal
                    }
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="
                      customer-save-button
                    "
                    disabled={
                      saving
                    }
                  >

                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Customer"
                      : "Create Customer"}

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
          selectedCustomer && (

            <div
              className="
                customer-modal-overlay
              "
              onMouseDown={(event) => {

                if (
                  event.target ===
                  event.currentTarget
                ) {

                  setShowDetails(
                    false
                  );

                }

              }}
            >

              <div
                className="
                  customer-modal
                "
              >

                <div
                  className="
                    customer-modal-header
                  "
                >

                  <div>

                    <h2>
                      Customer Details
                    </h2>

                    <p>
                      Complete customer
                      information.
                    </p>

                  </div>


                  <button
                    className="
                      customer-modal-close
                    "
                    onClick={() =>
                      setShowDetails(
                        false
                      )
                    }
                  >
                    ×
                  </button>

                </div>


                <div
                  className="
                    customer-details
                  "
                >

                  <div
                    className="
                      customer-profile
                    "
                  >

                    <div
                      className="
                        customer-details-avatar
                      "
                    >

                      {String(
                        selectedCustomer.name ||
                          "C"
                      )
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    <div>

                      <h3>
                        {
                          selectedCustomer.name
                        }
                      </h3>

                      <p>
                        {
                          selectedCustomer.company ||
                          "Individual Customer"
                        }
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      customer-details-grid
                    "
                  >

                    <Detail
                      label="Phone"
                      value={
                        selectedCustomer.phone ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Email"
                      value={
                        selectedCustomer.email ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Company"
                      value={
                        selectedCustomer.company ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Location"
                      value={
                        selectedCustomer.location ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Source"
                      value={
                        selectedCustomer.source ||
                        "Direct"
                      }
                    />

                    <Detail
                      label="Customer Type"
                      value={
                        selectedCustomer.customerType ||
                        "REGULAR"
                      }
                    />

                    <Detail
                      label="Status"
                      value={
                        selectedCustomer.status ||
                        "ACTIVE"
                      }
                    />

                    <Detail
                      label="Customer ID"
                      value={
                        `#${selectedCustomer.id}`
                      }
                    />

                    <Detail
                      label="Requirement"
                      value={
                        selectedCustomer.requirement ||
                        "No requirement"
                      }
                      full
                    />

                    <Detail
                      label="Notes"
                      value={
                        selectedCustomer.notes ||
                        "No notes"
                      }
                      full
                    />

                  </div>


                  <div
                    className="
                      customer-modal-footer
                    "
                  >

                    <button
                      className="
                        customer-cancel-button
                      "
                      onClick={() =>
                        setShowDetails(
                          false
                        )
                      }
                    >
                      Close
                    </button>


                    {currentUser?.role?.toUpperCase() !==
                      "EMPLOYEE" && (
                      <button
                        className="
                          customer-save-button
                        "
                        onClick={() => {

                          setShowDetails(
                            false
                          );

                          openEditModal(
                            selectedCustomer
                          );

                        }}
                      >
                        Edit Customer
                      </button>
                    )}

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
    <div
      className="
        customer-overview-card
      "
    >

      <div
        className="
          customer-overview-icon
        "
        style={{
          color,
          background: bg,
        }}
      >
        {icon}
      </div>

      <div
        className="
          customer-overview-value
        "
      >
        {value}
      </div>

      <div
        className="
          customer-overview-label
        "
      >
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
    <div
      className="
        customer-form-field
      "
    >

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
      className={`
        customer-detail-box
        ${full ? "full" : ""}
      `}
    >

      <div
        className="
          customer-detail-label
        "
      >
        {label}
      </div>

      <div
        className="
          customer-detail-value
        "
      >
        {value}
      </div>

    </div>
  );
}


export default Customers;