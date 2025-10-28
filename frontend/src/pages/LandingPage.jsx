import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";
import heroImage from "../assets/drdo.png"; 

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar1">
         <ul>
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/login")}>User / Employee Login</li>
          <li onClick={() => navigate("/register")}>User Registration</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>CASDIC - DRDO Technology Showcase</h1>
          <p>Explore cutting-edge technologies developed by DRDO and CASDIC to make the world a better place.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/login")}> Login</button>
            <button className="employee-btn" onClick={() => navigate("/register")}>
              User Registration
            </button>
          </div>
        </div>
        {heroImage && <img className="hero-img" src={heroImage} alt="Tech Showcase" />}
      </header>

      {/* About Section */}
      <section className="about fade-up">
        <h2>About Us</h2>
        <p>
       The Combat Aircraft Systems Development & Integration Centre (CASDIC) is a specialized laboratory under the Defence Research and Development Organisation (DRDO), India’s apex defense R&D agency. Established in 1986 and headquartered in Bangalore, Karnataka, CASDIC is one of the two DRDO labs dedicated to airborne electronic warfare (EW) and mission avionics systems.
<br></br><br></br>
Originally founded as the Advanced Systems Integration and Evaluation Organisation (ASIEO), it evolved into the Defence Avionics Research Establishment (DARE) before being restructured as CASDIC in 2021, now operating under the administrative control of Defence Electronics Research Laboratory (DLRL), Hyderabad</p>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Platform Highlights</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Explore Technologies</h3>
            <p>View all active and past DRDO technologies in one place.</p>
          </div>
          <div className="feature-card">
            <h3>Show your Interest</h3>
            <p>We'll keep you updated on any chnages and advancements done in the tech you love!</p>
          </div>
          <div className="feature-card">
            <h3>Secure Access</h3>
            <p>Role-based login ensures data privacy and proper access control.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; {new Date().getFullYear()} CASDIC - DRDO. All rights reserved.</p>
      </footer>
    </div>
  );
}
