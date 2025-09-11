import Logo from './assets/logos/RideShare_Icon.png';
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* The main content structure */}
      <div className={styles.navbar}>
        <img src={Logo} className={styles['navbar-logo']} alt="" />
        <div className={styles['navbar-links']}>
          <a href="/about" className={styles['navbar-link']}>About Us</a>
          <a href="/help" className={styles['navbar-link']}>Help & Support</a>
          <a href="/contact" className={styles['navbar-link']}>Contact</a>
        </div>
      </div>
      <div className={styles['homepage-container']}>
        
        <h1 className={styles['main-title']}>
          Welcome to <span className={styles['rideshare-text']}>RideShare</span>
        </h1>
        <p className={styles['main-description']}>
          Get started by choosing your role.
        </p>
        <div className={styles['options-container']}>
          {/* Option for Drivers */}
          <div href="/driver" onClick={() => navigate("/driver")} className={`${styles['option-card']} ${styles.driver}`}>
            <i className="fas fa-car-side fa-2x"></i>
            <h2 className={styles['card-title']}>Driver</h2>
            <p className={styles['card-description']}>Share your Ride with our friends.</p>
          </div>
          
          {/* Option for Passengers */}
          <div href="/passenger" onClick={() => navigate("/passenger")} className={`${styles['option-card']} ${styles.passenger}`}>
            <i className="fas fa-users fa-2x"></i> 
            <h2 className={styles['card-title']}>Passenger</h2>
            <p className={styles['card-description']}>Your destination, just a ride away.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;