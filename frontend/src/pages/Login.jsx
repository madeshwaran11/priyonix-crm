import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import priyonixLogo from "../assets/priyonix_logo.jpeg";



function Login() {

  const navigate = useNavigate();



  const [form, setForm] = useState({

    email: "",

    password: "",

  });



  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  const [loginError, setLoginError] = useState("");

  const [launching, setLaunching] = useState(false);



  useEffect(() => {

    const rememberedEmail =

      localStorage.getItem("crmRememberedEmail");



    if (rememberedEmail) {

      setForm((previous) => ({

        ...previous,

        email: rememberedEmail,

      }));

      setRememberMe(true);

    }

  }, []);



  const handleChange = (event) => {

    const { name, value } = event.target;



    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));



    if (loginError) {

      setLoginError("");

    }

  };



  const handleLogin = async (event) => {

    event.preventDefault();



    if (!form.email.trim() || !form.password.trim()) {

      setLoginError(

        "Please enter your email address and password."

      );

      return;

    }



    setLoading(true);

    setLoginError("");



    try {

      const response = await api.post("/users/login", {

        email: form.email.trim(),

        password: form.password,

      });



      localStorage.setItem(

        "crmUser",

        JSON.stringify(response.data)

      );



      if (rememberMe) {

        localStorage.setItem(

          "crmRememberedEmail",

          form.email.trim()

        );

      } else {

        localStorage.removeItem("crmRememberedEmail");

      }



      setLaunching(true);



      window.setTimeout(() => {

        navigate("/dashboard", { replace: true });

      }, 2200);

    } catch (error) {

      console.error("Login error:", error);



      const message =

        error.response?.data?.message ||

        error.response?.data ||

        "Invalid email or password.";



      setLoginError(

        typeof message === "string"

          ? message

          : "Invalid email or password."

      );

    } finally {

      setLoading(false);

    }

  };



  const handleForgotPassword = () => {

  navigate("/forgot-password");

  };



  return (

    <div className="grand-login">

      <style>{styles}</style>
      <style>{responsiveStyles}</style>



      <div className="grand-stars" />

      <div className="grand-stars grand-stars-two" />

      <div className="grand-nebula nebula-purple" />

      <div className="grand-nebula nebula-blue" />

      <div className="grand-nebula nebula-pink" />

      <div className="space-grid" />



      <header className="login-brand">

        <div className="brand-mark"><img src={priyonixLogo} alt="PriyoniX logo" /></div>

        <div>

          <div className="brand-name">PriyoniX</div>

          <div className="brand-caption">CRM PLATFORM</div>

        </div>

      </header>



      <main className="login-main">



        <section className="login-showcase">



          <div className="system-pill">

            <span className="system-dot" />

            PRIYONIX CRM · SYSTEM ONLINE

          </div>



          <h1>

            Manage your

            <br />

            business{" "}

            <span>across the universe.</span>

          </h1>



          <p className="showcase-copy">

            One connected workspace for leads, customers,

            follow-ups, activities, tasks and intelligent

            business insights.

          </p>



          <div className="space-stage">



            <div className="stage-halo halo-one" />

            <div className="stage-halo halo-two" />



            <div className="stage-orbit stage-orbit-one" />

            <div className="stage-orbit stage-orbit-two" />

            <div className="stage-orbit stage-orbit-three" />



            <div className="orbit-particle particle-one" />

            <div className="orbit-particle particle-two" />

            <div className="orbit-particle particle-three" />



            <div className="crm-planet">



              <div className="planet-atmosphere" />



              <div className="planet-surface">

                <span className="surface-light" />

                <span className="surface-light surface-light-two" />

                <span className="surface-light surface-light-three" />

              </div>



              <div className="planet-cloud cloud-one" />

              <div className="planet-cloud cloud-two" />



              <div className="planet-brand">

                <img

                  src={priyonixLogo}

                  alt="PriyoniX logo"

                />

              </div>



            </div>



            <div className="planet-ring ring-front" />

            <div className="planet-ring ring-back" />



            <div className="space-satellite satellite-left">

              <div className="sat-body" />

              <i />

              <i />

            </div>



            <div className="space-satellite satellite-right">

              <div className="sat-body" />

              <i />

              <i />

            </div>



            <div className="floating-metric metric-one">

              <span>ACTIVE LEADS</span>

              <strong>248</strong>

              <small>+18.4%</small>

            </div>



            <div className="floating-metric metric-two">

              <span>CUSTOMERS</span>

              <strong>126</strong>

              <small>+12.8%</small>

            </div>



            <div className="floating-metric metric-three">

              <span>CONVERSION</span>

              <strong>68%</strong>

              <small>+9.2%</small>

            </div>



            <div className="floating-notification">

              <div className="notification-icon">✓</div>

              <div>

                <strong>New Lead</strong>

                <span>Just converted</span>

              </div>

            </div>



          </div>



          <div className="showcase-features">



            <div>

              <b>01</b>

              <strong>Connected CRM</strong>

              <span>One unified business workspace</span>

            </div>



            <div>

              <b>02</b>

              <strong>Smart Insights</strong>

              <span>Real-time business intelligence</span>

            </div>



            <div>

              <b>03</b>

              <strong>Secure Access</strong>

              <span>Role-based CRM control</span>

            </div>



          </div>



        </section>





        <section className="login-section">



          <div className="login-card">



            <div className="card-top-glow" />



            <div className="login-card-header">



              <div className="welcome-label">

                WELCOME BACK

              </div>



              <div className="secure-badge">

                <span />

                SECURE

              </div>



            </div>



            <h2>

              Sign in to

              <br />

              <span>your workspace.</span>

            </h2>



            <p className="login-copy">

              Enter your account details to continue

              to your PriyoniX CRM workspace.

            </p>



            <form onSubmit={handleLogin}>



              <div className="field">



                <label>Email Address</label>



                <div className="input-box">
                  <input

                    type="email"

                    name="email"

                    value={form.email}

                    onChange={handleChange}

                    placeholder="admin@priyonix.com"

                    autoComplete="email"

                    required

                  />



                </div>



              </div>





              <div className="field">



                <div className="label-row">



                  <label>Password</label>



                  <button

                    type="button"

                    onClick={handleForgotPassword}

                    className="forgot"

                  >

                    Forgot password?

                  </button>



                </div>



                <div className="input-box">
                  <input

                    type={

                      showPassword

                        ? "text"

                        : "password"

                    }

                    name="password"

                    value={form.password}

                    onChange={handleChange}

                    placeholder="Enter your password"

                    autoComplete="current-password"

                    required

                  />



                  <button

                    type="button"

                    className="show-password"

                    onClick={() =>

                      setShowPassword(

                        (previous) => !previous

                      )

                    }

                  >

                    {showPassword ? "Hide" : "Show"}

                  </button>



                </div>



              </div>





              <div className="login-options">



                <label className="remember">


                  <input

                    type="checkbox"

                    checked={rememberMe}

                    onChange={(event) =>

                      setRememberMe(

                        event.target.checked

                      )

                    }

                  />



                  <span>Remember me</span>



                </label>



                <span className="login-protected">

                  ◈ Protected workspace

                </span>



              </div>





              {loginError && (

                <div className="login-error">

                  {loginError}

                </div>

              )}





              <button

                className="submit-button"

                type="submit"

                disabled={loading}

              >



                {loading ? (

                  <>

                    <span className="spinner" />

                    Authenticating...

                  </>

                ) : (

                  <>

                    Enter PriyoniX

                    <span className="arrow">→</span>

                  </>

                )}



              </button>



            </form>





            <div className="card-footer">



              <span />

              <b>PRIYONIX CRM</b>

              <span />



              <p>

                © 2026 PriyoniX · Business management,

                simplified.

              </p>



            </div>



          </div>



        </section>



      </main>





      {launching && (

        <div className="launch-screen">



          <div className="launch-star-field" />



          <div className="launch-nebula" />



          <div className="launch-orbit launch-orbit-one" />

          <div className="launch-orbit launch-orbit-two" />

          <div className="launch-orbit launch-orbit-three" />



          <div className="launch-planet">



            <div className="launch-planet-light" />



            <div className="launch-logo">

              <img

                src={priyonixLogo}

                alt="PriyoniX logo"

              />

            </div>



          </div>



          <div className="launch-rays" />



          <div className="launch-copy">



            <span>ACCESS GRANTED</span>



            <h3>

              Welcome to PriyoniX

            </h3>



            <p>

              Preparing your CRM universe...

            </p>



            <div className="launch-progress">

              <i />

            </div>



          </div>



        </div>

      )}



    </div>

  );

}



const styles = `



* {

  box-sizing: border-box;

}



html,

body,

#root {

  margin: 0;

  min-height: 100%;

}



body {

  font-family:

    Arial,

    Helvetica,

    sans-serif;

}





/* =========================================

   PAGE

========================================= */



.grand-login {

  position: relative;

  min-height: 100vh;

  overflow: hidden;

  color: white;

  background:

    radial-gradient(

      circle at 32% 45%,

      rgba(76,55,189,.22),

      transparent 28%

    ),

    radial-gradient(

      circle at 75% 25%,

      rgba(32,103,215,.16),

      transparent 30%

    ),

    linear-gradient(

      135deg,

      #03091b 0%,

      #07122e 42%,

      #0b1237 68%,

      #050b20 100%

    );

}





/* =========================================

   STARS

========================================= */



.grand-stars {

  position: absolute;

  inset: 0;

  z-index: 0;

  pointer-events: none;

  background-image:

    radial-gradient(

      circle,

      rgba(255,255,255,.92) 0 1px,

      transparent 1.8px

    ),

    radial-gradient(

      circle,

      rgba(116,187,255,.8) 0 1px,

      transparent 1.7px

    ),

    radial-gradient(

      circle,

      rgba(255,211,112,.8) 0 1px,

      transparent 1.8px

    );

  background-size:

    145px 130px,

    220px 180px,

    310px 250px;

  animation:

    starMove

    32s

    linear

    infinite;

}



.grand-stars-two {

  opacity: .4;

  transform: scale(1.2);

  background-size:

    240px 210px,

    330px 280px,

    420px 350px;

  animation-duration: 48s;

}



@keyframes starMove {

  from {

    transform: translate(0,0);

  }



  to {

    transform: translate(-90px,50px);

  }

}





/* =========================================

   NEBULA

========================================= */



.grand-nebula {

  position: absolute;

  z-index: 0;

  border-radius: 50%;

  pointer-events: none;

  filter: blur(70px);

}



.nebula-purple {

  width: 600px;

  height: 300px;

  left: 5%;

  bottom: -80px;

  background:

    rgba(94,55,255,.15);

}



.nebula-blue {

  width: 500px;

  height: 320px;

  left: 38%;

  top: 5%;

  background:

    rgba(39,111,255,.12);

}



.nebula-pink {

  width: 350px;

  height: 230px;

  right: 0;

  bottom: 0;

  background:

    rgba(165,63,255,.10);

}





/* =========================================

   FLOOR GRID

========================================= */



.space-grid {

  position: absolute;

  z-index: 0;

  left: -5%;

  right: -5%;

  bottom: -230px;

  height: 440px;

  opacity: .14;

  transform:

    perspective(500px)

    rotateX(62deg);

  transform-origin:

    center bottom;

  background-image:

    linear-gradient(

      rgba(79,122,255,.35) 1px,

      transparent 1px

    ),

    linear-gradient(

      90deg,

      rgba(79,122,255,.35) 1px,

      transparent 1px

    );

  background-size: 75px 75px;

}





/* =========================================

   BRAND

========================================= */



.login-brand {

  position: absolute;

  top: 32px;

  left: 48px;

  z-index: 20;

  display: flex;

  align-items: center;

  gap: 12px;

}



.brand-mark {

  display: grid;

  place-items: center;

  width: 48px;

  height: 48px;

  overflow: hidden;

  border-radius: 14px;

  background: #f7f9ff;

  box-shadow:

    0 8px 30px

    rgba(0,0,0,.25);

}



.brand-mark img {

  display: block;

  width: 100%;

  height: 100%;

  padding: 4px;

  object-fit: contain;

  object-position: center;

  mix-blend-mode: darken;

}



.brand-name {

  color: white;

  font-size: 21px;

  line-height: 1;

  font-weight: 900;

}



.brand-caption {

  margin-top: 5px;

  color: #8190b2;

  font-size: 8px;

  font-weight: 800;

  letter-spacing: .1em;

}





/* =========================================

   MAIN GRID

========================================= */



.login-main {

  position: relative;

  z-index: 5;

  min-height: 100vh;

  display: grid;

  grid-template-columns:

    minmax(0, 1.55fr)

    minmax(390px, .75fr);

  gap: 30px;

  padding:

    120px 5vw 35px;

}





/* =========================================

   SHOWCASE

========================================= */



.login-showcase {

  position: relative;

  min-width: 0;

  display: flex;

  flex-direction: column;

  justify-content: center;

  padding-bottom: 15px;

}



.system-pill {

  width: fit-content;

  display: inline-flex;

  align-items: center;

  gap: 8px;

  padding: 8px 13px;

  border:

    1px solid

    rgba(106,143,255,.40);

  border-radius: 999px;

  background:

    rgba(41,65,150,.14);

  color: #a7bbef;

  font-size: 9px;

  font-weight: 900;

  letter-spacing: .08em;

}



.system-dot {

  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #36dfac;

  box-shadow:

    0 0 12px

    rgba(54,223,172,.9);

  animation:

    online

    1.7s

    ease-in-out

    infinite;

}



@keyframes online {

  0%,100% {

    transform: scale(.8);

    opacity: .65;

  }



  50% {

    transform: scale(1.15);

    opacity: 1;

  }

}



.login-showcase h1 {

  max-width: 850px;

  margin: 24px 0 0;

  color: white;

  font-size: clamp(48px, 5.1vw, 76px);

  line-height: .96;

  font-weight: 900;

  letter-spacing: -4px;

}



.login-showcase h1 span {

  color: #a496ff;

}



.showcase-copy {

  max-width: 570px;

  margin: 20px 0 0;

  color: #96a7c9;

  font-size: 14px;

  line-height: 1.75;

  font-weight: 600;

}





/* =========================================

   SPACE STAGE

========================================= */



.space-stage {

  position: relative;

  width: min(760px, 100%);

  height: 365px;

  margin-top: 4px;

}



.stage-halo {

  position: absolute;

  left: 52%;

  top: 51%;

  border-radius: 50%;

  transform:

    translate(-50%,-50%);

  pointer-events: none;

}



.halo-one {

  width: 420px;

  height: 260px;

  background:

    radial-gradient(

      ellipse,

      rgba(87,91,255,.27),

      transparent 68%

    );

  filter: blur(20px);

  animation:

    haloPulse

    5s

    ease-in-out

    infinite;

}



.halo-two {

  width: 240px;

  height: 240px;

  background:

    radial-gradient(

      circle,

      rgba(68,181,255,.16),

      transparent 70%

    );

  filter: blur(15px);

}



@keyframes haloPulse {

  0%,100% {

    opacity: .6;

    transform:

      translate(-50%,-50%)

      scale(.92);

  }



  50% {

    opacity: 1;

    transform:

      translate(-50%,-50%)

      scale(1.08);

  }

}





/* =========================================

   ORBITS

========================================= */



.stage-orbit {

  position: absolute;

  left: 52%;

  top: 51%;

  border-radius: 50%;

  border:

    1px solid

    rgba(114,151,255,.30);

  transform:

    translate(-50%,-50%);

  pointer-events: none;

}



.stage-orbit-one {

  width: 455px;

  height: 175px;

  transform:

    translate(-50%,-50%)

    rotate(-15deg);

  animation:

    orbitOne

    13s

    linear

    infinite;

}



.stage-orbit-two {

  width: 525px;

  height: 225px;

  border-color:

    rgba(166,117,255,.24);

  transform:

    translate(-50%,-50%)

    rotate(23deg);

  animation:

    orbitTwo

    17s

    linear

    infinite;

}



.stage-orbit-three {

  width: 310px;

  height: 310px;

  border-style: dashed;

  border-color:

    rgba(75,209,255,.20);

  animation:

    orbitThree

    22s

    linear

    infinite;

}



@keyframes orbitOne {

  from {

    transform:

      translate(-50%,-50%)

      rotate(-15deg);

  }



  to {

    transform:

      translate(-50%,-50%)

      rotate(345deg);

  }

}



@keyframes orbitTwo {

  from {

    transform:

      translate(-50%,-50%)

      rotate(23deg);

  }



  to {

    transform:

      translate(-50%,-50%)

      rotate(383deg);

  }

}



@keyframes orbitThree {

  from {

    transform:

      translate(-50%,-50%)

      rotate(0);

  }



  to {

    transform:

      translate(-50%,-50%)

      rotate(360deg);

  }

}





/* =========================================

   ORBIT PARTICLES

========================================= */



.orbit-particle {

  position: absolute;

  left: 52%;

  top: 51%;

  width: 9px;

  height: 9px;

  z-index: 12;

  border-radius: 50%;

}



.particle-one {

  background: #71ddff;

  box-shadow:

    0 0 16px

    rgba(113,221,255,.95);

  animation:

    particleOne

    8s

    linear

    infinite;

}



.particle-two {

  background: #ae86ff;

  box-shadow:

    0 0 16px

    rgba(174,134,255,.95);

  animation:

    particleTwo

    11s

    linear

    infinite;

}



.particle-three {

  background: #ffd76d;

  box-shadow:

    0 0 16px

    rgba(255,215,109,.9);

  animation:

    particleThree

    14s

    linear

    infinite;

}



@keyframes particleOne {

  from {

    transform:

      translate(-50%,-50%)

      rotate(0)

      translateX(228px);

  }



  to {

    transform:

      translate(-50%,-50%)

      rotate(360deg)

      translateX(228px);

  }

}



@keyframes particleTwo {

  from {

    transform:

      translate(-50%,-50%)

      rotate(0)

      translateX(263px);

  }



  to {

    transform:

      translate(-50%,-50%)

      rotate(360deg)

      translateX(263px);

  }

}



@keyframes particleThree {

  from {

    transform:

      translate(-50%,-50%)

      rotate(0)

      translateY(-155px);

  }



  to {

    transform:

      translate(-50%,-50%)

      rotate(360deg)

      translateY(-155px);

  }

}





/* =========================================

   PLANET

========================================= */



.crm-planet {

  position: absolute;

  left: 52%;

  top: 51%;

  width: 205px;

  height: 205px;

  z-index: 8;

  transform:

    translate(-50%,-50%);

  border-radius: 50%;

  animation:

    planetFloat

    5.5s

    ease-in-out

    infinite;

}



.planet-surface {

  position: absolute;

  inset: 0;

  overflow: hidden;

  border-radius: 50%;

  background:

    radial-gradient(

      circle at 31% 23%,

      #c9d9ff 0%,

      #788ff4 13%,

      #3c4dc5 34%,

      #20266f 62%,

      #090d35 100%

    );

  box-shadow:

    inset -35px -25px 50px

    rgba(1,4,24,.72),

    inset 18px 15px 35px

    rgba(255,255,255,.17),

    0 0 35px

    rgba(82,105,255,.75),

    0 0 95px

    rgba(69,84,255,.35);

}



.planet-atmosphere {

  position: absolute;

  inset: -9px;

  z-index: 4;

  border-radius: 50%;

  border:

    2px solid

    rgba(137,183,255,.42);

  box-shadow:

    0 0 25px

    rgba(77,153,255,.38);

}



.planet-surface::before {

  content: "";

  position: absolute;

  width: 145%;

  height: 35%;

  left: -22%;

  top: 31%;

  border-radius: 50%;

  background:

    rgba(123,161,255,.14);

  transform: rotate(-18deg);

  filter: blur(8px);

}



.surface-light {

  position: absolute;

  width: 75px;

  height: 34px;

  left: 23px;

  top: 50px;

  border-radius: 50%;

  background:

    rgba(117,155,255,.18);

  filter: blur(5px);

  transform: rotate(-22deg);

}



.surface-light-two {

  left: 98px;

  top: 117px;

  width: 55px;

  height: 22px;

  background:

    rgba(78,212,255,.13);

}



.surface-light-three {

  left: 40px;

  top: 145px;

  width: 65px;

  height: 18px;

  background:

    rgba(167,117,255,.13);

}



.planet-cloud {

  position: absolute;

  z-index: 3;

  height: 11px;

  border-radius: 50%;

  background:

    rgba(230,239,255,.15);

  filter: blur(3px);

}



.cloud-one {

  width: 100px;

  left: 50px;

  top: 65px;

  transform: rotate(-17deg);

}



.cloud-two {

  width: 75px;

  left: 75px;

  top: 130px;

  transform: rotate(20deg);

}



.planet-brand {

  position: absolute;

  inset: 0;

  z-index: 6;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

}



.planet-brand img {

  display: block;

  width: 58px;

  height: 58px;

  padding: 6px;

  object-fit: contain;

  object-position: center;

  border-radius: 15px;

  background: #ffffff;

  box-shadow:

    0 7px 18px

    rgba(0,0,0,.28);

  mix-blend-mode: normal;

}



.planet-brand span {

  margin-top: 8px;

  color: #eef3ff;

  font-size: 10px;

  font-weight: 900;

  letter-spacing: .15em;

}



@keyframes planetFloat {

  0%,100% {

    transform:

      translate(-50%,-50%)

      translateY(0)

      rotate(-1deg);

  }



  50% {

    transform:

      translate(-50%,-50%)

      translateY(-10px)

      rotate(1deg);

  }

}





/* =========================================

   PLANET RINGS

========================================= */



.planet-ring {

  position: absolute;

  left: 52%;

  top: 51%;

  width: 310px;

  height: 78px;

  z-index: 9;

  border:

    2px solid

    rgba(158,164,255,.55);

  border-radius: 50%;

  transform:

    translate(-50%,-50%)

    rotate(-17deg);

  pointer-events: none;

}



.ring-back {

  z-index: 5;

  border-color:

    rgba(85,111,255,.30);

}



.ring-front {

  box-shadow:

    0 0 15px

    rgba(129,119,255,.18);

  animation:

    ringSpin

    9s

    linear

    infinite;

}



@keyframes ringSpin {

  from {

    transform:

      translate(-50%,-50%)

      rotate(-17deg);

  }



  to {

    transform:

      translate(-50%,-50%)

      rotate(343deg);

  }

}





/* =========================================

   SATELLITES

========================================= */



.space-satellite {

  position: absolute;

  z-index: 15;

  width: 56px;

  height: 28px;

  animation:

    satelliteFloat

    5s

    ease-in-out

    infinite;

}



.satellite-left {

  left: 8%;

  top: 30%;

  transform: rotate(-15deg);

}



.satellite-right {

  right: 8%;

  bottom: 20%;

  transform:

    rotate(15deg)

    scale(.82);

  animation-delay: -2s;

}



.sat-body {

  position: absolute;

  left: 17px;

  top: 8px;

  width: 22px;

  height: 13px;

  border-radius: 4px;

  background:

    linear-gradient(

      145deg,

      #dbe6ff,

      #56658c

    );

  box-shadow:

    0 0 12px

    rgba(110,160,255,.35);

}



.space-satellite i {

  position: absolute;

  top: 5px;

  width: 15px;

  height: 18px;

  border:

    1px solid

    rgba(96,190,255,.55);

  background:

    linear-gradient(

      135deg,

      #193e78,

      #5b8fd0

    );

}



.space-satellite i:first-of-type {

  left: 0;

}



.space-satellite i:last-of-type {

  right: 0;

}



@keyframes satelliteFloat {

  0%,100% {

    margin-top: 0;

  }



  50% {

    margin-top: -9px;

  }

}





/* =========================================

   METRIC CARDS

========================================= */



.floating-metric {

  position: absolute;

  z-index: 20;

  min-width: 115px;

  padding: 12px 14px;

  border:

    1px solid

    rgba(151,172,255,.22);

  border-radius: 12px;

  background:

    rgba(13,25,57,.72);

  box-shadow:

    0 16px 35px

    rgba(0,0,0,.25),

    inset 0 1px 0

    rgba(255,255,255,.05);

  backdrop-filter: blur(10px);

}



.floating-metric span {

  display: block;

  color: #7788aa;

  font-size: 7px;

  font-weight: 900;

  letter-spacing: .07em;

}



.floating-metric strong {

  display: block;

  margin-top: 4px;

  color: white;

  font-size: 20px;

  font-weight: 900;

}



.floating-metric small {

  color: #47dba8;

  font-size: 7px;

  font-weight: 800;

}



.metric-one {

  left: 1%;

  top: 8%;

  transform: rotate(-5deg);

  animation:

    metricOne

    5.5s

    ease-in-out

    infinite;

}



.metric-two {

  right: 1%;

  top: 13%;

  transform: rotate(4deg);

  animation:

    metricTwo

    6s

    ease-in-out

    infinite;

}



.metric-three {

  right: 0;

  bottom: 12%;

  transform: rotate(3deg);

  animation:

    metricThree

    5.7s

    ease-in-out

    infinite;

}



@keyframes metricOne {

  0%,100% {

    transform:

      rotate(-5deg)

      translateY(0);

  }



  50% {

    transform:

      rotate(-5deg)

      translateY(-8px);

  }

}



@keyframes metricTwo {

  0%,100% {

    transform:

      rotate(4deg)

      translateY(0);

  }



  50% {

    transform:

      rotate(4deg)

      translateY(8px);

  }

}



@keyframes metricThree {

  0%,100% {

    transform:

      rotate(3deg)

      translateY(0);

  }



  50% {

    transform:

      rotate(3deg)

      translateY(-7px);

  }

}





/* =========================================

   NOTIFICATION

========================================= */



.floating-notification {

  position: absolute;

  z-index: 25;

  right: 14%;

  bottom: 0;

  display: flex;

  align-items: center;

  gap: 9px;

  min-width: 155px;

  padding: 9px 11px;

  border:

    1px solid

    rgba(150,170,255,.23);

  border-radius: 11px;

  background:

    rgba(17,28,59,.78);

  box-shadow:

    0 15px 30px

    rgba(0,0,0,.26);

  backdrop-filter: blur(10px);

  transform: rotate(3deg);

  animation:

    notificationFloat

    5s

    ease-in-out

    infinite;

}



.notification-icon {

  display: grid;

  place-items: center;

  width: 28px;

  height: 28px;

  border-radius: 8px;

  color: white;

  background:

    linear-gradient(

      145deg,

      #7455ff,

      #435ce0

    );

  font-size: 12px;

  font-weight: 900;

}



.floating-notification strong {

  display: block;

  color: white;

  font-size: 8px;

}



.floating-notification span {

  display: block;

  margin-top: 2px;

  color: #7f8fae;

  font-size: 6px;

}



@keyframes notificationFloat {

  0%,100% {

    transform:

      rotate(3deg)

      translateY(0);

  }



  50% {

    transform:

      rotate(3deg)

      translateY(-8px);

  }

}





/* =========================================

   FEATURES

========================================= */



.showcase-features {

  display: grid;

  grid-template-columns:

    repeat(3, minmax(0, 1fr));

  gap: 20px;

  width: min(760px, 100%);

  margin-top: 0;

}



.showcase-features > div {

  position: relative;

  padding-left: 30px;

}



.showcase-features b {

  position: absolute;

  left: 0;

  top: 0;

  color: #6378e8;

  font-size: 8px;

}



.showcase-features strong {

  display: block;

  color: #dbe4ff;

  font-size: 9px;

  font-weight: 900;

}



.showcase-features span {

  display: block;

  margin-top: 4px;

  color: #68799c;

  font-size: 7px;

  line-height: 1.4;

}





/* =========================================

   LOGIN SECTION

========================================= */



.login-section {

  display: flex;

  align-items: center;

  justify-content: center;

}



.login-card {

  position: relative;

  width: min(500px, 100%);

  padding: 42px 42px 31px;

  overflow: hidden;

  border:

    1px solid

    rgba(164,181,255,.22);

  border-radius: 24px;

  background:

    linear-gradient(

      145deg,

      rgba(21,30,69,.92),

      rgba(10,17,43,.94)

    );

  box-shadow:

    0 30px 80px

    rgba(0,0,0,.42),

    inset 0 1px 0

    rgba(255,255,255,.06);

  backdrop-filter: blur(22px);

}



.login-card::before {

  content: "";

  position: absolute;

  left: -100px;

  top: -130px;

  width: 260px;

  height: 260px;

  border-radius: 50%;

  background:

    rgba(87,91,255,.18);

  filter: blur(55px);

}



.login-card::after {

  content: "";

  position: absolute;

  right: -80px;

  bottom: -100px;

  width: 240px;

  height: 240px;

  border-radius: 50%;

  background:

    rgba(73,128,255,.11);

  filter: blur(50px);

}



.card-top-glow {

  position: absolute;

  left: 10%;

  right: 10%;

  top: 0;

  height: 1px;

  background:

    linear-gradient(

      90deg,

      transparent,

      #7289ff,

      #b18cff,

      transparent

    );

  box-shadow:

    0 0 15px

    rgba(118,137,255,.7);

}





/* =========================================

   LOGIN HEADER

========================================= */



.login-card-header {

  position: relative;

  z-index: 2;

  display: flex;

  align-items: center;

  justify-content: space-between;

}



.welcome-label {

  color: #7695ff;

  font-size: 9px;

  font-weight: 900;

  letter-spacing: .14em;

}



.secure-badge {

  display: flex;

  align-items: center;

  gap: 5px;

  padding: 6px 8px;

  border:

    1px solid

    rgba(65,208,156,.18);

  border-radius: 999px;

  color: #65d9ae;

  background:

    rgba(42,183,130,.07);

  font-size: 7px;

  font-weight: 900;

  letter-spacing: .06em;

}



.secure-badge span {

  width: 5px;

  height: 5px;

  border-radius: 50%;

  background: #46e1ac;

  box-shadow:

    0 0 8px

    #46e1ac;

}





/* =========================================

   LOGIN HEADING

========================================= */



.login-card h2 {

  position: relative;

  z-index: 2;

  margin: 15px 0 0;

  color: white;

  font-size: 37px;

  line-height: 1.04;

  font-weight: 900;

  letter-spacing: -1.5px;

}



.login-card h2 span {

  color: #9c92ff;

}



.login-copy {

  position: relative;

  z-index: 2;

  margin: 13px 0 0;

  color: #8291b1;

  font-size: 12px;

  line-height: 1.7;

}





/* =========================================

   FIELDS

========================================= */



.field {

  position: relative;

  z-index: 2;

  margin-top: 23px;

}



.label-row {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 8px;

}



.field label {

  color: #bac5dd;

  font-size: 10px;

  font-weight: 900;

}



.forgot {

  padding: 0;

  border: 0;

  color: #7d9aff;

  background: transparent;

  cursor: pointer;

  font-size: 8px;

  font-weight: 800;

}



.input-box {

  display: flex;

  align-items: center;

  height: 52px;

  overflow: hidden;

  border:

    1px solid

    rgba(146,163,210,.19);

  border-radius: 11px;

  background:

    rgba(6,13,34,.66);

  transition: .2s ease;

}



.input-box:focus-within {

  border-color:

    rgba(115,135,255,.65);

  box-shadow:

    0 0 0 3px

    rgba(91,106,255,.10),

    0 0 25px

    rgba(91,106,255,.08);

}



.input-box input {

  flex: 1;

  min-width: 0;

  height: 100%;
  box-sizing: border-box;
  appearance: none;

  padding: 0 15px;

  border: 0;

  outline: 0;

  color: #edf2ff;

  background: transparent;

  font-size: 12px;

}

.input-box input:-webkit-autofill,
.input-box input:-webkit-autofill:hover,
.input-box input:-webkit-autofill:focus {
  -webkit-text-fill-color: #edf2ff !important;
  caret-color: #edf2ff;
  -webkit-box-shadow: 0 0 0 1000px #0b1732 inset !important;
  box-shadow: 0 0 0 1000px #0b1732 inset !important;
  transition: background-color 99999s ease-in-out 0s;
}



.input-box input::placeholder {

  color: #5f6f91;

}



.show-password {

  padding: 0 13px;

  border: 0;

  color: #8292b2;

  background: transparent;

  cursor: pointer;

  font-size: 8px;

  font-weight: 800;

}





/* =========================================

   OPTIONS

========================================= */



.login-options {

  position: relative;

  z-index: 2;

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-top: 14px;

}



.remember {

  display: flex;

  align-items: center;

  gap: 7px;

  color: #7786a4;

  font-size: 8px;

  cursor: pointer;

}



.remember input {

  width: 13px;

  height: 13px;

  accent-color: #6478ee;

}



.login-protected {

  color: #687997;

  font-size: 8px;

}





/* =========================================

   ERROR

========================================= */



.login-error {

  position: relative;

  z-index: 2;

  margin-top: 14px;

  padding: 10px 12px;

  border:

    1px solid

    rgba(255,91,91,.22);

  border-radius: 9px;

  color: #ff9a9a;

  background:

    rgba(164,39,39,.12);

  font-size: 9px;

  line-height: 1.5;

}





/* =========================================

   SUBMIT

========================================= */



.submit-button {

  position: relative;

  z-index: 2;

  width: 100%;

  height: 52px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 12px;

  margin-top: 20px;

  border: 0;

  border-radius: 11px;

  color: white;

  background:

    linear-gradient(

      100deg,

      #2f6df0,

      #6248e8

    );

  box-shadow:

    0 12px 30px

    rgba(63,83,220,.28);

  cursor: pointer;

  font-size: 10px;

  font-weight: 900;

  transition: .25s ease;

}



.submit-button:hover:not(:disabled) {

  transform: translateY(-2px);

  box-shadow:

    0 17px 35px

    rgba(63,83,220,.38);

}



.submit-button:disabled {

  opacity: .7;

  cursor: not-allowed;

}



.arrow {

  font-size: 17px;

}



.spinner {

  width: 15px;

  height: 15px;

  border:

    2px solid

    rgba(255,255,255,.35);

  border-top-color: white;

  border-radius: 50%;

  animation:

    spin

    .7s

    linear

    infinite;

}



@keyframes spin {

  to {

    transform: rotate(360deg);

  }

}





/* =========================================

   FOOTER

========================================= */



.card-footer {

  position: relative;

  z-index: 2;

  margin-top: 30px;

  text-align: center;

}



.card-footer > span {

  display: inline-block;

  width: 27%;

  height: 1px;

  vertical-align: middle;

  background:

    rgba(130,146,183,.13);

}



.card-footer b {

  display: inline-block;

  margin: 0 10px;

  color: #586884;

  font-size: 7px;

  letter-spacing: .1em;

}



.card-footer p {

  margin: 10px 0 0;

  color: #566681;

  font-size: 7px;

}





/* =========================================

   LAUNCH SCREEN

========================================= */



.launch-screen {

  position: fixed;

  inset: 0;

  z-index: 99999;

  display: flex;

  align-items: center;

  justify-content: center;

  overflow: hidden;

  background:

    radial-gradient(

      circle at center,

      #252a91 0%,

      #11184f 25%,

      #050a24 58%,

      #020513 100%

    );

  animation:

    launchAppear

    .3s

    ease-out

    both;

}



@keyframes launchAppear {

  from {

    opacity: 0;

  }



  to {

    opacity: 1;

  }

}



.launch-star-field {

  position: absolute;

  inset: 0;

  background-image:

    radial-gradient(

      circle,

      white 0 1px,

      transparent 1.7px

    ),

    radial-gradient(

      circle,

      #71dfff 0 1px,

      transparent 1.7px

    );

  background-size:

    105px 105px,

    175px 155px;

  animation:

    launchStars

    2.2s

    linear

    infinite;

}



@keyframes launchStars {

  from {

    transform:

      scale(1)

      translate(0,0);

  }



  to {

    transform:

      scale(1.35)

      translate(-45px,30px);

  }

}



.launch-nebula {

  position: absolute;

  width: 650px;

  height: 380px;

  border-radius: 50%;

  background:

    radial-gradient(

      ellipse,

      rgba(98,76,255,.28),

      transparent 70%

    );

  filter: blur(20px);

  animation:

    launchNebula

    2.2s

    ease-in-out

    infinite;

}



@keyframes launchNebula {

  0%,100% {

    transform: scale(.85);

    opacity: .6;

  }



  50% {

    transform: scale(1.15);

    opacity: 1;

  }

}



.launch-orbit {

  position: absolute;

  left: 50%;

  top: 43%;

  border-radius: 50%;

  border:

    1px solid

    rgba(139,165,255,.65);

  transform:

    translate(-50%,-50%);

}



.launch-orbit-one {

  width: 280px;

  height: 280px;

  animation:

    launchSpin

    1.7s

    linear

    infinite;

}



.launch-orbit-two {

  width: 430px;

  height: 160px;

  border-color:

    rgba(186,134,255,.68);

  transform:

    translate(-50%,-50%)

    rotate(22deg);

  animation:

    launchSpinTwo

    2.1s

    linear

    infinite;

}



.launch-orbit-three {

  width: 530px;

  height: 230px;

  border-color:

    rgba(83,213,255,.30);

  transform:

    translate(-50%,-50%)

    rotate(-25deg);

  animation:

    launchSpinThree

    2.8s

    linear

    infinite reverse;

}



@keyframes launchSpin {

  to {

    transform:

      translate(-50%,-50%)

      rotate(360deg);

  }

}



@keyframes launchSpinTwo {

  to {

    transform:

      translate(-50%,-50%)

      rotate(382deg);

  }

}



@keyframes launchSpinThree {

  to {

    transform:

      translate(-50%,-50%)

      rotate(335deg);

  }

}



.launch-planet {

  position: absolute;

  left: 50%;

  top: 43%;

  width: 135px;

  height: 135px;

  display: grid;

  place-items: center;

  transform:

    translate(-50%,-50%);

  border-radius: 50%;

  background:

    radial-gradient(

      circle at 32% 24%,

      #dbe6ff,

      #7b90ff 17%,

      #3d4ec1 40%,

      #171b65 70%,

      #070a2c 100%

    );

  box-shadow:

    inset -25px -22px 35px

    rgba(0,0,0,.62),

    inset 12px 10px 25px

    rgba(255,255,255,.17),

    0 0 45px

    rgba(101,120,255,.9),

    0 0 120px

    rgba(77,88,255,.45);

  animation:

    launchPlanet

    1.9s

    ease-in-out

    infinite;

}



@keyframes launchPlanet {

  0%,100% {

    transform:

      translate(-50%,-50%)

      scale(1);

  }



  50% {

    transform:

      translate(-50%,-50%)

      scale(1.1);

  }

}



.launch-planet-light {

  position: absolute;

  inset: -8px;

  border:

    2px solid

    rgba(126,185,255,.42);

  border-radius: 50%;

  box-shadow:

    0 0 30px

    rgba(93,153,255,.5);

}



.launch-logo {

  display: grid;

  place-items: center;

  width: 72px;

  height: 72px;

  overflow: hidden;

  border-radius: 18px;

  background: #ffffff;

  box-shadow:

    0 10px 30px

    rgba(0,0,0,.30),

    0 0 24px

    rgba(110,143,255,.28);

}



.launch-logo img {

  display: block;

  width: 100%;

  height: 100%;

  padding: 7px;

  object-fit: contain;

  object-position: center;

  mix-blend-mode: normal;

}



.launch-rays {

  position: absolute;

  left: 50%;

  top: 43%;

  width: 220px;

  height: 220px;

  transform:

    translate(-50%,-50%);

  border-radius: 50%;

  border:

    1px dashed

    rgba(125,152,255,.25);

  animation:

    launchRay

    3s

    linear

    infinite;

}



@keyframes launchRay {

  to {

    transform:

      translate(-50%,-50%)

      rotate(360deg);

  }

}



.launch-copy {

  position: absolute;

  top: calc(43% + 115px);

  display: flex;

  flex-direction: column;

  align-items: center;

  text-align: center;

}



.launch-copy > span {

  color: #6fe5ff;

  font-size: 9px;

  font-weight: 900;

  letter-spacing: .2em;

}



.launch-copy h3 {

  margin: 9px 0 0;

  color: white;

  font-size: 27px;

  font-weight: 900;

}



.launch-copy p {

  margin: 6px 0 0;

  color: #91a0c8;

  font-size: 9px;

}



.launch-progress {

  width: 220px;

  height: 3px;

  margin-top: 17px;

  overflow: hidden;

  border-radius: 999px;

  background:

    rgba(130,150,220,.16);

}



.launch-progress i {

  display: block;

  width: 100%;

  height: 100%;

  transform:

    translateX(-100%);

  background:

    linear-gradient(

      90deg,

      #4edbff,

      #8269ff,

      #ba7aff

    );

  animation:

    progress

    2.1s

    linear

    forwards;

}



@keyframes progress {

  to {

    transform: translateX(0);

  }

}





/* =========================================

   RESPONSIVE

========================================= */



@media (max-width: 1200px) {



  .login-main {

    grid-template-columns:

      minmax(0, 1.3fr)

      minmax(370px, .8fr);

    padding-left: 4vw;

    padding-right: 4vw;

  }



  .login-showcase h1 {

    font-size: 56px;

  }



  .space-stage {

    transform: scale(.9);

    transform-origin: left center;

    width: 111%;

    margin-bottom: -25px;

  }



  .showcase-features {

    margin-top: -15px;

  }



}





@media (max-width: 950px) {



  .login-main {

    grid-template-columns: 1fr;

    padding:

      105px 35px 45px;

  }



  .login-showcase {

    display: none;

  }



  .login-brand {

    left: 30px;

    top: 25px;

  }



  .login-section {

    justify-content: center;

  }



  .login-card {

    width: min(500px, 100%);

  }



}





@media (max-width: 520px) {



  .login-main {

    padding:

      90px 15px 25px;

  }



  .login-brand {

    left: 18px;

    top: 18px;

  }



  .brand-mark {

    width: 42px;

    height: 42px;

  }



  .brand-name {

    font-size: 18px;

  }



  .login-card {

    padding:

      32px 25px 26px;

    border-radius: 20px;

  }



  .login-card h2 {

    font-size: 32px;

  }



  .login-options {

    align-items: flex-start;

    flex-direction: column;

    gap: 10px;

  }



  .launch-orbit-one {

    width: 220px;

    height: 220px;

  }



  .launch-orbit-two {

    width: 320px;

    height: 125px;

  }



  .launch-orbit-three {

    width: 400px;

    height: 175px;

  }



  .launch-planet {

    width: 105px;

    height: 105px;

  }



  .launch-logo {

    width: 62px;

    height: 62px;

  }



  .launch-copy h3 {

    font-size: 22px;

  }



}



`;



const responsiveStyles = `
/* ===== RESPONSIVE POLISH — all devices ===== */
.grand-login,
.login-main {
  min-height: 100vh;
  min-height: 100dvh;
}

@media (max-width: 520px) {
  .input-box input {
    font-size: 16px;
  }
}

@media (max-width: 400px) {
  .login-card {
    padding: 26px 18px 22px;
  }
}

@media (max-width: 360px) {
  .login-card {
    padding: 22px 14px 20px;
  }

  .login-card h2 {
    font-size: 26px;
  }
}

@media (max-width: 950px) and (max-height: 540px) and (orientation: landscape) {
  .login-main {
    padding: 64px 18px 18px;
  }

  .login-card {
    padding: 22px 26px 20px;
  }

  .launch-copy {
    top: calc(43% + 88px);
  }
}
`;

export default Login;
