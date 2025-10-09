import { useState } from "react";
import styles from './Passenger.module.css';
import Countdown from "../../countdown/Countdown";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

function Passenger(){
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [otp,setOtp] = useState("");

    const [loginEmail,setLoginEmail] = useState("");
    const [loginPassword,setLoginPassword] = useState("");

    const [verification,setVerification] = useState(false);

    const [isSignInActive, setIsSignInActive] = useState(false);

    const navigate = useNavigate();

    function handleToggle(isActive) {
      setIsSignInActive(isActive);
    }
    function clearAllFields() {
      // Signup
      setName("");
      setEmail("");
      setPassword("");
      setDob("");
      setGender("");
      setOtp("");

      // Login
      setLoginEmail("");
      setLoginPassword("");
    }
    async function validation() {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        //name validation
        if (!trimmedName) 
            return toast.error("Name is required!",{containerId:"right"});
        else if (trimmedName.length < 3)
            return toast.error("Name must be at least 3 characters",{containerId:"right"});
        else if (!/^[A-Za-z\s]+$/.test(trimmedName))
            return toast.error("Name should only contain letters",{containerId:"right"});
        
        //Email validation
        if(!trimmedEmail)
            return toast.error("Email is required!",{containerId:"right"});
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
            return toast.error("Invalid email format",{containerId:"right"});

        // Validate Password
        if (!password) return toast.error("Password is required!",{containerId:"right"});
        if (password.length < 6)
          return toast.error("Password must be at least 6 characters!",{containerId:"right"});
        if (!/^\S+$/.test(password))
          return toast.error("Password must not contain spaces!",{containerId:"right"});

        // Validate DOB
        if (!dob) return toast.error("Date of birth is required!",{containerId:"right"});
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) return toast.error("You must be at least 18 years old!",{containerId:"right"});

        // Validate Gender
        if (!gender) return toast.error("Please select gender!",{containerId:"right"});

        // ✅ All validations passed
        try{
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/p/check-email`,{name,email: trimmedEmail});
            if(res.data.success){
              if(!verification){
                setVerification(true);
                toast.success("Check your email for OTP.",{containerId:"right"});
              }else{
                toast.success("OTP has been resent successfully.", { containerId: "right" });
              }
            }else{
                toast.error(res.data.message,{containerId:"right"});
            }
        }
        catch(err){
            toast.error("Server Busy!-validation",{containerId:"right"});
            console.error("Axios error:", err);
        }
    }
    async function otpVerify(){
        if(!verification)
            return toast.error("Verification is required to proceed",{containerId:"right"});
        if (!otp) 
            return toast.error("Please enter OTP",{containerId:"right"});
        if (!/^\d+$/.test(otp))
            return toast.error("OTP must contain only numbers", { containerId: "right" });
        if (otp.length !== 6) 
            return toast.error("OTP must be 6 digits",{containerId:"right"});
        if (!/^\S+$/.test(otp))
          return toast.error("otp must not contain spaces!",{containerId:"right"});

        const trimmedEmail = email.trim();
        const trimmedName = name.trim();
        try{
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/p/verify-otp`,{
            name:trimmedName,email:trimmedEmail,password,dob,gender, otp: Number(otp)
          })
          if(res.data.success){
              toast.success("Successfully SignUp!",{containerId:"right"});
              setTimeout(() => {
                      window.location.reload();}
                      , 2000);
          }else
              toast.error("Otp doesn't Match!",{containerId:"right"});
        }
        catch(err){
            toast.error("Server busy!",{containerId:"right"});
        }
    }
    // Login Functions
    async function SignIn() {
        const trimmedEmail = loginEmail.trim();

        // Email validation
        if (!trimmedEmail) {
          return toast.error("Email is required!", { containerId: "left" });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          return toast.error("Invalid email format!", { containerId: "left" });
        }

        // Password validation
        if (!loginPassword) {
          return toast.error("Password is required!", { containerId: "left" });
        } else if (loginPassword.length < 6) {
          return toast.error("Invalid password.", { containerId: "left" });
        } else if (/\s/.test(loginPassword)) {
          return toast.error("Password must not contain spaces!", { containerId: "left" });
        }
        
        try {
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/p/login`, {
            email: trimmedEmail,
            password : loginPassword,
          });

          if (res.data.success) {
            localStorage.setItem("passengerToken", res.data.token);
            clearAllFields();
            navigate("/passenger-home");
          } else {
            toast.error(res.data.message, { containerId: "left" });
          }
        } catch (error) {
          toast.error("Server error!", {containerId: "left",});
        }
    }
    //for counter
    const [resetKey, setResetKey] = useState(0);
    const [cooldown, setCooldown] = useState(false);

    const handleResend = () => {
      // send OTP (replace with real API call)
      toast.success("New OTP sent ✅");

      // reset countdown
      setResetKey((prev) => prev + 1);

      // start cooldown (10 sec)
      setCooldown(true);
      setTimeout(() => setCooldown(false), 10000);
    };

    return (
      // Main wrapper
      <div className={styles.Passenger}>
        <div className={styles['main-wrapper']}>
          <div className={`${styles.container} ${isSignInActive ? styles.active : ''}`}>
            {/* Sign Up Form */}
            <div
              className={`${styles['form-container']} ${styles['sign-up']} ${
                isSignInActive ? styles['active-form'] : ''
              }`}
            >
              <form>
                <h1>Create Account</h1>
                <span>Enter your personal details to signup</span><br/>
                <ToastContainer containerId="right" position="top-center" autoClose={2000} hideProgressBar toastStyle={{minWidth: "413px"}}/>
                <input disabled={verification} type="text" placeholder="Name" onChange={(e) => setName(e.target.value)}/>
                <input disabled={verification} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                <input disabled={verification} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                <input disabled={verification} type="date" placeholder="Date of Birth" onChange={(e) => setDob(e.target.value)}/>
                <select disabled={verification}
                  className={styles['gender-select']} value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled>
                    Gender
                  </option>
                  <option value="male">♂ Male</option>
                  <option value="female">♀ Female</option>
                  <option value="other">⚧ Other</option>
                </select>
                <div>
                {verification&&
                        <>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px",width: "100%" }}>
                          <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="Otp"/>
                            <Countdown initialTime={5 * 60} resetKey={resetKey} />
                        </div>
                            <button type="button" onClick={()=>{handleResend(); validation()}}
                            disabled={cooldown} style={{marginRight: "7px",background: cooldown ? "#999" : "#1d4ed8",
                            cursor: cooldown ? "not-allowed" : "pointer"}}>
                            {cooldown ? "wait. . ." : "Resend"}</button>
                        </>
                }
                {!verification &&
                  <button type="button" onClick={()=>validation()} style={{marginRight: "7px",background:"#f75454ff"}}>verify</button>
                }
                <button type="button" onClick={()=>otpVerify()}>Sign Up</button>
                <br/>
                </div>
                <p
                  className={styles['mobile-toggle-text']}
                  onClick={() => handleToggle(false)}
                >
                  Already have an account? <span>Sign In</span>
                </p>
              </form>
            </div>

            {/* Sign In Form */}
            <div
              className={`${styles['form-container']} ${styles['sign-in']} ${
                isSignInActive ? '' : styles['active-form']
              }`}
            >
              <form>
                <ToastContainer containerId="left" position="top-left" autoClose={2000} hideProgressBar toastStyle={{minWidth: "413px"}}/>
                <h1>Sign In</h1><br/>
                <span>Enter email and password</span><br/>
                <input type="email" placeholder="Email" onChange={(e) => setLoginEmail(e.target.value)}/>
                <input type="password" placeholder="Password" onChange={(e) => setLoginPassword(e.target.value)}/>
                <button type="button" onClick={() => SignIn()}>Sign In</button>
                <p
                  className={styles['mobile-toggle-text']}
                  onClick={() => handleToggle(true)}
                >
                  Don't have an account? <span>Sign Up</span>
                </p>
              </form>
            </div>

            {/* Toggle Container */}
            <div className={styles['toggle-container']}>
              <div className={styles.toggle}>
                <div className={`${styles['toggle-panel']} ${styles['toggle-left']}`}>
                  <h1>Welcome Back!</h1>
                  <p>Enter your personal details to use all of site features</p>
                  <button className={styles.hidden} onClick={() => handleToggle(false)}>
                    Sign In
                  </button>
                </div>
                <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
                  <h1>Hello, Passenger!</h1>
                  <p>Register with your personal details to use all of site features</p>
                  <button className={styles.hidden} onClick={() => handleToggle(true)}>
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Passenger;
