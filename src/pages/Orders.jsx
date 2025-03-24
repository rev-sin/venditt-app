import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId("");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold mb-5">Previous Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">
                Order ID: {order.id}
              </h2>
              <p className="text-gray-700 mb-1">
                Total: &#8377;{order.totalPrice}
              </p>
              <p className="text-gray-700 mb-1">
                Date:{" "}
                {order.createdAt && order.createdAt.toDate
                  ? order.createdAt.toDate().toLocaleString()
                  : "Invalid Date"}
              </p>
              <div className="mt-4">
                <h3 className="text-lg font-medium">Items:</h3>
                <ul className="list-disc pl-5">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} x &#8377;{item.price}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">QR Code:</h3>
                <QRCodeCanvas value={order.id} size={100} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
