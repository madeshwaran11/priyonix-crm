import { useEffect, useState } from "react";



import api from "../services/api";







function Profile() {



  const [user, setUser] = useState(null);



  const [loading, setLoading] = useState(true);







  useEffect(() => {



    loadProfile();



  }, []);







  const loadProfile = async () => {



    try {



      const storedUser = localStorage.getItem("crmUser");







      if (!storedUser) {



        setLoading(false);



        return;



      }







      const loggedInUser = JSON.parse(storedUser);







      const response = await api.get(



        "/users/me"



      );







      setUser(response.data);







    } catch (error) {



      console.error("Error loading profile:", error);



      alert("Failed to load profile.");



    } finally {



      setLoading(false);



    }



  };







  if (loading) {



    return (



      <>



        <style>{profileStyles}</style>







        <div className="profile-page">



          <div className="profile-loading">



            <div className="profile-loader-orbit">



              <div className="profile-loader-core">



                P



              </div>



            </div>







            <h2>Loading Profile</h2>



            <p>Connecting to your PriyoniX CRM identity...</p>



          </div>



        </div>



      </>



    );



  }







  if (!user) {



    return (



      <>



        <style>{profileStyles}</style>







        <div className="profile-page">



          <div className="profile-empty">



            <div className="empty-core">



              ?



            </div>







            <h1>User information not found</h1>







            <p>



              Your PriyoniX CRM profile information



              could not be loaded.



            </p>



          </div>



        </div>



      </>



    );



  }







  const initial = user.name



    ? user.name.charAt(0).toUpperCase()



    : "U";







  return (



    <>



      <style>{profileStyles}</style>







      <div className="profile-page">







        {/* =========================================



            PAGE HEADER



        ========================================= */}







        <div className="profile-page-header">







          <div>



            <h1>



              Profile



            </h1>







            <p>



              Manage your PriyoniX CRM identity



              and account information.



            </p>



          </div>







        </div>











        {/* =========================================



            HERO



        ========================================= */}







        <section className="profile-hero">







          <div className="profile-stars" />







          <div className="profile-nebula nebula-one" />



          <div className="profile-nebula nebula-two" />











          {/* =====================================



              HERO CONTENT



          ===================================== */}







          <div className="profile-hero-content">







            <div className="profile-status">







              <span className="profile-status-dot" />







              PROFILE SYSTEM ONLINE







            </div>











            <h2>







              Your identity.







              <br />







              <span>



                One connected universe.



              </span>







            </h2>











            <p className="profile-hero-description">







              View your personal information,



              account role and current status



              inside the PriyoniX CRM workspace.







            </p>











            <div className="profile-mini-stats">







              <div className="profile-mini-stat">







                <strong>



                  {user.active ? "ON" : "OFF"}



                </strong>







                <span>



                  Account Status



                </span>







              </div>











              <div className="profile-mini-stat">







                <strong>



                  {user.role || "USER"}



                </strong>







                <span>



                  Access Role



                </span>







              </div>











              <div className="profile-mini-stat">







                <strong>



                  {initial}



                </strong>







                <span>



                  Identity Core



                </span>







              </div>







            </div>







          </div>











          {/* =====================================



              3D IDENTITY SPACE



          ===================================== */}







          <div className="profile-space">







            <div className="space-glow" />







            <div className="profile-orbit orbit-one" />



            <div className="profile-orbit orbit-two" />



            <div className="profile-orbit orbit-three" />











            <div className="profile-orbit-dot dot-one" />



            <div className="profile-orbit-dot dot-two" />



            <div className="profile-orbit-dot dot-three" />











            {/* Identity Core */}







            <div className="identity-core">







              <div className="identity-core-inner">







                <div className="identity-letter">



                  {initial}



                </div>







                <div className="identity-name">



                  {user.name}



                </div>







                <div className="identity-role">



                  {user.role || "USER"}



                </div>







              </div>







            </div>











            {/* Floating user cards */}







            <div className="profile-float-card card-top">







              <div className="float-icon">



                ✦



              </div>







              <div>



                <span>



                  IDENTITY



                </span>







                <strong>



                  VERIFIED



                </strong>



              </div>







            </div>











            <div className="profile-float-card card-right">







              <div className="float-icon purple">



                ◈



              </div>







              <div>



                <span>



                  ACCESS



                </span>







                <strong>



                  {user.role || "USER"}



                </strong>



              </div>







            </div>











            <div className="profile-float-card card-bottom">







              <div className="float-icon green">



                ✓



              </div>







              <div>



                <span>



                  ACCOUNT



                </span>







                <strong>



                  {user.active



                    ? "ACTIVE"



                    : "INACTIVE"}



                </strong>



              </div>







            </div>











            {/* Small satellites */}







            <div className="profile-satellite satellite-one">



              <span />



            </div>







            <div className="profile-satellite satellite-two">



              <span />



            </div>







            <div className="profile-satellite satellite-three">



              <span />



            </div>











            {/* Light trails */}







            <div className="light-trail trail-one" />



            <div className="light-trail trail-two" />







          </div>







        </section>











        {/* =========================================



            PROFILE INFORMATION



        ========================================= */}







        <section className="profile-information">







          <div className="profile-section-heading">







            <div>







              <span>



                ACCOUNT INTELLIGENCE



              </span>







              <h2>



                My Profile



              </h2>







              <p>



                Your PriyoniX CRM account information.



              </p>







            </div>







            <div className="profile-online-badge">







              <span />







              SYSTEM ONLINE







            </div>







          </div>











          <div className="profile-content-grid">











            {/* =====================================



                MAIN PROFILE CARD



            ===================================== */}







            <div className="profile-card">







              <div className="profile-card-header">







                <div className="profile-avatar">







                  <div className="avatar-ring" />







                  <span>



                    {initial}



                  </span>







                </div>











                <div className="profile-card-title">







                  <span>



                    CRM IDENTITY



                  </span>







                  <h3>



                    {user.name}



                  </h3>







                  <p>



                    {user.email}



                  </p>







                </div>







              </div>











              <div className="profile-divider" />











              <div className="profile-details">







                <ProfileRow



                  label="Name"



                  value={user.name}



                  icon="◉"



                />







                <ProfileRow



                  label="Email"



                  value={user.email}



                  icon="✉"



                />







                <ProfileRow



                  label="Phone"



                  value={user.phone || "-"}



                  icon="◌"



                />







                <ProfileRow



                  label="Role"



                  value={user.role}



                  icon="◆"



                />











                <div className="profile-detail-row">







                  <div className="profile-detail-label">







                    <div className="detail-icon status-icon">



                      ✓



                    </div>







                    <strong>



                      Status



                    </strong>







                  </div>











                  <span



                    className={



                      user.active



                        ? "status-badge active"



                        : "status-badge inactive"



                    }



                  >







                    <span />







                    {user.active



                      ? "Active"



                      : "Inactive"}







                  </span>







                </div>







              </div>







            </div>











            {/* =====================================



                RIGHT SIDE ACCOUNT PANEL



            ===================================== */}







            <div className="account-status-card">







              <div className="account-card-glow" />







              <div className="account-card-label">



                ACCOUNT STATUS



              </div>











              <div className="account-status-visual">







                <div className="status-orbit orbit-a" />



                <div className="status-orbit orbit-b" />







                <div className="status-core">







                  <span>



                    {user.active ? "✓" : "!"}



                  </span>







                </div>







              </div>











              <h3>



                {user.active



                  ? "Account Active"



                  : "Account Inactive"}



              </h3>











              <p>



                {user.active



                  ? "Your PriyoniX CRM account is currently active and ready to use."



                  : "Your PriyoniX CRM account is currently inactive."}



              </p>











              <div className="account-status-line">







                <span>



                  ACCESS LEVEL



                </span>







                <strong>



                  {user.role || "USER"}



                </strong>







              </div>











              <div className="account-status-line">







                <span>



                  PROFILE



                </span>







                <strong>



                  VERIFIED



                </strong>







              </div>











              <div className="account-status-line">







                <span>



                  CRM SESSION



                </span>







                <strong>



                  CONNECTED



                </strong>







              </div>







            </div>







          </div>







        </section>







      </div>



    </>



  );



}











/* =============================================



   PROFILE ROW



\============================================= */







function ProfileRow({



  label,



  value,



  icon,



}) {



  return (



    <div className="profile-detail-row">







      <div className="profile-detail-label">







        <div className="detail-icon">



          {icon}



        </div>







        <strong>



          {label}



        </strong>







      </div>







      <span className="profile-detail-value">



        {value}



      </span>







    </div>



  );



}











/* =============================================



   CSS



\============================================= */







const profileStyles = `







* {



  box-sizing: border-box;



}











/* =============================================



   PAGE



\============================================= */







.profile-page {



  min-height: 100vh;



  padding: 30px 36px 60px;



  background:



    radial-gradient(



      circle at 80% 15%,



      rgba(103, 78, 255, .10),



      transparent 30%



    ),



    radial-gradient(



      circle at 15% 75%,



      rgba(36, 122, 255, .07),



      transparent 28%



    ),



    #f7f9fd;



  color: #17213a;



  font-family:



    Arial,



    Helvetica,



    sans-serif;



  overflow-x: hidden;



}











/* =============================================



   PAGE HEADER



\============================================= */







.profile-page-header {



  margin-bottom: 24px;



}







.profile-page-header h1 {



  margin: 0;



  color: #101a33;



  font-size: 30px;



  line-height: 1.1;



  font-weight: 900;



  letter-spacing: -.8px;



}







.profile-page-header p {



  margin: 8px 0 0;



  color: #71809a;



  font-size: 14px;



  font-weight: 500;



}











/* =============================================



   HERO



\============================================= */







.profile-hero {



  position: relative;



  min-height: 570px;



  overflow: hidden;



  border-radius: 28px;



  background:



    radial-gradient(



      circle at 78% 40%,



      rgba(92, 74, 255, .42),



      transparent 24%



    ),



    radial-gradient(



      circle at 70% 75%,



      rgba(38, 105, 255, .24),



      transparent 30%



    ),



    linear-gradient(



      120deg,



      #080e2d 0%,



      #11164a 45%,



      #171252 70%,



      #08162f 100%



    );



  box-shadow:



    0 25px 65px



    rgba(18, 27, 67, .20);



}











/* =============================================



   STARS



\============================================= */







.profile-stars {



  position: absolute;



  inset: 0;



  opacity: .85;



  background-image:



    radial-gradient(



      circle,



      rgba(255,255,255,.95) 0 1px,



      transparent 1.7px



    ),



    radial-gradient(



      circle,



      rgba(130,175,255,.75) 0 1px,



      transparent 1.6px



    ),



    radial-gradient(



      circle,



      rgba(255,214,115,.75) 0 1.2px,



      transparent 1.8px



    );



  background-size:



    145px 130px,



    220px 190px,



    300px 250px;



  background-position:



    10px 20px,



    80px 50px,



    20px 100px;



  animation:



    starDrift



    24s



    linear



    infinite;



}







@keyframes starDrift {



  from {



    transform: translate3d(0,0,0);



  }







  to {



    transform: translate3d(-80px,45px,0);



  }



}











/* =============================================



   NEBULA



\============================================= */







.profile-nebula {



  position: absolute;



  border-radius: 50%;



  filter: blur(35px);



  pointer-events: none;



}







.nebula-one {



  width: 300px;



  height: 170px;



  right: 4%;



  top: 18%;



  background:



    rgba(93, 77, 255, .20);



  transform: rotate(-18deg);



}







.nebula-two {



  width: 260px;



  height: 140px;



  right: 22%;



  bottom: 3%;



  background:



    rgba(25, 112, 255, .13);



  transform: rotate(20deg);



}











/* =============================================



   HERO CONTENT



\============================================= */







.profile-hero-content {



  position: relative;



  z-index: 10;



  width: 49%;



  padding: 54px 0 40px 48px;



}







.profile-status {



  display: inline-flex;



  align-items: center;



  gap: 8px;



  padding: 8px 13px;



  border:



    1px solid



    rgba(117,145,255,.45);



  border-radius: 999px;



  background:



    rgba(55,75,160,.16);



  color: #c9d3ff;



  font-size: 11px;



  font-weight: 900;



  letter-spacing: .04em;



}







.profile-status-dot {



  width: 7px;



  height: 7px;



  border-radius: 50%;



  background: #22d3ee;



  box-shadow:



    0 0 10px



    rgba(34,211,238,.95);



  animation:



    onlinePulse



    1.8s



    ease-in-out



    infinite;



}







@keyframes onlinePulse {



  0%,100% {



    opacity: .65;



    transform: scale(.85);



  }







  50% {



    opacity: 1;



    transform: scale(1.15);



  }



}











.profile-hero-content h2 {



  margin: 25px 0 0;



  color: white;



  font-size: 49px;



  line-height: 1.04;



  font-weight: 900;



  letter-spacing: -2.4px;



}







.profile-hero-content h2 span {



  color: #a996ff;



}











.profile-hero-description {



  max-width: 520px;



  margin: 22px 0 0;



  color: #aab6d4;



  font-size: 15px;



  line-height: 1.7;



  font-weight: 600;



}











/* =============================================



   MINI STATS



\============================================= */







.profile-mini-stats {



  display: flex;



  gap: 34px;



  margin-top: 45px;



}







.profile-mini-stat {



  display: flex;



  flex-direction: column;



  gap: 5px;



}







.profile-mini-stat strong {



  color: white;



  font-size: 23px;



  line-height: 1;



  font-weight: 900;



}







.profile-mini-stat span {



  color: #8996b7;



  font-size: 10px;



  font-weight: 700;



  letter-spacing: .02em;



}











/* =============================================



   3D PROFILE SPACE



\============================================= */







.profile-space {



  position: absolute;



  right: 0;



  top: 0;



  width: 56%;



  height: 100%;



  overflow: hidden;



}











/* central glow */







.space-glow {



  position: absolute;



  left: 53%;



  top: 50%;



  width: 300px;



  height: 300px;



  transform:



    translate(-50%,-50%);



  border-radius: 50%;



  background:



    radial-gradient(



      circle,



      rgba(105,120,255,.40) 0%,



      rgba(83,75,255,.22) 35%,



      transparent 72%



    );



  filter: blur(10px);



  animation:



    coreGlow



    4s



    ease-in-out



    infinite;



}







@keyframes coreGlow {



  0%,100% {



    opacity: .7;



    transform:



      translate(-50%,-50%)



      scale(.95);



  }







  50% {



    opacity: 1;



    transform:



      translate(-50%,-50%)



      scale(1.08);



  }



}











/* =============================================



   ORBITS



\============================================= */







.profile-orbit {



  position: absolute;



  left: 53%;



  top: 50%;



  border:



    1px solid



    rgba(154,165,255,.32);



  border-radius: 50%;



  transform:



    translate(-50%,-50%);



  pointer-events: none;



}







.orbit-one {



  width: 430px;



  height: 190px;



  transform:



    translate(-50%,-50%)



    rotate(16deg);



  animation:



    orbitRotateOne



    12s



    linear



    infinite;



}







.orbit-two {



  width: 480px;



  height: 250px;



  transform:



    translate(-50%,-50%)



    rotate(-31deg);



  border-color:



    rgba(75,184,255,.22);



  animation:



    orbitRotateTwo



    16s



    linear



    infinite;



}







.orbit-three {



  width: 350px;



  height: 350px;



  border:



    1px dashed



    rgba(170,134,255,.22);



  animation:



    orbitSpin



    22s



    linear



    infinite;



}







@keyframes orbitRotateOne {



  from {



    transform:



      translate(-50%,-50%)



      rotate(16deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(376deg);



  }



}







@keyframes orbitRotateTwo {



  from {



    transform:



      translate(-50%,-50%)



      rotate(-31deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(329deg);



  }



}







@keyframes orbitSpin {



  from {



    transform:



      translate(-50%,-50%)



      rotate(0deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(360deg);



  }



}











/* =============================================



   ORBIT DOTS



\============================================= */







.profile-orbit-dot {



  position: absolute;



  left: 53%;



  top: 50%;



  width: 10px;



  height: 10px;



  border-radius: 50%;



  z-index: 6;



}







.dot-one {



  background: #6ee7ff;



  box-shadow:



    0 0 15px



    rgba(110,231,255,.95);



  animation:



    dotOrbitOne



    8s



    linear



    infinite;



}







.dot-two {



  background: #a98cff;



  box-shadow:



    0 0 15px



    rgba(169,140,255,.95);



  animation:



    dotOrbitTwo



    11s



    linear



    infinite;



}







.dot-three {



  background: #ffd76a;



  box-shadow:



    0 0 15px



    rgba(255,215,106,.95);



  animation:



    dotOrbitThree



    14s



    linear



    infinite;



}







@keyframes dotOrbitOne {



  from {



    transform:



      translate(-50%,-50%)



      rotate(0deg)



      translateX(215px)



      rotate(0deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(360deg)



      translateX(215px)



      rotate(-360deg);



  }



}







@keyframes dotOrbitTwo {



  from {



    transform:



      translate(-50%,-50%)



      rotate(0deg)



      translateX(240px)



      rotate(0deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(360deg)



      translateX(240px)



      rotate(-360deg);



  }



}







@keyframes dotOrbitThree {



  from {



    transform:



      translate(-50%,-50%)



      rotate(0deg)



      translateY(-175px)



      rotate(0deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(360deg)



      translateY(-175px)



      rotate(-360deg);



  }



}











/* =============================================



   IDENTITY CORE



\============================================= */







.identity-core {



  position: absolute;



  left: 53%;



  top: 50%;



  width: 205px;



  height: 205px;



  z-index: 8;



  transform:



    translate(-50%,-50%);



  border-radius: 50%;



  background:



    radial-gradient(



      circle at 35% 25%,



      #c5d8ff 0%,



      #778eff 15%,



      #5364e8 38%,



      #292b9a 67%,



      #11165e 100%



    );



  box-shadow:



    inset -25px -28px 45px



    rgba(5,8,50,.65),



    inset 18px 14px 35px



    rgba(255,255,255,.20),



    0 0 30px



    rgba(101,117,255,.65),



    0 0 80px



    rgba(83,91,255,.35);



  animation:



    identityFloat



    5s



    ease-in-out



    infinite;



}







@keyframes identityFloat {



  0%,100% {



    transform:



      translate(-50%,-50%)



      translateY(0);



  }







  50% {



    transform:



      translate(-50%,-50%)



      translateY(-10px);



  }



}







.identity-core::before {



  content: "";



  position: absolute;



  inset: -9px;



  border-radius: 50%;



  border:



    1px solid



    rgba(158,175,255,.65);



  box-shadow:



    0 0 18px



    rgba(109,128,255,.45);



}







.identity-core::after {



  content: "";



  position: absolute;



  inset: 15px;



  border-radius: 50%;



  border:



    1px solid



    rgba(255,255,255,.15);



}











.identity-core-inner {



  position: absolute;



  inset: 30px;



  display: flex;



  flex-direction: column;



  align-items: center;



  justify-content: center;



  border-radius: 50%;



  background:



    radial-gradient(



      circle at 35% 28%,



      rgba(255,255,255,.22),



      rgba(35,39,130,.35) 45%,



      rgba(8,12,67,.62)



    );



  border:



    1px solid



    rgba(255,255,255,.15);



  text-align: center;



}







.identity-letter {



  color: white;



  font-size: 48px;



  line-height: 1;



  font-weight: 900;



  text-shadow:



    0 0 18px



    rgba(255,255,255,.45);



}







.identity-name {



  max-width: 130px;



  margin-top: 8px;



  overflow: hidden;



  color: #eef1ff;



  font-size: 12px;



  font-weight: 900;



  text-overflow: ellipsis;



  white-space: nowrap;



}







.identity-role {



  margin-top: 4px;



  color: #aebcff;



  font-size: 8px;



  font-weight: 800;



  letter-spacing: .12em;



}











/* =============================================



   FLOATING CARDS



\============================================= */







.profile-float-card {



  position: absolute;



  z-index: 12;



  display: flex;



  align-items: center;



  gap: 10px;



  min-width: 145px;



  padding: 12px 14px;



  border:



    1px solid



    rgba(151,169,255,.28);



  border-radius: 13px;



  background:



    rgba(14,21,68,.68);



  box-shadow:



    0 12px 30px



    rgba(0,0,0,.20),



    inset 0 1px 0



    rgba(255,255,255,.07);



  backdrop-filter: blur(10px);



}







.profile-float-card span {



  display: block;



  color: #7e8bb5;



  font-size: 8px;



  font-weight: 800;



  letter-spacing: .08em;



}







.profile-float-card strong {



  display: block;



  margin-top: 3px;



  color: #eef1ff;



  font-size: 11px;



  font-weight: 900;



}







.float-icon {



  display: grid;



  place-items: center;



  width: 31px;



  height: 31px;



  border-radius: 9px;



  background:



    rgba(61,189,255,.14);



  color: #69dfff;



  font-size: 14px;



  box-shadow:



    0 0 15px



    rgba(61,189,255,.18);



}







.float-icon.purple {



  color: #b18cff;



  background:



    rgba(145,112,255,.15);



}







.float-icon.green {



  color: #53e3a4;



  background:



    rgba(51,220,151,.13);



}







.card-top {



  left: 18%;



  top: 23%;



  animation:



    floatCardOne



    5s



    ease-in-out



    infinite;



}







.card-right {



  right: 5%;



  top: 43%;



  animation:



    floatCardTwo



    5.8s



    ease-in-out



    infinite;



}







.card-bottom {



  left: 22%;



  bottom: 18%;



  animation:



    floatCardThree



    6.2s



    ease-in-out



    infinite;



}







@keyframes floatCardOne {



  0%,100% {



    transform: translateY(0);



  }







  50% {



    transform: translateY(-8px);



  }



}







@keyframes floatCardTwo {



  0%,100% {



    transform: translateY(0);



  }







  50% {



    transform: translateY(9px);



  }



}







@keyframes floatCardThree {



  0%,100% {



    transform: translateY(0);



  }







  50% {



    transform: translateY(-7px);



  }



}











/* =============================================



   SATELLITES



\============================================= */







.profile-satellite {



  position: absolute;



  z-index: 10;



  width: 12px;



  height: 12px;



  border-radius: 50%;



  background:



    radial-gradient(



      circle at 35% 30%,



      white,



      #7bcfff 35%,



      #4264ff 70%,



      #18227d



    );



  box-shadow:



    0 0 13px



    rgba(95,181,255,.95);



}







.satellite-one {



  left: 12%;



  top: 40%;



  animation:



    satelliteMoveOne



    7s



    ease-in-out



    infinite;



}







.satellite-two {



  right: 16%;



  top: 22%;



  width: 8px;



  height: 8px;



  background:



    radial-gradient(



      circle,



      #fff6ba,



      #ffbd4a 45%,



      #f06c34



    );



  box-shadow:



    0 0 14px



    rgba(255,181,65,.95);



  animation:



    satelliteMoveTwo



    8s



    ease-in-out



    infinite;



}







.satellite-three {



  right: 20%;



  bottom: 15%;



  width: 9px;



  height: 9px;



  animation:



    satelliteMoveThree



    6s



    ease-in-out



    infinite;



}







@keyframes satelliteMoveOne {



  0%,100% {



    transform:



      translate(0,0);



  }







  50% {



    transform:



      translate(18px,-18px);



  }



}







@keyframes satelliteMoveTwo {



  0%,100% {



    transform:



      translate(0,0);



  }







  50% {



    transform:



      translate(-17px,13px);



  }



}







@keyframes satelliteMoveThree {



  0%,100% {



    transform:



      translate(0,0);



  }







  50% {



    transform:



      translate(-14px,-12px);



  }



}











/* =============================================



   LIGHT TRAILS



\============================================= */







.light-trail {



  position: absolute;



  z-index: 3;



  height: 1px;



  border-radius: 50%;



  background:



    linear-gradient(



      90deg,



      transparent,



      rgba(96,210,255,.85),



      transparent



    );



  filter:



    drop-shadow(



      0 0 5px



      rgba(96,210,255,.8)



    );



}







.trail-one {



  width: 180px;



  left: 9%;



  top: 39%;



  transform: rotate(-17deg);



  animation:



    trailMove



    4s



    ease-in-out



    infinite;



}







.trail-two {



  width: 140px;



  right: 10%;



  bottom: 31%;



  transform: rotate(24deg);



  background:



    linear-gradient(



      90deg,



      transparent,



      rgba(172,125,255,.8),



      transparent



    );



  animation:



    trailMove



    5s



    ease-in-out



    infinite reverse;



}







@keyframes trailMove {



  0%,100% {



    opacity: .3;



    transform:



      rotate(-17deg)



      scaleX(.75);



  }







  50% {



    opacity: 1;



    transform:



      rotate(-17deg)



      scaleX(1.1);



  }



}











/* =============================================



   INFORMATION SECTION



\============================================= */







.profile-information {



  margin-top: 38px;



}







.profile-section-heading {



  display: flex;



  align-items: flex-end;



  justify-content: space-between;



  gap: 20px;



  margin-bottom: 20px;



}







.profile-section-heading > div:first-child > span {



  color: #7c8aa5;



  font-size: 10px;



  font-weight: 900;



  letter-spacing: .08em;



}







.profile-section-heading h2 {



  margin: 6px 0 0;



  color: #101a33;



  font-size: 27px;



  line-height: 1.1;



  font-weight: 900;



  letter-spacing: -.7px;



}







.profile-section-heading p {



  margin: 6px 0 0;



  color: #71809a;



  font-size: 13px;



}







.profile-online-badge {



  display: flex;



  align-items: center;



  gap: 7px;



  padding: 8px 12px;



  border: 1px solid #dcefe5;



  border-radius: 999px;



  background: #f3fcf7;



  color: #3b7e5b;



  font-size: 9px;



  font-weight: 900;



}







.profile-online-badge span {



  width: 6px;



  height: 6px;



  border-radius: 50%;



  background: #27c47d;



  box-shadow:



    0 0 8px



    rgba(39,196,125,.55);



}











/* =============================================



   CONTENT GRID



\============================================= */







.profile-content-grid {



  display: grid;



  grid-template-columns:



    minmax(0, 1.5fr)



    minmax(300px, .8fr);



  gap: 18px;



}











/* =============================================



   PROFILE CARD



\============================================= */







.profile-card {



  position: relative;



  overflow: hidden;



  padding: 28px;



  border:



    1px solid



    #e3e8f2;



  border-radius: 20px;



  background: white;



  box-shadow:



    0 9px 28px



    rgba(33,48,80,.07);



}







.profile-card::before {



  content: "";



  position: absolute;



  right: -70px;



  top: -80px;



  width: 190px;



  height: 190px;



  border-radius: 50%;



  background:



    radial-gradient(



      circle,



      rgba(111,87,255,.09),



      transparent 70%



    );



}







.profile-card-header {



  position: relative;



  z-index: 2;



  display: flex;



  align-items: center;



  gap: 18px;



}







.profile-avatar {



  position: relative;



  display: grid;



  place-items: center;



  width: 82px;



  height: 82px;



  flex-shrink: 0;



  border-radius: 50%;



  background:



    linear-gradient(



      145deg,



      #6675ff,



      #4c31d6



    );



  box-shadow:



    0 12px 30px



    rgba(91,72,232,.25);



}







.profile-avatar span {



  position: relative;



  z-index: 2;



  color: white;



  font-size: 32px;



  font-weight: 900;



}







.avatar-ring {



  position: absolute;



  inset: -7px;



  border:



    1px solid



    rgba(105,116,255,.35);



  border-radius: 50%;



  animation:



    avatarSpin



    8s



    linear



    infinite;



}







@keyframes avatarSpin {



  from {



    transform: rotate(0deg);



  }







  to {



    transform: rotate(360deg);



  }



}







.profile-card-title span {



  color: #8794aa;



  font-size: 9px;



  font-weight: 900;



  letter-spacing: .08em;



}







.profile-card-title h3 {



  margin: 5px 0 3px;



  color: #17213a;



  font-size: 21px;



  font-weight: 900;



}







.profile-card-title p {



  margin: 0;



  color: #7c889d;



  font-size: 11px;



}











.profile-divider {



  height: 1px;



  margin: 25px 0 4px;



  background:



    #e8ecf3;



}











/* =============================================



   PROFILE DETAILS



\============================================= */







.profile-details {



  position: relative;



  z-index: 2;



}







.profile-detail-row {



  display: flex;



  align-items: center;



  justify-content: space-between;



  gap: 20px;



  min-height: 64px;



  padding: 10px 0;



  border-bottom:



    1px solid



    #edf0f5;



}







.profile-detail-row:last-child {



  border-bottom: none;



}







.profile-detail-label {



  display: flex;



  align-items: center;



  gap: 11px;



}







.detail-icon {



  display: grid;



  place-items: center;



  width: 34px;



  height: 34px;



  border-radius: 10px;



  background:



    #f1f3ff;



  color: #5b4ee8;



  font-size: 13px;



  font-weight: 900;



}







.status-icon {



  background:



    #edfdf5;



  color: #22a86b;



}







.profile-detail-label strong {



  color: #17213a;



  font-size: 12px;



  font-weight: 900;



}







.profile-detail-value {



  max-width: 60%;



  overflow: hidden;



  color: #59677e;



  font-size: 12px;



  font-weight: 600;



  text-align: right;



  text-overflow: ellipsis;



  white-space: nowrap;



}











/* =============================================



   STATUS BADGE



\============================================= */







.status-badge {



  display: inline-flex;



  align-items: center;



  gap: 7px;



  padding: 7px 12px;



  border-radius: 999px;



  font-size: 10px;



  font-weight: 900;



}







.status-badge span {



  width: 6px;



  height: 6px;



  border-radius: 50%;



}







.status-badge.active {



  background: #e8fbf1;



  color: #188453;



}







.status-badge.active span {



  background: #22c477;



  box-shadow:



    0 0 7px



    rgba(34,196,119,.6);



}







.status-badge.inactive {



  background: #fff0f0;



  color: #a63838;



}







.status-badge.inactive span {



  background: #ef4444;



}











/* =============================================



   ACCOUNT STATUS CARD



\============================================= */







.account-status-card {



  position: relative;



  overflow: hidden;



  min-height: 430px;



  padding: 28px;



  border-radius: 20px;



  background:



    radial-gradient(



      circle at 50% 38%,



      rgba(104,90,255,.35),



      transparent 34%



    ),



    linear-gradient(



      145deg,



      #101746,



      #171353 55%,



      #0a1837



    );



  box-shadow:



    0 16px 38px



    rgba(26,27,78,.20);



  text-align: center;



}







.account-card-glow {



  position: absolute;



  left: 50%;



  top: 42%;



  width: 190px;



  height: 190px;



  transform:



    translate(-50%,-50%);



  border-radius: 50%;



  background:



    rgba(100,87,255,.15);



  filter: blur(22px);



  animation:



    accountGlow



    4s



    ease-in-out



    infinite;



}







@keyframes accountGlow {



  0%,100% {



    opacity: .55;



    transform:



      translate(-50%,-50%)



      scale(.9);



  }







  50% {



    opacity: 1;



    transform:



      translate(-50%,-50%)



      scale(1.12);



  }



}







.account-card-label {



  position: relative;



  z-index: 4;



  color: #909cc2;



  font-size: 9px;



  font-weight: 900;



  letter-spacing: .1em;



}











/* =============================================



   STATUS VISUAL



\============================================= */







.account-status-visual {



  position: relative;



  width: 180px;



  height: 180px;



  margin: 20px auto 10px;



}







.status-orbit {



  position: absolute;



  left: 50%;



  top: 50%;



  border: 1px solid rgba(142,157,255,.30);



  border-radius: 50%;



  transform:



    translate(-50%,-50%);



}







.orbit-a {



  width: 165px;



  height: 70px;



  transform:



    translate(-50%,-50%)



    rotate(25deg);



  animation:



    statusOrbitA



    8s



    linear



    infinite;



}







.orbit-b {



  width: 125px;



  height: 125px;



  border-style: dashed;



  animation:



    statusOrbitB



    12s



    linear



    infinite;



}







@keyframes statusOrbitA {



  from {



    transform:



      translate(-50%,-50%)



      rotate(25deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(385deg);



  }



}







@keyframes statusOrbitB {



  from {



    transform:



      translate(-50%,-50%)



      rotate(0deg);



  }







  to {



    transform:



      translate(-50%,-50%)



      rotate(360deg);



  }



}







.status-core {



  position: absolute;



  left: 50%;



  top: 50%;



  display: grid;



  place-items: center;



  width: 82px;



  height: 82px;



  transform:



    translate(-50%,-50%);



  border-radius: 50%;



  background:



    radial-gradient(



      circle at 35% 25%,



      #d8fff0,



      #46d995 25%,



      #218c70 58%,



      #102f4b 100%



    );



  box-shadow:



    0 0 25px



    rgba(55,222,157,.45),



    0 0 65px



    rgba(52,191,151,.25);



  animation:



    statusCoreFloat



    4s



    ease-in-out



    infinite;



}







@keyframes statusCoreFloat {



  0%,100% {



    transform:



      translate(-50%,-50%);



  }







  50% {



    transform:



      translate(-50%,-50%)



      scale(1.06);



  }



}







.status-core span {



  color: white;



  font-size: 34px;



  font-weight: 900;



  text-shadow:



    0 0 12px



    rgba(255,255,255,.5);



}











.account-status-card h3 {



  position: relative;



  z-index: 3;



  margin: 6px 0 8px;



  color: white;



  font-size: 21px;



  font-weight: 900;



}







.account-status-card > p {



  position: relative;



  z-index: 3;



  max-width: 310px;



  margin: 0 auto 22px;



  color: #9ca9cc;



  font-size: 11px;



  line-height: 1.65;



  font-weight: 600;



}











.account-status-line {



  position: relative;



  z-index: 3;



  display: flex;



  justify-content: space-between;



  padding: 11px 0;



  border-top:



    1px solid



    rgba(255,255,255,.08);



  text-align: left;



}







.account-status-line span {



  color: #7785ab;



  font-size: 8px;



  font-weight: 900;



  letter-spacing: .08em;



}







.account-status-line strong {



  color: #dbe2ff;



  font-size: 9px;



  font-weight: 900;



}











/* =============================================



   LOADING



\============================================= */







.profile-loading {



  min-height: 75vh;



  display: flex;



  flex-direction: column;



  align-items: center;



  justify-content: center;



  text-align: center;



}







.profile-loader-orbit {



  position: relative;



  width: 100px;



  height: 100px;



  border:



    1px solid



    #8a7dff;



  border-radius: 50%;



  animation:



    loaderSpin



    4s



    linear



    infinite;



}







.profile-loader-orbit::before {



  content: "";



  position: absolute;



  left: 50%;



  top: -5px;



  width: 10px;



  height: 10px;



  transform:



    translateX(-50%);



  border-radius: 50%;



  background: #70e4ff;



  box-shadow:



    0 0 15px



    #70e4ff;



}







@keyframes loaderSpin {



  to {



    transform: rotate(360deg);



  }



}







.profile-loader-core {



  position: absolute;



  left: 50%;



  top: 50%;



  display: grid;



  place-items: center;



  width: 54px;



  height: 54px;



  transform:



    translate(-50%,-50%);



  border-radius: 50%;



  background:



    linear-gradient(



      145deg,



      #6475ff,



      #4432c8



    );



  color: white;



  font-size: 22px;



  font-weight: 900;



}







.profile-loading h2 {



  margin: 25px 0 5px;



  color: #18213b;



  font-size: 22px;



  font-weight: 900;



}







.profile-loading p {



  margin: 0;



  color: #77849a;



  font-size: 12px;



}











/* =============================================



   EMPTY



\============================================= */







.profile-empty {



  min-height: 70vh;



  display: flex;



  flex-direction: column;



  align-items: center;



  justify-content: center;



  text-align: center;



}







.empty-core {



  display: grid;



  place-items: center;



  width: 90px;



  height: 90px;



  border-radius: 50%;



  background:



    linear-gradient(



      145deg,



      #6878ff,



      #4733ce



    );



  color: white;



  font-size: 35px;



  font-weight: 900;



  box-shadow:



    0 0 40px



    rgba(89,77,239,.3);



}







.profile-empty h1 {



  margin: 22px 0 5px;



  color: #17213a;



  font-size: 25px;



  font-weight: 900;



}







.profile-empty p {



  margin: 0;



  color: #71809a;



  font-size: 13px;



}











/* =============================================



   RESPONSIVE



\============================================= */







@media (max-width: 1100px) {







  .profile-hero {



    min-height: 650px;



  }







  .profile-hero-content {



    width: 56%;



  }







  .profile-space {



    width: 58%;



    opacity: .9;



  }







  .identity-core {



    width: 175px;



    height: 175px;



  }







  .profile-orbit.orbit-one {



    width: 380px;



  }







  .profile-orbit.orbit-two {



    width: 420px;



  }







  .profile-float-card {



    transform: scale(.9);



  }







  .profile-content-grid {



    grid-template-columns: 1fr;



  }







  .account-status-card {



    min-height: 400px;



  }



}











@media (max-width: 800px) {







  .profile-page {



    padding: 25px 20px 45px;



  }







  .profile-hero {



    min-height: 760px;



  }







  .profile-hero-content {



    width: 100%;



    padding: 35px 28px 0;



  }







  .profile-hero-content h2 {



    font-size: 40px;



  }







  .profile-space {



    position: absolute;



    left: 0;



    right: 0;



    top: 320px;



    width: 100%;



    height: 420px;



  }







  .profile-mini-stats {



    margin-top: 30px;



  }







  .identity-core {



    left: 52%;



    top: 55%;



  }







  .profile-orbit {



    left: 52%;



    top: 55%;



  }







  .profile-orbit-dot {



    left: 52%;



    top: 55%;



  }







  .card-top {



    left: 12%;



    top: 28%;



  }







  .card-right {



    right: 3%;



    top: 44%;



  }







  .card-bottom {



    left: 14%;



    bottom: 8%;



  }



}











@media (max-width: 600px) {







  .profile-page {



    padding: 18px 12px 35px;



  }







  .profile-page-header h1 {



    font-size: 26px;



  }







  .profile-page-header p {



    font-size: 13px;



  }







  .profile-hero {



    min-height: 730px;



    border-radius: 22px;



  }







  .profile-hero-content {



    padding: 28px 22px 0;



  }







  .profile-hero-content h2 {



    font-size: 34px;



    letter-spacing: -1.7px;



  }







  .profile-hero-description {



    font-size: 13px;



  }







  .profile-mini-stats {



    gap: 18px;



  }







  .profile-mini-stat strong {



    font-size: 19px;



  }







  .profile-mini-stat span {



    font-size: 9px;



  }







  .profile-space {



    top: 310px;



    height: 400px;



    transform: scale(.82);



    transform-origin:



      center top;



  }







  .profile-section-heading {



    align-items: flex-start;



    flex-direction: column;



  }







  .profile-card {



    padding: 20px;



  }







  .profile-card-header {



    align-items: flex-start;



  }







  .profile-avatar {



    width: 65px;



    height: 65px;



  }







  .profile-avatar span {



    font-size: 25px;



  }







  .profile-card-title h3 {



    font-size: 18px;



  }







  .profile-detail-row {



    gap: 10px;



  }







  .profile-detail-value {



    max-width: 52%;



    font-size: 11px;



  }







  .account-status-card {



    padding: 24px 18px;



  }







}











@media (max-width: 420px) {







  .profile-hero-content h2 {



    font-size: 30px;



  }







  .profile-mini-stats {



    gap: 13px;



  }







  .profile-mini-stat strong {



    font-size: 17px;



  }







  .profile-float-card {



    min-width: 125px;



    padding: 9px 10px;



  }







  .profile-float-card strong {



    font-size: 9px;



  }







  .profile-float-card span {



    font-size: 7px;



  }







  .profile-space {



    transform: scale(.72);



    transform-origin:



      center top;



  }







}









/* ===== PRIYONIX DARK SPACE PROFILE THEME ===== */
.profile-page {
  position: relative;
  isolation: isolate;
  min-height: calc(100vh - 16px);
  margin: 8px;
  padding: 24px clamp(14px, 2vw, 30px) 36px;
  border: 1px solid rgba(108, 139, 220, 0.28);
  border-radius: 22px;
  color: #edf3ff;
  background:
    radial-gradient(circle at 82% 12%, rgba(92, 78, 255, 0.10), transparent 28%),
    radial-gradient(circle at 12% 80%, rgba(34, 211, 238, 0.05), transparent 28%),
    #071329;
}

.profile-page-header h1,
.profile-section-heading h2,
.profile-card-title h3,
.profile-detail-label strong,
.profile-information h2,
.profile-information h3 {
  color: #f4f7ff !important;
}

.profile-page-header p,
.profile-section-heading p,
.profile-section-heading > div:first-child > span {
  color: #a9bbda !important;
}

.profile-hero {
  border: 1px solid rgba(126, 148, 255, 0.20);
  box-shadow:
    0 24px 58px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.profile-information {
  color: #edf3ff;
}

.profile-card {
  background: linear-gradient(145deg, rgba(15, 29, 59, 0.97), rgba(9, 19, 42, 0.98)) !important;
  border: 1px solid rgba(124, 157, 255, 0.20) !important;
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.20) !important;
}

.profile-card-title span,
.profile-card-title p,
.profile-detail-value {
  color: #b1c0df !important;
}

.profile-divider,
.profile-detail-row {
  border-color: rgba(132, 155, 211, 0.16) !important;
}

.detail-icon {
  color: #b8c4ff !important;
  background: rgba(101, 108, 255, 0.16) !important;
  border: 1px solid rgba(143, 133, 255, 0.20);
}

.detail-icon.status-icon {
  color: #63e6b1 !important;
  background: rgba(36, 201, 137, 0.12) !important;
}

.profile-online-badge {
  color: #7ff5c2 !important;
  background: rgba(33, 196, 132, 0.10) !important;
  border-color: rgba(62, 224, 159, 0.20) !important;
}

.status-badge.active {
  color: #7ff5c2 !important;
  background: rgba(33, 196, 132, 0.12) !important;
  border: 1px solid rgba(62, 224, 159, 0.20);
}

.status-badge.inactive {
  color: #ffabb5 !important;
  background: rgba(225, 52, 78, 0.12) !important;
  border: 1px solid rgba(255, 105, 126, 0.20);
}

.account-status-card {
  border: 1px solid rgba(126, 148, 255, 0.20);
}

.profile-loading,
.profile-empty {
  color: #edf3ff !important;
  background: #071329 !important;
}

.profile-loading h2,
.profile-empty h1 {
  color: #f4f7ff !important;
}

.profile-loading p,
.profile-empty p {
  color: #a9bbda !important;
}

@media (max-width: 800px) {
  .profile-page {
    margin: 5px;
    padding: 18px 14px 26px;
    border-radius: 18px;
  }
}

@media (max-width: 480px) {
  .profile-page {
    margin: 3px;
    padding: 14px 10px 22px;
    border-radius: 15px;
  }
}

/* ===== RESPONSIVE POLISH — all devices ===== */
.profile-card-title {
  min-width: 0;
}

.profile-card-title h3,
.profile-card-title p,
.profile-detail-label strong {
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (max-width: 600px) {
  .profile-card-header {
    min-width: 0;
  }
}

@media (max-width: 420px) {
  .profile-detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .profile-detail-value {
    max-width: 100%;
    text-align: left;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .profile-page-header h1 {
    font-size: 26px;
  }

  .profile-hero-content h2 {
    font-size: 30px;
  }

  .account-status-card {
    min-height: auto;
  }
}

@media (max-width: 800px) and (max-height: 480px) and (orientation: landscape) {
  .profile-hero {
    min-height: 360px !important;
  }

  .profile-space {
    display: none;
  }
}
`;







export default Profile;