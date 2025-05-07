import React, { useState } from "react";
import { CheckCircle, XCircle, CreditCard, Banknote, Clock } from "lucide-react";
import "./Payment.css"; // External CSS

const Payment = () => {
  // Student Data (Replace with API data)
  const [student, setStudent] = useState({
    name: "Prabhat Kumar",
    rollNumber: "NITT2025001",
    course: "MCA",
    feePaid: false,
    dueAmount: 50000,
    lastDate: "March 31, 2025",
    paymentMethod: "",
    paymentHistory: [
      { date: "Jan 2024", amount: 50000, method: "UPI" },
      { date: "July 2023", amount: 50000, method: "Credit Card" },
    ],
  });

  // Available Payment Methods
  const paymentOptions = ["Credit Card", "UPI", "Net Banking", "Debit Card", "Wallet"];

  const handlePayment = () => {
    if (!student.paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    setStudent((prev) => ({
      ...prev,
      feePaid: true,
      dueAmount: 0,
      paymentHistory: [...prev.paymentHistory, { date: "March 2025", amount: 50000, method: prev.paymentMethod }],
    }));
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        {/* Student Information */}
        <div className="student-info">
          <h2>Student Payment Portal</h2>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Roll No:</strong> {student.rollNumber}</p>
          <p><strong>Course:</strong> {student.course}</p>
        </div>

        {/* Payment Status */}
        <div className="payment-status">
          {student.feePaid ? (
            <>
              <CheckCircle size={50} className="icon success" />
              <h3>Payment Complete</h3>
              <p>Your fees are fully paid.</p>
            </>
          ) : (
            <>
              <XCircle size={50} className="icon error" />
              <h3>Pending Payment</h3>
              <p>Total Due: ₹{student.dueAmount}</p>
              <p className="due-date"><Clock size={18} /> Last Date: {student.lastDate}</p>

              {/* Payment Method Selection */}
              <div className="payment-methods">
                <h4>Select Payment Method:</h4>
                <div className="options">
                  {paymentOptions.map((method) => (
                    <button 
                      key={method} 
                      className={`payment-option ${student.paymentMethod === method ? "selected" : ""}`} 
                      onClick={() => setStudent({ ...student, paymentMethod: method })}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pay Now Button */}
              <button className="pay-button" onClick={handlePayment}>
                <CreditCard size={20} /> Pay Now
              </button>
            </>
          )}
        </div>

        {/* Payment History */}
        <div className="payment-history">
          <h3>Transaction History</h3>
          {student.paymentHistory.length > 0 ? (
            <ul>
              {student.paymentHistory.map((record, index) => (
                <li key={index}>
                  <Banknote size={18} /> {record.date} - ₹{record.amount} ({record.method})
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
