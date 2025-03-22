import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const amount = location.state?.finalAmount || 0;
  const [paymentId, setPaymentId] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: "rzp_test_uLgnRVKsA2H2Nb",
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: "Venditt",
        description: "Purchase from Venditt",
        image: "https://yourcompany.com/logo.png",
        handler: function (response) {
          setPaymentId(response.razorpay_payment_id);
          setShowQR(true); // ✅ Show QR Code after payment

          // ✅ Store payment in local storage (for RecentHistory.jsx)
          const transactions =
            JSON.parse(localStorage.getItem("transactions")) || [];
          const newTransaction = {
            amount: amount,
            paymentId: response.razorpay_payment_id,
            date: new Date().toISOString(),
            qrCode: response.razorpay_payment_id, // ✅ Store QR code value
          };
          localStorage.setItem(
            "transactions",
            JSON.stringify([...transactions, newTransaction])
          );

          // ✅ Redirect to Home after 10 seconds
          setTimeout(() => {
            navigate("/");
          }, 10000);
        },
        prefill: {
          name: "Karthik",
          email: "karthik@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };
  }, [amount, navigate]);

  return (
    <div>
      {paymentId && showQR ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>Payment Successful!</h2>
          <p>Payment ID: {paymentId}</p>
          <h3>Scan QR Code to Proceed</h3>
          <QRCodeCanvas value={paymentId} size={200} />
          <p>Redirecting to Home in 10 seconds...</p>
        </div>
      ) : (
        <h2>Processing Payment...</h2>
      )}
    </div>
  );
};

export default Payment;
