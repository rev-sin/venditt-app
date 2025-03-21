import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Fetch real-time order details from backend
    fetch(`http://your-api-url/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch((err) => console.error("Error fetching order details:", err));
  }, [orderId]);

  if (!order) return <p>Loading order details...</p>;

  return (
    <div>
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Date:</strong> {order.date}</p>
      <p><strong>Total Amount:</strong> ₹{order.total}</p>
      <h3>Items:</h3>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.name} - {item.quantity} x ₹{item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetails;
