import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/axios";

export default function LinkInstagram() {
       const hasCalledApi = useRef(false);
    const navigate = useNavigate();
          const [searchParams] = useSearchParams();
    const instagramUserUpdate = async () => {
      try {
            const code = searchParams.get("code");
               if (!code || hasCalledApi.current) return;
    hasCalledApi.current = true;
            if(code){
            const response =  await api.get("/insta/callback", {
                params: {
                  code: code,
                },
              });
              console.log("Instagram connected:", response.data);
                    navigate("/dashboard");
            }
    
        // const response = await api.get("/insta/userUpdate");
      } catch (error) {
        alert("Failed to Update Instagram User", error.message);
        console.log("error.messageerror.messageerror.message",error.message,"error.messageerror.message")
        console.log("Error updating Instagram user:", error);
          navigate("/connect-instagram");
      }
    };
    useEffect(() => {
      instagramUserUpdate(); 

    }, []);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-3xl font-bold mb-6">Link Instagram Account</h1>
 <a href="/connect-instagram" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">Connect Instagram</a>
        </div>
      );



}