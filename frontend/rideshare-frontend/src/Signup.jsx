import { useState } from "react";

function Signup(){
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [otp,setOtp] = useState("");
    const [verify,setVerify] = useState(false);
    const [success,setSuccess] = useState(false);

    function check(otp){
        

    }
    return(
        <>
        <h1 className="Heading">SignUp</h1>
        Enter Username : <input value={name} onChange={e=>setName(e.target.value)}/><br/>
        Enter Email : <input value={email} onChange={e=>setEmail(e.target.value)}/>
        {verify&&
                <>
                    <br/>Enter OTP : 
                    <input value={otp} onChange={e=>setOtp(e.target.value)}/>
                    <button onClick={()=>check(otp)}>confirm</button>
                </>
               
        }{
            !verify&&
            <> <button onClick={()=>setVerify(true)}>verify</button> </>
        }
        <br/>
        Enter password : <input value={password} onChange={e=>setPassword(e.target.value)}/><br/>
        </>
    )
}

export default Signup