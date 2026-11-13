import { useState } from "react";

const Avatar=({src,name="",size=48})=>{
    const [failed,setFailed]=useState(false);
    const fletter=name.trim().charAt(0).toUpperCase();
    if(src&&!failed){
        return(
            <img src={src} alt={name} 
            className="avatar" 
            style={{width:size,height:size}}
            onError={()=>setFailed(true)}/>
        )
    }
    return(
        <div className="avatar avatar-fallback"
            style={{width:size,height:size,fontSize:size*0.5}}>
            {fletter}
        </div>
    )
}
export default Avatar;