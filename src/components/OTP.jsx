import React, { useState } from "react";
import axios from "axios";

const OtpForm = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState(""); // To associate with OTP

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post("/verify-otp", { otp, newPassword, email });
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Error verifying OTP");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter OTP</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Enter New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default OtpForm;
