
import { useNavigate } from "react-router-dom";


function Login(){
    const navigate = useNavigate();

    return(
        <>
        <h1 className="Heading" >Login</h1>
        <h3>Enter Information's</h3>
        <button onClick={()=>navigate("/signup")}>Create New Account</button>
        </>
    )
}
export default Login