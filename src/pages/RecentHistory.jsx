import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "../styles/RecentHistory.css";
import { Link } from "react-router-dom";

const RecentHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    
    // ✅ Sort transactions (newest first)
    const sortedTransactions = storedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    setTransactions(sortedTransactions);
  }, []);

  return (
    <div className="recent-history-container">
      <h2>🕒 Recent Transactions</h2>

      {transactions.length === 0 ? (
        <p className="no-transactions">No recent transactions</p>
      ) : (
        <div className="transaction-list">
          {transactions.map((txn, index) => (
            <div key={index} className="transaction-item">
              <p><strong>Amount Paid:</strong> ₹{txn.amountPaid || "N/A"}</p>
              <p><strong>Payment ID:</strong> {txn.paymentId}</p>
              <p><strong>Date:</strong> {new Date(txn.date).toLocaleString()}</p>
              
              {/* ✅ Display QR Code */}
              <div className="qr-code-container">
                <QRCodeCanvas value={txn.qrCode || txn.paymentId} size={120} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Leave 3cm space at the bottom */}
      <div className="bottom-space"></div>
    </div>
  );
};

export default RecentHistory;
