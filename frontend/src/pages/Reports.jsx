import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import api from "../services/api";

function Reports() {
  const [conversion, setConversion] = useState({});
  const [leadSource, setLeadSource] = useState({});
  const [pipeline, setPipeline] = useState({});
  const [followUps, setFollowUps] = useState({});
  const [employeePerformance, setEmployeePerformance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reportsReady, setReportsReady] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  /* =====================================
     LOAD REPORTS
  ===================================== */

  const loadReports = async () => {
    try {
      setLoading(true);
      setReportsReady(false);
      setError("");

      const results = await Promise.allSettled([
        api.get("/reports/conversion"),
        api.get("/reports/lead-source"),
        api.get("/reports/pipeline"),
        api.get("/reports/follow-ups"),
        api.get("/reports/employee-performance"),
      ]);

      const [
        conversionResult,
        sourceResult,
        pipelineResult,
        followUpResult,
        employeeResult,
      ] = results;

      if (conversionResult.status === "fulfilled") {
        setConversion(
          conversionResult.value.data || {}
        );
      } else {
        console.error(
          "Conversion report error:",
          conversionResult.reason
        );
      }

      if (sourceResult.status === "fulfilled") {
        setLeadSource(
          sourceResult.value.data || {}
        );
      } else {
        console.error(
          "Lead source report error:",
          sourceResult.reason
        );
      }

      if (pipelineResult.status === "fulfilled") {
        setPipeline(
          pipelineResult.value.data || {}
        );
      } else {
        console.error(
          "Pipeline report error:",
          pipelineResult.reason
        );
      }

      if (followUpResult.status === "fulfilled") {
        setFollowUps(
          followUpResult.value.data || {}
        );
      } else {
        console.error(
          "Follow-up report error:",
          followUpResult.reason
        );
      }

      if (employeeResult.status === "fulfilled") {
        const data =
          employeeResult.value.data;

        setEmployeePerformance(
          Array.isArray(data)
            ? data
            : []
        );
      } else {
        console.error(
          "Employee report error:",
          employeeResult.reason
        );
      }

      const failedReports =
        results.filter(
          (result) =>
            result.status === "rejected"
        ).length;

      setReportsReady(failedReports === 0);

      if (failedReports > 0) {
        setError(
          `${failedReports} report section${
            failedReports > 1 ? "s" : ""
          } could not be loaded. Excel export is disabled until all report data loads successfully.`
        );
      }
    } catch (err) {
      console.error(
        "Reports loading error:",
        err
      );

      setReportsReady(false);
      setError(
        "Unable to load CRM reports. Excel export is disabled until the data loads successfully."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================
     HELPER FUNCTIONS
  ===================================== */

  const getValue = (
    object,
    ...keys
  ) => {
    for (const key of keys) {
      if (
        object &&
        object[key] !== undefined &&
        object[key] !== null
      ) {
        return object[key];
      }
    }

    return 0;
  };

  const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  const percentage = (
    value,
    total
  ) => {
    const current =
      numberValue(value);

    const maximum =
      numberValue(total);

    if (maximum <= 0) {
      return 0;
    }

    return Math.round(
      (current / maximum) * 100
    );
  };

  /* =====================================
     CONVERSION
  ===================================== */

  const totalLeads =
    numberValue(
      getValue(
        conversion,
        "Total Leads",
        "totalLeads",
        "total"
      )
    );

  const wonLeads =
    numberValue(
      getValue(
        conversion,
        "Won",
        "won",
        "wonLeads"
      )
    );

  const lostLeads =
    numberValue(
      getValue(
        conversion,
        "Lost",
        "lost",
        "lostLeads"
      )
    );

  const openLeads =
    numberValue(
      getValue(
        conversion,
        "Open",
        "open",
        "openLeads"
      )
    );

  const conversionRate =
    totalLeads > 0
      ? Math.round(
          (wonLeads / totalLeads) *
            100
        )
      : 0;

  /* =====================================
     FOLLOW UPS
  ===================================== */

  const totalFollowUps =
    numberValue(
      getValue(
        followUps,
        "Total",
        "total",
        "totalFollowUps"
      )
    );

  const pendingFollowUps =
    numberValue(
      getValue(
        followUps,
        "Pending",
        "pending",
        "pendingFollowUps"
      )
    );

  const completedFollowUps =
    numberValue(
      getValue(
        followUps,
        "Completed",
        "completed",
        "completedFollowUps"
      )
    );

  const cancelledFollowUps =
    numberValue(
      getValue(
        followUps,
        "Cancelled",
        "cancelled",
        "cancelledFollowUps"
      )
    );

  const followUpCompletion =
    percentage(
      completedFollowUps,
      totalFollowUps
    );

  /* =====================================
     PIPELINE
  ===================================== */

  const pipelineEntries =
    useMemo(() => {
      if (
        !pipeline ||
        typeof pipeline !== "object"
      ) {
        return [];
      }

      return Object.entries(
        pipeline
      ).map(
        ([name, value]) => ({
          name,
          value:
            numberValue(value),
        })
      );
    }, [pipeline]);

  const maxPipelineValue =
    Math.max(
      1,
      ...pipelineEntries.map(
        (item) => item.value
      )
    );

  /* =====================================
     LEAD SOURCE
  ===================================== */

  const sourceEntries =
    useMemo(() => {
      if (
        !leadSource ||
        typeof leadSource !==
          "object"
      ) {
        return [];
      }

      return Object.entries(
        leadSource
      )
        .map(
          ([name, value]) => ({
            name,
            value:
              numberValue(value),
          })
        )
        .sort(
          (a, b) =>
            b.value - a.value
        );
    }, [leadSource]);

  const maxSourceValue =
    Math.max(
      1,
      ...sourceEntries.map(
        (item) => item.value
      )
    );

  /* =====================================
     EMPLOYEE PERFORMANCE
  ===================================== */

  const employeeEntries =
    useMemo(() => {
      if (
        !Array.isArray(
          employeePerformance
        )
      ) {
        return [];
      }

      return employeePerformance.map(
        (employee) => ({
          userId:
            employee?.userId,

          name:
            employee?.name ||
            "Unknown Employee",

          email:
            employee?.email || "",

          role:
            employee?.role || "",

          totalTasks:
            numberValue(
              employee?.totalTasks
            ),

          completedTasks:
            numberValue(
              employee?.completedTasks
            ),

          pendingTasks:
            numberValue(
              employee?.pendingTasks
            ),
        })
      );
    }, [employeePerformance]);

  const maxEmployeeTasks =
    Math.max(
      1,
      ...employeeEntries.map(
        (employee) =>
          employee.totalTasks
      )
    );

  /* =====================================
     OVERVIEW
  ===================================== */

  const activeActions =
    openLeads +
    pendingFollowUps;

  const completedActions =
    wonLeads +
    completedFollowUps;

  /* =====================================
     GENERATE EXCEL REPORT
  ===================================== */

  const generateLatestReport = () => {
    if (!reportsReady) {
      setError(
        "The report data is not ready. Click Refresh Reports and wait for all sections to load before exporting."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const generatedDate =
        new Date();

      const dateString =
        generatedDate
          .toISOString()
          .slice(0, 10);

      const timeString =
        generatedDate.toLocaleTimeString();

      const summaryData = [
        ["PRIYONIX CRM - LATEST REPORT"],
        [],
        [
          "Report Generated Date",
          dateString,
        ],
        [
          "Report Generated Time",
          timeString,
        ],
        [],
        ["CRM SUMMARY"],
        ["Metric", "Value"],
        [
          "Total Leads",
          totalLeads,
        ],
        [
          "Won Leads",
          wonLeads,
        ],
        [
          "Lost Leads",
          lostLeads,
        ],
        [
          "Open Leads",
          openLeads,
        ],
        [
          "Conversion Rate",
          `${conversionRate}%`,
        ],
        [
          "Total Follow-ups",
          totalFollowUps,
        ],
        [
          "Pending Follow-ups",
          pendingFollowUps,
        ],
        [
          "Completed Follow-ups",
          completedFollowUps,
        ],
        [
          "Cancelled Follow-ups",
          cancelledFollowUps,
        ],
        [
          "Active Actions",
          activeActions,
        ],
        [
          "Completed Actions",
          completedActions,
        ],
      ];

      const leadSourceData = [
        [
          "Lead Source",
          "Lead Count",
          "Percentage",
        ],
      ];

      sourceEntries.forEach(
        (item) => {
          leadSourceData.push([
            item.name,
            item.value,
            `${percentage(
              item.value,
              totalLeads
            )}%`,
          ]);
        }
      );

      const pipelineData = [
        [
          "Pipeline Stage",
          "Lead Count",
          "Percentage",
        ],
      ];

      pipelineEntries.forEach(
        (item) => {
          pipelineData.push([
            item.name,
            item.value,
            `${percentage(
              item.value,
              totalLeads
            )}%`,
          ]);
        }
      );

      const followUpData = [
        [
          "Follow-up Status",
          "Count",
          "Percentage",
        ],
        [
          "Total",
          totalFollowUps,
          "100%",
        ],
        [
          "Pending",
          pendingFollowUps,
          `${percentage(
            pendingFollowUps,
            totalFollowUps
          )}%`,
        ],
        [
          "Completed",
          completedFollowUps,
          `${percentage(
            completedFollowUps,
            totalFollowUps
          )}%`,
        ],
        [
          "Cancelled",
          cancelledFollowUps,
          `${percentage(
            cancelledFollowUps,
            totalFollowUps
          )}%`,
        ],
      ];

      const employeeData = [
        [
          "Employee",
          "Email",
          "Role",
          "Total Tasks",
          "Completed Tasks",
          "Pending Tasks",
          "Completion Rate",
        ],
      ];

      employeeEntries.forEach(
        (employee) => {
          employeeData.push([
            employee.name,
            employee.email,
            employee.role,
            employee.totalTasks,
            employee.completedTasks,
            employee.pendingTasks,
            `${percentage(
              employee.completedTasks,
              employee.totalTasks
            )}%`,
          ]);
        }
      );

      const workbook =
        XLSX.utils.book_new();

      const summarySheet =
        XLSX.utils.aoa_to_sheet(
          summaryData
        );

      const leadSourceSheet =
        XLSX.utils.aoa_to_sheet(
          leadSourceData
        );

      const pipelineSheet =
        XLSX.utils.aoa_to_sheet(
          pipelineData
        );

      const followUpSheet =
        XLSX.utils.aoa_to_sheet(
          followUpData
        );

      const employeeSheet =
        XLSX.utils.aoa_to_sheet(
          employeeData
        );

      summarySheet["!cols"] = [
        { wch: 30 },
        { wch: 25 },
      ];

      leadSourceSheet["!cols"] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
      ];

      pipelineSheet["!cols"] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
      ];

      followUpSheet["!cols"] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
      ];

      employeeSheet["!cols"] = [
        { wch: 25 },
        { wch: 32 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 },
        { wch: 16 },
        { wch: 18 },
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Summary"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        leadSourceSheet,
        "Lead Sources"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        pipelineSheet,
        "Pipeline"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        followUpSheet,
        "Follow-ups"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        employeeSheet,
        "Employee Performance"
      );

      XLSX.writeFile(
        workbook,
        `PriyoniX-CRM-Report-${dateString}.xlsx`
      );

      setTimeout(() => {
        setGenerating(false);
      }, 500);
    } catch (err) {
      console.error(
        "Excel report generation error:",
        err
      );

      setGenerating(false);

      setError(
        "Unable to generate the Excel report. Please make sure the XLSX package is installed."
      );
    }
  };

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <>
        <style>{`
          .reports-loading-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #071329;
            font-family: Arial, Helvetica, sans-serif;
          }

          .reports-loading-box {
            text-align: center;
          }

          .reports-loading-orbit {
            width: 65px;
            height: 65px;
            margin: auto;
            border: 3px solid #263653;
            border-top-color: #6859ee;
            border-radius: 50%;
            animation: reportsLoading 1s linear infinite;
          }

          .reports-loading-box h2 {
            margin: 18px 0 6px;
            color: #f4f7ff;
            font-size: 21px;
            font-weight: 900;
          }

          .reports-loading-box p {
            margin: 0;
            color: #a9bbda;
            font-size: 11px;
            font-weight: 700;
          }

          @keyframes reportsLoading {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="reports-loading-page">

          <div className="reports-loading-box">

            <div className="reports-loading-orbit" />

            <h2>
              Loading Reports
            </h2>

            <p>
              Preparing your CRM
              intelligence...
            </p>

          </div>

        </div>
      </>
    );
  }

  return (
    <>
      <style>{`

        .reports-page,
        .reports-page *,
        .reports-page button,
        .reports-page input {
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .reports-page {
          min-height: 100vh;
          padding-bottom: 45px;
          background: #f4f6fb;
          color: #172033;
        }

        .reports-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 28px 0 22px;
        }

        .reports-page-header h1 {
          margin: 0;
          color: #10182f;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -0.8px;
        }

        .reports-page-header p {
          margin: 7px 0 0;
          color: #71809a;
          font-size: 14px;
        }

        .reports-refresh {
          height: 40px;
          padding: 0 15px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          color: #59667d;
          background: white;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
          transition: .2s ease;
        }

        .reports-refresh:hover {
          color: #6255ee;
          border-color: #c9c2ff;
          background: #faf9ff;
        }

        /* =================================
           HERO
        ================================= */

        .reports-hero {
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

        .reports-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .9;
          background-image:
            radial-gradient(circle at 6% 23%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 13% 67%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 25% 17%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 34% 74%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 45% 31%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 55% 15%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 67% 28%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 82% 18%, white 0 1px, transparent 1.5px),
            radial-gradient(circle at 92% 68%, white 0 1px, transparent 1.5px);
          animation:
            reportStars
            18s
            linear
            infinite;
        }

        @keyframes reportStars {
          from {
            transform:
              translate(0,0);
          }

          to {
            transform:
              translate(-20px,15px);
          }
        }

        .reports-hero-content {
          position: relative;
          z-index: 30;
          width: 49%;
          padding:
            50px
            0
            45px
            52px;
        }

        .reports-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 13px;
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

        .reports-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow:
            0 0 12px
            rgba(34,211,238,.85);
        }

        .reports-hero-content h2 {
          margin: 25px 0 0;
          color: white;
          font-size: 49px;
          line-height: 1.04;
          letter-spacing: -2.4px;
          font-weight: 900;
        }

        .reports-hero-content h2 span {
          color: #a99aff;
        }

        .reports-hero-description {
          max-width: 490px;
          margin: 20px 0 0;
          color: #aab5d2;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 600;
        }

        .reports-hero-actions {
          display: flex;
          gap: 12px;
          margin-top: 25px;
        }

        .reports-primary-button {
          border: 0;
          border-radius: 11px;
          padding: 13px 21px;
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
          transition: .25s ease;
        }

        .reports-primary-button:hover {
          transform:
            translateY(-2px);
          box-shadow:
            0 16px 30px
            rgba(103,80,235,.38);
        }

        .reports-primary-button:disabled {
          opacity: .65;
          cursor: wait;
          transform: none;
        }

        .reports-secondary-button {
          border:
            1px solid
            rgba(155,164,211,.25);
          border-radius: 11px;
          padding: 13px 21px;
          color: #dbe2fa;
          background:
            rgba(255,255,255,.06);
          cursor: pointer;
          font-size: 13px;
          font-weight: 800;
        }

        .reports-mini-stats {
          display: flex;
          gap: 30px;
          margin-top: 32px;
        }

        .reports-mini-stat strong {
          display: block;
          color: white;
          font-size: 24px;
          font-weight: 900;
        }

        .reports-mini-stat span {
          display: block;
          margin-top: 4px;
          color: #8995b8;
          font-size: 11px;
          font-weight: 700;
        }

        /* =================================
           SPACE VISUAL
        ================================= */

        .reports-space {
          position: absolute;
          right: 1%;
          top: 0;
          width: 54%;
          height: 100%;
        }

        /* =================================
           NEW SUN
        ================================= */

        .reports-sun {
          position: absolute;
          left: 17%;
          top: 19%;
          width: 108px;
          height: 108px;
          border-radius: 50%;
          z-index: 8;
          background:
            radial-gradient(
              circle at 35% 30%,
              #fffde7 0%,
              #fff8a6 14%,
              #ffd84d 32%,
              #ff9d24 58%,
              #f05222 78%,
              #c92c24 100%
            );
          box-shadow:
            0 0 20px
            rgba(255,218,77,.95),
            0 0 45px
            rgba(255,164,43,.85),
            0 0 90px
            rgba(255,112,37,.55),
            0 0 145px
            rgba(255,73,35,.30);
          animation:
            reportSunFloat
            5s
            ease-in-out
            infinite;
        }

        .reports-sun::before {
          content: "";
          position: absolute;
          inset: -19px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(255,194,51,.20) 0%,
              rgba(255,125,35,.13) 42%,
              transparent 72%
            );
          filter: blur(7px);
          animation:
            reportSunCorona
            3.2s
            ease-in-out
            infinite;
        }

        .reports-sun::after {
          content: "";
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 65% 22%,
              rgba(255,244,159,.60) 0 5px,
              transparent 8px
            ),
            radial-gradient(
              circle at 24% 54%,
              rgba(210,64,26,.32) 0 7px,
              transparent 12px
            ),
            radial-gradient(
              circle at 68% 67%,
              rgba(191,52,22,.28) 0 6px,
              transparent 11px
            ),
            radial-gradient(
              circle at 43% 38%,
              rgba(255,235,99,.38) 0 8px,
              transparent 14px
            );
          mix-blend-mode: screen;
          animation:
            reportSunSurface
            8s
            linear
            infinite;
        }

        .sun-ray {
          position: absolute;
          left: 17%;
          top: 19%;
          width: 145px;
          height: 145px;
          transform:
            translate(-13px,-13px);
          border-radius: 50%;
          z-index: 6;
          border:
            1px solid
            rgba(255,205,71,.22);
          box-shadow:
            0 0 25px
            rgba(255,190,54,.18);
          animation:
            reportSunRay
            9s
            linear
            infinite;
        }

        .sun-ray::before,
        .sun-ray::after {
          content: "";
          position: absolute;
          inset: 13px;
          border-radius: 50%;
          border:
            1px dashed
            rgba(255,220,94,.15);
        }

        .sun-ray::after {
          inset: 27px;
          border:
            1px solid
            rgba(255,159,47,.16);
        }

        @keyframes reportSunFloat {
          0%,100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(5px,-9px)
              scale(1.035);
          }
        }

        @keyframes reportSunCorona {
          0%,100% {
            opacity: .65;
            transform: scale(.95);
          }

          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes reportSunSurface {
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

        @keyframes reportSunRay {
          from {
            transform:
              translate(-13px,-13px)
              rotate(0deg);
          }

          to {
            transform:
              translate(-13px,-13px)
              rotate(360deg);
          }
        }

        .reports-glow {
          position: absolute;
          left: 51%;
          top: 51%;
          width: 330px;
          height: 330px;
          transform:
            translate(-50%,-50%);
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(190,200,255,.38),
              rgba(102,91,244,.14) 45%,
              transparent 72%
            );
          filter: blur(11px);
          animation:
            reportGlow
            4s
            ease-in-out
            infinite;
        }

        @keyframes reportGlow {
          0%,100% {
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

        .analytics-globe {
          position: absolute;
          left: 51%;
          top: 51%;
          width: 185px;
          height: 185px;
          transform:
            translate(-50%,-50%);
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 30% 24%,
              #ffffff 0%,
              #b8d7ff 8%,
              #6575df 27%,
              #2935a4 52%,
              #111657 77%,
              #070a2b 100%
            );
          border:
            2px solid
            rgba(198,211,255,.78);
          box-shadow:
            inset -35px -28px 55px
            rgba(4,8,48,.75),
            inset 18px 12px 35px
            rgba(255,255,255,.20),
            0 0 30px
            rgba(91,117,255,.60),
            0 0 75px
            rgba(92,72,238,.40);
          z-index: 12;
          animation:
            globeFloat
            5s
            ease-in-out
            infinite;
        }

        .analytics-globe::before {
          content: "";
          position: absolute;
          inset: 14px;
          border-radius: 50%;
          background:
            repeating-linear-gradient(
              0deg,
              transparent 0 22px,
              rgba(133,220,255,.18)
              23px 24px
            );
          opacity: .8;
          mix-blend-mode: screen;
        }

        .analytics-globe::after {
          content: "";
          position: absolute;
          inset: 20px;
          border-radius: 50%;
          background:
            repeating-linear-gradient(
              90deg,
              transparent 0 26px,
              rgba(129,149,255,.16)
              27px 28px
            );
          opacity: .75;
        }

        @keyframes globeFloat {
          0%,100% {
            transform:
              translate(-50%,-50%)
              translateY(0)
              rotate(0deg);
          }

          50% {
            transform:
              translate(-50%,-50%)
              translateY(-10px)
              rotate(3deg);
          }
        }

        .globe-chart-line {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 130px;
          height: 65px;
          transform:
            translate(-50%,-50%)
            rotate(-8deg);
          z-index: 20;
          border-bottom:
            3px solid
            #35e0ff;
          border-right:
            3px solid
            #35e0ff;
          clip-path:
            polygon(
              0 70%,
              20% 55%,
              38% 63%,
              55% 28%,
              73% 42%,
              100% 5%,
              100% 13%,
              74% 50%,
              55% 36%,
              38% 71%,
              19% 63%,
              0 78%
            );
          filter:
            drop-shadow(
              0 0 6px
              rgba(53,224,255,.9)
            );
          animation:
            chartPulse
            2.7s
            ease-in-out
            infinite;
        }

        @keyframes chartPulse {
          0%,100% {
            opacity: .72;
          }

          50% {
            opacity: 1;
          }
        }

        .report-orbit {
          position: absolute;
          left: 51%;
          top: 51%;
          border-radius: 50%;
          border:
            1px solid
            rgba(135,151,255,.32);
          transform:
            translate(-50%,-50%);
        }

        .report-orbit.one {
          width: 435px;
          height: 145px;
          transform:
            translate(-50%,-50%)
            rotate(-20deg);
          animation:
            reportOrbitOne
            15s
            linear
            infinite;
        }

        .report-orbit.two {
          width: 360px;
          height: 130px;
          transform:
            translate(-50%,-50%)
            rotate(55deg);
          border-color:
            rgba(69,224,255,.19);
          animation:
            reportOrbitTwo
            18s
            linear
            infinite reverse;
        }

        .report-orbit.three {
          width: 285px;
          height: 405px;
          transform:
            translate(-50%,-50%)
            rotate(28deg);
          border-color:
            rgba(139,92,246,.18);
          animation:
            reportOrbitThree
            20s
            linear
            infinite;
        }

        @keyframes reportOrbitOne {
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

        @keyframes reportOrbitTwo {
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

        @keyframes reportOrbitThree {
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

        .report-node {
          position: absolute;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 30% 25%,
              white,
              #70d9ff 35%,
              #6759ee 100%
            );
          box-shadow:
            0 0 14px
            rgba(112,217,255,.90);
          z-index: 25;
        }

        .report-node.one {
          right: 18%;
          top: 22%;
          animation:
            reportNodeOne
            4s
            ease-in-out
            infinite;
        }

        .report-node.two {
          right: 27%;
          bottom: 18%;
          animation:
            reportNodeTwo
            5s
            ease-in-out
            infinite;
        }

        .report-node.three {
          left: 25%;
          top: 28%;
          animation:
            reportNodeThree
            4.5s
            ease-in-out
            infinite;
        }

        @keyframes reportNodeOne {
          0%,100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(18px,-15px);
          }
        }

        @keyframes reportNodeTwo {
          0%,100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(-17px,12px);
          }
        }

        @keyframes reportNodeThree {
          0%,100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(-10px,-17px);
          }
        }

        .report-space-card {
          position: absolute;
          width: 137px;
          padding: 12px 13px;
          border:
            1px solid
            rgba(143,153,217,.28);
          border-radius: 13px;
          background:
            rgba(15,20,61,.90);
          backdrop-filter: blur(12px);
          box-shadow:
            0 18px 32px
            rgba(0,0,0,.22);
          z-index: 30;
        }

        .report-space-card.one {
          left: 2%;
          top: 14%;
          animation:
            reportCardOne
            5s
            ease-in-out
            infinite;
        }

        .report-space-card.two {
          right: 1%;
          top: 53%;
          animation:
            reportCardTwo
            6s
            ease-in-out
            infinite;
        }

        .report-space-card strong {
          display: block;
          color: white;
          font-size: 11px;
          font-weight: 900;
        }

        .report-space-card span {
          display: block;
          margin-top: 4px;
          color: #8e9abb;
          font-size: 9px;
          font-weight: 700;
        }

        .report-space-card-value {
          margin-top: 7px;
          color: #b5a8ff;
          font-size: 20px;
          font-weight: 900;
        }

        @keyframes reportCardOne {
          0%,100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(12px,-9px);
          }
        }

        @keyframes reportCardTwo {
          0%,100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(-10px,11px);
          }
        }

        /* =================================
           ERROR
        ================================= */

        .reports-error {
          margin-top: 18px;
          padding: 11px 13px;
          border-radius: 9px;
          color: #c24454;
          background: #fff0f2;
          font-size: 11px;
          font-weight: 700;
        }

        /* =================================
           SECTION
        ================================= */

        .reports-section {
          margin-top: 38px;
        }

        .reports-section-title {
          margin-bottom: 17px;
        }

        .reports-section-title h2 {
          margin: 0;
          color: #13203b;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -.7px;
        }

        .reports-section-title p {
          margin: 5px 0 0;
          color: #75839c;
          font-size: 13px;
        }

        /* =================================
           OVERVIEW
        ================================= */

        .reports-overview-grid {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 17px;
        }

        .reports-overview-card {
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

        .reports-overview-card::after {
          content: "";
          position: absolute;
          width: 95px;
          height: 95px;
          right: -30px;
          top: -30px;
          border-radius: 50%;
          background: #edf0ff;
        }

        .reports-overview-icon {
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

        .report-icon-blue {
          color: #4356d9;
          background: #eef0ff;
        }

        .report-icon-purple {
          color: #7652d8;
          background: #f1ebff;
        }

        .report-icon-green {
          color: #078363;
          background: #e5faf2;
        }

        .report-icon-orange {
          color: #bd741e;
          background: #fff4df;
        }

        .reports-overview-value {
          position: relative;
          z-index: 2;
          margin-top: 15px;
          color: #101a33;
          font-size: 29px;
          font-weight: 900;
        }

        .reports-overview-label {
          position: relative;
          z-index: 2;
          margin-top: 3px;
          color: #71809a;
          font-size: 12px;
          font-weight: 700;
        }

        /* =================================
           PANELS
        ================================= */

        .reports-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 18px;
          margin-top: 18px;
        }

        .report-panel {
          min-width: 0;
          overflow: hidden;
          border:
            1px solid
            #e3e8f2;
          border-radius: 20px;
          background: white;
          box-shadow:
            0 9px 28px
            rgba(33,48,80,.07);
        }

        .report-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding:
            21px
            22px
            17px;
          border-bottom:
            1px solid
            #edf0f5;
        }

        .report-panel-header h3 {
          margin: 0;
          color: #17213a;
          font-size: 17px;
          font-weight: 900;
        }

        .report-panel-header p {
          margin: 5px 0 0;
          color: #8a96a8;
          font-size: 11px;
        }

        .report-panel-tag {
          padding: 6px 9px;
          border-radius: 15px;
          color: #6557df;
          background: #f0eeff;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .report-panel-body {
          padding: 22px;
        }

        /* =================================
           CONVERSION
        ================================= */

        .conversion-layout {
          display: grid;
          grid-template-columns:
            180px 1fr;
          align-items: center;
          gap: 25px;
        }

        .conversion-circle {
          position: relative;
          width: 170px;
          height: 170px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            conic-gradient(
              #6859ee
              calc(
                var(--conversion) * 1%
              ),
              #edf0f7 0
            );
        }

        .conversion-circle::before {
          content: "";
          position: absolute;
          width: 126px;
          height: 126px;
          border-radius: 50%;
          background: white;
        }

        .conversion-circle-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .conversion-circle-content strong {
          display: block;
          color: #17213a;
          font-size: 29px;
          font-weight: 900;
        }

        .conversion-circle-content span {
          display: block;
          margin-top: 2px;
          color: #8a96a8;
          font-size: 10px;
          font-weight: 800;
        }

        .conversion-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .conversion-item {
          display: grid;
          grid-template-columns:
            10px 1fr auto;
          align-items: center;
          gap: 9px;
        }

        .conversion-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .conversion-dot.won {
          background: #17b785;
        }

        .conversion-dot.lost {
          background: #df6573;
        }

        .conversion-dot.open {
          background: #6859ee;
        }

        .conversion-item-label {
          color: #65728a;
          font-size: 11px;
          font-weight: 700;
        }

        .conversion-item-value {
          color: #17213a;
          font-size: 13px;
          font-weight: 900;
        }

        .conversion-bar {
          grid-column: 2 / -1;
          height: 6px;
          overflow: hidden;
          border-radius: 10px;
          background: #edf0f5;
        }

        .conversion-bar-fill {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #6255ee,
              #22d3ee
            );
        }

        /* =================================
           SOURCE
        ================================= */

        .source-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .source-row {
          display: grid;
          grid-template-columns:
            110px 1fr 35px;
          align-items: center;
          gap: 10px;
        }

        .source-name {
          color: #65728a;
          font-size: 11px;
          font-weight: 700;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .source-track {
          height: 8px;
          overflow: hidden;
          border-radius: 10px;
          background: #edf0f5;
        }

        .source-fill {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #6255ee,
              #22d3ee
            );
          transition:
            width .5s ease;
        }

        .source-number {
          text-align: right;
          color: #17213a;
          font-size: 11px;
          font-weight: 900;
        }

        /* =================================
           PIPELINE
        ================================= */

        .pipeline-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .pipeline-row {
          display: grid;
          grid-template-columns:
            100px 1fr 40px;
          align-items: center;
          gap: 11px;
        }

        .pipeline-name {
          color: #65728a;
          font-size: 11px;
          font-weight: 700;
        }

        .pipeline-track {
          height: 10px;
          overflow: hidden;
          border-radius: 10px;
          background: #edf0f5;
        }

        .pipeline-fill {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #6658ee,
              #8f50ec
            );
          transition:
            width .5s ease;
        }

        .pipeline-number {
          text-align: right;
          color: #17213a;
          font-size: 12px;
          font-weight: 900;
        }

        /* =================================
           FOLLOW UPS
        ================================= */

        .followup-summary {
          display: grid;
          grid-template-columns:
            repeat(3,1fr);
          gap: 11px;
          margin-bottom: 21px;
        }

        .followup-summary-card {
          padding: 13px;
          border:
            1px solid
            #e8ebf2;
          border-radius: 12px;
          background: #fafbfe;
        }

        .followup-summary-card strong {
          display: block;
          color: #17213a;
          font-size: 21px;
          font-weight: 900;
        }

        .followup-summary-card span {
          display: block;
          margin-top: 4px;
          color: #8290a7;
          font-size: 10px;
          font-weight: 700;
        }

        .followup-progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 7px;
          color: #69768d;
          font-size: 10px;
          font-weight: 800;
        }

        .followup-progress {
          height: 9px;
          overflow: hidden;
          border-radius: 10px;
          background: #edf0f5;
        }

        .followup-progress-fill {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #6255ee,
              #22d3ee
            );
        }

        /* =================================
           EMPLOYEE
        ================================= */

        .employee-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .employee-row {
          display: grid;
          grid-template-columns:
            150px 1fr 70px;
          align-items: center;
          gap: 10px;
        }

        .employee-info {
          min-width: 0;
        }

        .employee-name {
          color: #65728a;
          font-size: 11px;
          font-weight: 900;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .employee-role {
          margin-top: 3px;
          color: #9aa5b7;
          font-size: 9px;
          font-weight: 700;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .employee-track {
          height: 8px;
          overflow: hidden;
          border-radius: 10px;
          background: #edf0f5;
        }

        .employee-fill {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #6859ee,
              #9a55ed
            );
        }

        .employee-total {
          text-align: right;
          color: #17213a;
          font-size: 10px;
          font-weight: 900;
        }

        .employee-total small {
          display: block;
          margin-top: 2px;
          color: #8a96a8;
          font-size: 8px;
          font-weight: 700;
        }

        .report-empty {
          padding: 35px 10px;
          text-align: center;
          color: #94a0b2;
          font-size: 11px;
          font-weight: 700;
        }

        /* =================================
           INSIGHT
        ================================= */

        .report-insight {
          margin-top: 18px;
          padding: 22px;
          overflow: hidden;
          position: relative;
          border:
            1px solid
            #e3e8f2;
          border-radius: 20px;
          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f8f8ff
            );
          box-shadow:
            0 9px 28px
            rgba(33,48,80,.07);
        }

        .report-insight::after {
          content: "";
          position: absolute;
          right: -55px;
          top: -55px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(105,89,238,.13),
              transparent 70%
            );
        }

        .report-insight-title {
          color: #7d8aa1;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .report-insight h3 {
          margin: 7px 0 5px;
          color: #17213a;
          font-size: 19px;
          font-weight: 900;
        }

        .report-insight p {
          max-width: 750px;
          margin: 0;
          color: #7d899d;
          font-size: 11px;
          line-height: 1.6;
        }

        .report-insight-stats {
          display: flex;
          gap: 28px;
          margin-top: 16px;
        }

        .report-insight-stat strong {
          display: block;
          color: #6255ee;
          font-size: 20px;
          font-weight: 900;
        }

        .report-insight-stat span {
          display: block;
          margin-top: 3px;
          color: #8b97a9;
          font-size: 9px;
          font-weight: 800;
        }

        /* =================================
           RESPONSIVE
        ================================= */

        @media(max-width:1100px) {

          .reports-hero-content {
            width: 53%;
          }

          .reports-space {
            width: 53%;
          }

          .analytics-globe {
            width: 160px;
            height: 160px;
          }

          .reports-sun {
            transform:
              scale(.85);
            transform-origin:
              center;
          }

          .sun-ray {
            transform:
              translate(-13px,-13px)
              scale(.85);
            transform-origin:
              center;
          }

          .reports-overview-grid {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media(max-width:800px) {

          .reports-hero {
            min-height: 680px;
          }

          .reports-hero-content {
            width: 100%;
            padding:
              40px
              30px
              0;
          }

          .reports-hero-content h2 {
            font-size: 40px;
          }

          .reports-space {
            top: 320px;
            left: 0;
            right: 0;
            width: 100%;
            height: 350px;
          }

          .reports-sun {
            left: 13%;
            top: 17%;
          }

          .sun-ray {
            left: 13%;
            top: 17%;
          }
        }

        @media(max-width:600px) {

          .reports-page-header h1 {
            font-size: 26px;
          }

          .reports-page-header {
            align-items: flex-start;
            gap: 12px;
          }

          .reports-hero {
            min-height: 640px;
            border-radius: 22px;
          }

          .reports-hero-content {
            padding:
              28px
              22px
              0;
          }

          .reports-hero-content h2 {
            font-size: 34px;
          }

          .reports-hero-description {
            font-size: 13px;
          }

          .reports-mini-stats {
            gap: 18px;
          }

          .reports-space {
            top: 310px;
            height: 310px;
            transform:
              scale(.82);
            transform-origin:
              top center;
          }

          .reports-sun {
            left: 13%;
            top: 17%;
          }

          .sun-ray {
            left: 13%;
            top: 17%;
          }

          .reports-overview-grid {
            grid-template-columns:
              1fr;
          }

          .conversion-layout {
            grid-template-columns:
              1fr;
            justify-items: center;
          }

          .conversion-list {
            width: 100%;
          }

          .followup-summary {
            grid-template-columns:
              1fr;
          }

          .source-row {
            grid-template-columns:
              85px 1fr 30px;
          }

          .pipeline-row {
            grid-template-columns:
              85px 1fr 30px;
          }

          .employee-row {
            grid-template-columns:
              100px 1fr 50px;
          }

          .reports-refresh {
            padding:
              0 11px;
          }

          .report-insight-stats {
            flex-wrap: wrap;
            gap: 18px;
          }
        }



        /* =============================================
           PRIYONIX DARK SPACE THEME
           Theme-only overrides: report calculations and
           Excel export behavior remain unchanged.
        ============================================= */
        .reports-page,
        .reports-page * {
          box-sizing: border-box;
          font-family: Inter, "Segoe UI", Arial, sans-serif !important;
        }

        .reports-page {
          min-width: 0;
          min-height: 100%;
          padding: 24px;
          margin: 0;
          color: #f4f7ff;
          border: 1px solid rgba(124, 157, 255, 0.24);
          border-radius: 24px;
          background:
            radial-gradient(circle at 82% 6%, rgba(70, 90, 255, 0.10), transparent 29%),
            radial-gradient(circle at 8% 78%, rgba(53, 229, 255, 0.055), transparent 28%),
            #071329;
          overflow: hidden;
        }

        .reports-page-header {
          gap: 16px;
          min-width: 0;
        }

        .reports-page-header h1 {
          color: #f4f7ff !important;
        }

        .reports-page-header p,
        .reports-section-title p {
          color: #a9bbda !important;
        }

        .reports-refresh {
          flex: 0 0 auto;
          color: #dbe7ff !important;
          background: rgba(18, 36, 70, 0.92) !important;
          border-color: #2b426c !important;
        }

        .reports-refresh:hover {
          color: #ffffff !important;
          background: #1a3158 !important;
          border-color: #796cff !important;
        }

        .reports-hero {
          border: 1px solid rgba(124, 157, 255, 0.16);
          box-shadow: 0 24px 55px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,.06);
        }

        .reports-section-title h2 {
          color: #f4f7ff !important;
        }

        .reports-overview-card,
        .report-panel,
        .report-insight {
          color: #f4f7ff;
          background: rgba(13, 27, 56, 0.96) !important;
          border: 1px solid rgba(124, 157, 255, 0.22) !important;
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.18) !important;
        }

        .reports-overview-card::after {
          background: rgba(80, 100, 190, 0.19) !important;
        }

        .reports-overview-value {
          color: #f4f7ff !important;
        }

        .reports-overview-label {
          color: #a9bbda !important;
        }

        .report-panel-header {
          border-bottom-color: rgba(124, 157, 255, 0.18) !important;
        }

        .report-panel-header h3 {
          color: #f4f7ff !important;
        }

        .report-panel-header p {
          color: #a9bbda !important;
        }

        .report-panel-tag {
          color: #c6bcff !important;
          background: rgba(112, 91, 240, 0.16) !important;
          border: 1px solid rgba(137, 124, 255, 0.22);
        }

        .report-panel-body {
          color: #dbe7ff;
        }

        .conversion-circle {
          background: conic-gradient(#6859ee calc(var(--conversion) * 1%), #263653 0) !important;
        }

        .conversion-circle::before {
          background: #0d1b38 !important;
          border: 1px solid rgba(124, 157, 255, 0.16);
        }

        .conversion-circle-content strong {
          color: #f4f7ff !important;
        }

        .conversion-circle-content span {
          color: #a9bbda !important;
        }

        .conversion-item-label,
        .source-name,
        .pipeline-name,
        .employee-name,
        .followup-progress-label {
          color: #b8c7e4 !important;
        }

        .conversion-item-value,
        .source-number,
        .pipeline-number,
        .employee-total {
          color: #f4f7ff !important;
        }

        .conversion-bar,
        .source-track,
        .pipeline-track,
        .followup-progress,
        .employee-track {
          background: #253653 !important;
        }

        .followup-summary-card {
          background: #122441 !important;
          border-color: #2a426a !important;
        }

        .followup-summary-card strong {
          color: #f4f7ff !important;
        }

        .followup-summary-card span,
        .employee-role,
        .employee-total small {
          color: #a9bbda !important;
        }

        .report-empty {
          color: #a9bbda !important;
          background: rgba(18, 36, 65, 0.55);
          border-radius: 12px;
        }

        .report-insight::after {
          background: radial-gradient(circle, rgba(105, 89, 238, 0.24), transparent 70%) !important;
        }

        .report-insight-title {
          color: #9db7e8 !important;
        }

        .report-insight h3 {
          color: #f4f7ff !important;
        }

        .report-insight p {
          color: #b3c2df !important;
        }

        .report-insight-stat strong {
          color: #a99aff !important;
        }

        .report-insight-stat span {
          color: #a9bbda !important;
        }

        .reports-error {
          color: #ffc6ce !important;
          background: rgba(116, 30, 54, 0.28) !important;
          border: 1px solid rgba(247, 110, 135, 0.35);
        }

        @media (max-width: 850px) {
          .reports-page {
            padding: 18px;
            border-radius: 20px;
          }

          .reports-page-header {
            flex-wrap: wrap;
            align-items: flex-start;
          }

          .reports-refresh {
            margin-left: auto;
          }

          .reports-hero-content {
            width: 100%;
            padding: 36px 26px 0;
          }

          .reports-hero-content h2 {
            font-size: clamp(32px, 5vw, 40px);
          }

          .reports-space {
            top: 315px;
            left: 0;
            right: 0;
            width: 100%;
            height: 340px;
          }

          .reports-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }

        @media (max-width: 600px) {
          .reports-page {
            padding: 13px;
            border-radius: 17px;
          }

          .reports-page-header {
            padding-top: 14px;
          }

          .reports-page-header h1 {
            font-size: 26px;
          }

          .reports-refresh {
            margin-left: 0;
          }

          .reports-hero-content {
            padding: 28px 20px 0;
          }

          .reports-hero-content h2 {
            font-size: 33px;
            letter-spacing: -1.2px;
          }

          .reports-overview-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .report-panel-header {
            gap: 10px;
            align-items: flex-start;
          }

          .report-panel-body {
            padding: 17px;
          }

          .report-insight {
            padding: 18px;
          }
        }

        /* ===== RESPONSIVE POLISH — all devices ===== */
        @media (max-width: 600px) {
          .reports-hero-actions {
            flex-wrap: wrap;
          }

          .reports-primary-button,
          .reports-secondary-button {
            flex: 1 1 100%;
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .reports-page-header h1 {
            font-size: 23px;
          }

          .reports-hero-content h2 {
            font-size: 28px;
          }

          .reports-hero {
            min-height: 540px;
          }
        }

        @media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
          .reports-hero {
            min-height: 360px !important;
          }

          .reports-space {
            display: none;
          }
        }

      `}</style>

      <div className="reports-page">

        {/* =================================
            PAGE HEADER
        ================================= */}

        <div className="reports-page-header">

          <div>

            <h1>
              Reports
            </h1>

            <p>
              Turn CRM activity into
              clear business intelligence.
            </p>

          </div>

          <button
            type="button"
            className="reports-refresh"
            onClick={loadReports}
          >
            ↻ Refresh Reports
          </button>

        </div>


        {/* =================================
            HERO
        ================================= */}

        <section className="reports-hero">

          <div className="reports-stars" />

          <div className="reports-hero-content">

            <div className="reports-status">

              <span className="reports-status-dot" />

              BUSINESS INTELLIGENCE ONLINE

            </div>

            <h2>

              See the data.

              <br />

              <span>
                Understand the business.
              </span>

            </h2>

            <p className="reports-hero-description">

              Transform leads, pipeline,
              follow-ups and employee
              activity into one clear
              intelligence view for better
              CRM decisions.

            </p>

            <div className="reports-hero-actions">

              <button
                type="button"
                className="reports-primary-button"
                onClick={
                  generateLatestReport
                }
                disabled={generating || !reportsReady}
              >
                {generating
                  ? "Generating Excel..."
                  : "Generate Latest Report →"}
              </button>

              <button
                type="button"
                className="reports-secondary-button"
                onClick={() => {
                  window.scrollTo({
                    top: 650,
                    behavior: "smooth",
                  });
                }}
              >
                View Analytics
              </button>

            </div>

            <div className="reports-mini-stats">

              <div className="reports-mini-stat">

                <strong>
                  {totalLeads}
                </strong>

                <span>
                  Total Leads
                </span>

              </div>

              <div className="reports-mini-stat">

                <strong>
                  {conversionRate}%
                </strong>

                <span>
                  Conversion
                </span>

              </div>

              <div className="reports-mini-stat">

                <strong>
                  {activeActions}
                </strong>

                <span>
                  Active Actions
                </span>

              </div>

            </div>

          </div>


          {/* =================================
              SPACE VISUAL
          ================================= */}

          <div className="reports-space">

            {/* NEW SUN */}

            <div className="sun-ray" />

            <div className="reports-sun" />


            <div className="reports-glow" />

            <div className="report-orbit one" />

            <div className="report-orbit two" />

            <div className="report-orbit three" />

            <div className="analytics-globe">

              <div className="globe-chart-line" />

            </div>

            <div className="report-node one" />

            <div className="report-node two" />

            <div className="report-node three" />

            <div className="report-space-card one">

              <strong>
                Conversion
              </strong>

              <span>
                Lead performance
              </span>

              <div className="report-space-card-value">
                {conversionRate}%
              </div>

            </div>

            <div className="report-space-card two">

              <strong>
                Pipeline
              </strong>

              <span>
                Open opportunities
              </span>

              <div className="report-space-card-value">
                {openLeads}
              </div>

            </div>

          </div>

        </section>


        {/* ERROR */}

        {error && (
          <div className="reports-error">
            {error}
          </div>
        )}


        {/* =================================
            OVERVIEW
        ================================= */}

        <section className="reports-section">

          <div className="reports-section-title">

            <h2>
              Report Overview
            </h2>

            <p>
              Key CRM intelligence at a glance.
            </p>

          </div>

          <div className="reports-overview-grid">

            <div className="reports-overview-card">

              <div className="
                reports-overview-icon
                report-icon-blue
              ">
                ◉
              </div>

              <div className="reports-overview-value">
                {totalLeads}
              </div>

              <div className="reports-overview-label">
                Total Leads
              </div>

            </div>


            <div className="reports-overview-card">

              <div className="
                reports-overview-icon
                report-icon-purple
              ">
                %
              </div>

              <div className="reports-overview-value">
                {conversionRate}%
              </div>

              <div className="reports-overview-label">
                Conversion Rate
              </div>

            </div>


            <div className="reports-overview-card">

              <div className="
                reports-overview-icon
                report-icon-green
              ">
                ✓
              </div>

              <div className="reports-overview-value">
                {wonLeads}
              </div>

              <div className="reports-overview-label">
                Won Leads
              </div>

            </div>


            <div className="reports-overview-card">

              <div className="
                reports-overview-icon
                report-icon-orange
              ">
                !
              </div>

              <div className="reports-overview-value">
                {pendingFollowUps}
              </div>

              <div className="reports-overview-label">
                Pending Follow-ups
              </div>

            </div>

          </div>

        </section>


        {/* =================================
            SALES INTELLIGENCE
        ================================= */}

        <section className="reports-section">

          <div className="reports-section-title">

            <h2>
              Sales Intelligence
            </h2>

            <p>
              Detailed performance across
              your CRM workflow.
            </p>

          </div>


          <div className="reports-grid">

            {/* CONVERSION */}

            <div className="report-panel">

              <div className="report-panel-header">

                <div>

                  <h3>
                    Lead Conversion
                  </h3>

                  <p>
                    Won, open and lost
                    opportunities.
                  </p>

                </div>

                <span className="report-panel-tag">
                  Conversion
                </span>

              </div>

              <div className="report-panel-body">

                <div className="conversion-layout">

                  <div
                    className="conversion-circle"
                    style={{
                      "--conversion":
                        conversionRate,
                    }}
                  >

                    <div className="
                      conversion-circle-content
                    ">

                      <strong>
                        {conversionRate}%
                      </strong>

                      <span>
                        Conversion
                      </span>

                    </div>

                  </div>


                  <div className="conversion-list">

                    <div className="conversion-item">

                      <span className="
                        conversion-dot
                        won
                      " />

                      <span className="
                        conversion-item-label
                      ">
                        Won
                      </span>

                      <span className="
                        conversion-item-value
                      ">
                        {wonLeads}
                      </span>

                      <div className="
                        conversion-bar
                      ">

                        <div
                          className="
                            conversion-bar-fill
                          "
                          style={{
                            width:
                              `${percentage(
                                wonLeads,
                                totalLeads
                              )}%`,
                          }}
                        />

                      </div>

                    </div>


                    <div className="conversion-item">

                      <span className="
                        conversion-dot
                        open
                      " />

                      <span className="
                        conversion-item-label
                      ">
                        Open
                      </span>

                      <span className="
                        conversion-item-value
                      ">
                        {openLeads}
                      </span>

                      <div className="
                        conversion-bar
                      ">

                        <div
                          className="
                            conversion-bar-fill
                          "
                          style={{
                            width:
                              `${percentage(
                                openLeads,
                                totalLeads
                              )}%`,
                          }}
                        />

                      </div>

                    </div>


                    <div className="conversion-item">

                      <span className="
                        conversion-dot
                        lost
                      " />

                      <span className="
                        conversion-item-label
                      ">
                        Lost
                      </span>

                      <span className="
                        conversion-item-value
                      ">
                        {lostLeads}
                      </span>

                      <div className="
                        conversion-bar
                      ">

                        <div
                          className="
                            conversion-bar-fill
                          "
                          style={{
                            width:
                              `${percentage(
                                lostLeads,
                                totalLeads
                              )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* LEAD SOURCE */}

            <div className="report-panel">

              <div className="report-panel-header">

                <div>

                  <h3>
                    Lead Source Report
                  </h3>

                  <p>
                    Where your leads are
                    coming from.
                  </p>

                </div>

                <span className="report-panel-tag">
                  Sources
                </span>

              </div>

              <div className="report-panel-body">

                {sourceEntries.length === 0 ? (

                  <div className="report-empty">
                    No lead source data
                    available.
                  </div>

                ) : (

                  <div className="source-list">

                    {sourceEntries.map(
                      (item) => (

                        <div
                          className="source-row"
                          key={item.name}
                        >

                          <div className="
                            source-name
                          ">
                            {item.name}
                          </div>

                          <div className="
                            source-track
                          ">

                            <div
                              className="
                                source-fill
                              "
                              style={{
                                width:
                                  `${Math.round(
                                    (item.value /
                                      maxSourceValue) *
                                      100
                                  )}%`,
                              }}
                            />

                          </div>

                          <div className="
                            source-number
                          ">
                            {item.value}
                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>


            {/* PIPELINE */}

            <div className="report-panel">

              <div className="report-panel-header">

                <div>

                  <h3>
                    Pipeline Summary
                  </h3>

                  <p>
                    Opportunities across
                    every sales stage.
                  </p>

                </div>

                <span className="report-panel-tag">
                  Pipeline
                </span>

              </div>

              <div className="report-panel-body">

                {pipelineEntries.length === 0 ? (

                  <div className="report-empty">
                    No pipeline data
                    available.
                  </div>

                ) : (

                  <div className="pipeline-list">

                    {pipelineEntries.map(
                      (item) => (

                        <div
                          className="pipeline-row"
                          key={item.name}
                        >

                          <div className="
                            pipeline-name
                          ">
                            {item.name}
                          </div>

                          <div className="
                            pipeline-track
                          ">

                            <div
                              className="
                                pipeline-fill
                              "
                              style={{
                                width:
                                  `${Math.round(
                                    (item.value /
                                      maxPipelineValue) *
                                      100
                                  )}%`,
                              }}
                            />

                          </div>

                          <div className="
                            pipeline-number
                          ">
                            {item.value}
                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>


            {/* FOLLOW UPS */}

            <div className="report-panel">

              <div className="report-panel-header">

                <div>

                  <h3>
                    Follow-up Report
                  </h3>

                  <p>
                    Track scheduled CRM
                    interactions.
                  </p>

                </div>

                <span className="report-panel-tag">
                  Activity
                </span>

              </div>

              <div className="report-panel-body">

                <div className="
                  followup-summary
                ">

                  <div className="
                    followup-summary-card
                  ">

                    <strong>
                      {totalFollowUps}
                    </strong>

                    <span>
                      Total
                    </span>

                  </div>

                  <div className="
                    followup-summary-card
                  ">

                    <strong>
                      {pendingFollowUps}
                    </strong>

                    <span>
                      Pending
                    </span>

                  </div>

                  <div className="
                    followup-summary-card
                  ">

                    <strong>
                      {completedFollowUps}
                    </strong>

                    <span>
                      Completed
                    </span>

                  </div>

                </div>


                <div className="
                  followup-progress-label
                ">

                  <span>
                    Completion
                  </span>

                  <span>
                    {followUpCompletion}%
                  </span>

                </div>


                <div className="
                  followup-progress
                ">

                  <div
                    className="
                      followup-progress-fill
                    "
                    style={{
                      width:
                        `${followUpCompletion}%`,
                    }}
                  />

                </div>


                <div
                  style={{
                    marginTop: "16px",
                    color: "#8a96a8",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  Cancelled:{" "}
                  {cancelledFollowUps}
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================
            EMPLOYEE PERFORMANCE
        ================================= */}

        <section className="reports-section">

          <div className="reports-section-title">

            <h2>
              Employee Performance
            </h2>

            <p>
              Compare CRM activity across
              assigned employees.
            </p>

          </div>


          <div className="report-panel">

            <div className="report-panel-header">

              <div>

                <h3>
                  Team Performance
                </h3>

                <p>
                  Task workload and
                  completion contribution.
                </p>

              </div>

              <span className="report-panel-tag">
                Team
              </span>

            </div>


            <div className="report-panel-body">

              {employeeEntries.length === 0 ? (

                <div className="report-empty">
                  No employee performance
                  data available.
                </div>

              ) : (

                <div className="employee-list">

                  {employeeEntries.map(
                    (employee) => {

                      const completion =
                        percentage(
                          employee.completedTasks,
                          employee.totalTasks
                        );

                      return (
                        <div
                          className="
                            employee-row
                          "
                          key={
                            employee.userId ||
                            employee.email ||
                            employee.name
                          }
                        >

                          <div className="
                            employee-info
                          ">

                            <div className="
                              employee-name
                            ">
                              {employee.name}
                            </div>

                            <div className="
                              employee-role
                            ">
                              {employee.role ||
                                "Employee"}
                            </div>

                          </div>


                          <div className="
                            employee-track
                          ">

                            <div
                              className="
                                employee-fill
                              "
                              style={{
                                width:
                                  `${Math.round(
                                    (employee.totalTasks /
                                      maxEmployeeTasks) *
                                      100
                                  )}%`,
                              }}
                            />

                          </div>


                          <div className="
                            employee-total
                          ">

                            {employee.totalTasks}

                            <small>
                              {completion}%
                              complete
                            </small>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </div>

        </section>


        {/* =================================
            INSIGHT
        ================================= */}

        <section className="report-insight">

          <div className="
            report-insight-title
          ">
            CRM Intelligence
          </div>

          <h3>
            Data becomes useful when every
            part of the customer journey
            connects.
          </h3>

          <p>
            PriyoniX CRM brings lead
            conversion, pipeline movement,
            follow-ups and employee
            performance into one reporting
            layer so the team can understand
            what is happening across the
            customer journey.
          </p>

          <div className="
            report-insight-stats
          ">

            <div className="
              report-insight-stat
            ">

              <strong>
                {wonLeads}
              </strong>

              <span>
                WON LEADS
              </span>

            </div>


            <div className="
              report-insight-stat
            ">

              <strong>
                {openLeads}
              </strong>

              <span>
                OPEN LEADS
              </span>

            </div>


            <div className="
              report-insight-stat
            ">

              <strong>
                {completedActions}
              </strong>

              <span>
                COMPLETED ACTIONS
              </span>

            </div>


            <div className="
              report-insight-stat
            ">

              <strong>
                {pendingFollowUps}
              </strong>

              <span>
                PENDING FOLLOW-UPS
              </span>

            </div>

          </div>

        </section>

      </div>
    </>
  );
}

export default Reports;