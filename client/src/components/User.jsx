import { useSelector } from "react-redux";
import {Button} from "reactstrap";
import { useNavigate } from "react-router-dom";
import {FaUserEdit} from 'react-icons/fa';
import Avatar from "./Avatar";
const User=()=>{
    const navigate=useNavigate()
    const userInfo=useSelector((state)=>state.user.user)
    return(
        <>
            <div className="card-box user-card text-center">
                <div className="user-card-top"/>
                <div className="user-avatar-wrap">
                    <Avatar src={userInfo.profile} name={userInfo.uname} size={110}/>
                </div>
                <h4 className="mt-3 mb-1">{userInfo.uname}</h4>
                <p className="text-muted small mb-3">{userInfo.email}</p>
                <Button className="btn-gradiant" onClick={()=>navigate("/profile")}>
                    <FaUserEdit className="me-2"/>
                    EDIT PROFILE
                </Button>
            </div>
        </>
    )
}
export default User;