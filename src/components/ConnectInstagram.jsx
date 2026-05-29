import React, { useEffect, useRef } from "react";
import { FaInstagram } from "react-icons/fa";
import api from "../services/axios";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function ConnectInstagram() {

      const navigate = useNavigate();
      const [searchParams] = useSearchParams();
      const hasCalledApi = useRef(false);

  // Handle Instagram callback - runs only once on mount
  useEffect(() => {
    const code = searchParams.get("code");
    
    // Prevent calling API twice (React Strict Mode)
    if (!code || hasCalledApi.current) return;
    
    hasCalledApi.current = true;
    
    api.get("/auth/google/callback", {
      params: {
        code: code, 
      },
    })
      .then((response) => {
          if(response.data.success){
            // Cookie is set via res.cookie from server
            if(response.data.user){
              navigate("/dashboard");

            }
          }
      }
      )
      .catch((error) => {
          const errorMessage = error.response?.data?.message || error.response?.data || error.message || "Failed to connect Instagram";
          console.error("Failed to connect Instagram:", errorMessage);
          alert(errorMessage);
          navigate("/");
      }); 
    
  }, []);

    const handleInstagramConnect = async () => {
  try {
    const response = await api.get("insta/redirectUrl");

    console.log("Login successful:", response.data);

    // Redirect to Instagram/Google OAuth URL
    window.location.href = response.data.message;

  } catch (error) {
    console.error(
      "Login failed:",
      error.response?.data || error.message
    );
  }
};
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
          width: "420px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "14px",
          padding: "28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Progress Bar */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "4px",
              backgroundColor: "#222",
              borderRadius: "10px",
            }}
          />

          <div
            style={{
              flex: 1,
              height: "4px",
              backgroundColor: "#222",
              borderRadius: "10px",
            }}
          />

          <div
            style={{
              flex: 1,
              height: "4px",
              backgroundColor: "#ddd",
              borderRadius: "10px",
            }}
          />
        </div>

        {/* Instagram Icon */}
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
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          Connect your Instagram
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#555",
            lineHeight: "1.5",
            fontSize: "15px",
            marginBottom: "30px",
          }}
        >
          Link your Instagram Business or Creator account to
          start automating replies and DMs.
        </p>

        {/* Card */}
        <div
          style={{
            backgroundColor: "#f8f5ef",
            borderRadius: "12px",
            padding: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* Small Icon */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaInstagram color="white" />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                Instagram Business / Creator
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Required for automation access
              </p>
            </div>
          </div>

          {/* Badge */}
          <div
            style={{
              backgroundColor: "#f4e7c7",
              color: "#8a6d1f",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Required
          </div>
        </div>

        {/* Connect Button */}
        <button onClick={handleInstagramConnect}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "14px",
          }}
        >
          <FaInstagram style={{ marginRight: "8px" }} />
          Connect with Instagram
        </button>

       
        <button onClick={() => navigate("/dashboard")}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "25px",
          }}
        >
          Skip for now
        </button>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          We only request read + comment permissions. We never
          post on your behalf without your explicit automation
          rules.
        </p>
      </div>
    </div>
  );
}