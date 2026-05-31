import React, { useEffect } from "react";
import { FaGoogle, FaInstagram } from "react-icons/fa";
import api from "../services/axios";

export default function LoginPage() {
  const login=()=>{
   api.get("/auth/redirectUrl").then((response) => {

        window.location.href = response.data.message;
  
    }).catch((error) => {
      console.error("Login failed:", error.response?.data || error.message);
    });
   
  }
    useEffect(() => {
    api.get("/health")
      .then(() => setAuthenticated(true))
      .catch(() => navigate("/"));
  }, []);
  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f3f1ed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
        
      <div
        style={{
          width: "400px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "40px 30px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Instagram Logo */}
        <div
          style={{
            width: "50px",
            height: "50px",
            margin: "0 auto 20px",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaInstagram color="white" size={24} />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "34px",
            marginBottom: "10px",
            fontWeight: "600",
          }}
        >
          Welcome to InstaFlow
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "15px",
            marginBottom: "30px",
            lineHeight: "1.5",
          }}
        >
          Automate your Instagram comments & DMs with AI powered responses.
        </p>

        {/* Google Button */}
        <button onClick={login}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          <FaGoogle />
          Continue with Google
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "25px 0",
            color: "#888",
            fontSize: "14px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#ddd",
            }}
          />
     
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#ddd",
            }}
          />
        </div>

    

        {/* Footer */}
        <p
          style={{
            fontSize: "13px",
            color: "#666",
          }}
        >
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}