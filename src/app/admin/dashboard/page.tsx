 
'use client';
import ProtectedRout from "@/app/components/protectedRoute";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: number;
  email: string;
  address: string;
  zipCode: string;
  city: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string };
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
            _id,
            firstName,
            lastName,
            phone,
            email,
            city,
            address,
            zipCode,
            status,
            orderDate,
            discount,
            cartItems[] ->{
            productName,
            image,
            }
        }`
      )
      .then((data) => setOrders(data))
      //.catch((error) => console.log("error fetching orders", error));
  }, []);

  const filteredOrders = filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted", "success");
    } catch (error) {  /* eslint-disable @typescript-eslint/no-unused-vars */

      Swal.fire("Error", "Failed to delete the order", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client.patch(orderId).set({ status: newStatus }).commit();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      if (newStatus === "dispatch") {
        Swal.fire("Order Dispatch", "Your order has been dispatched", "success");
      } else if (newStatus === "success") {
        Swal.fire("Success", "Your order has been completed", "success");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to change status", "error");
    }
  };

  return (
    <ProtectedRout>
      <div className="flex flex-col h-screen bg-gray-50">
        <nav className="bg-black text-white p-4 shadow-lg flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Admin panel</h2>
          <div className="flex space-x-4">
            {["All", "pending", "success", "dispatch"].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === status ? "bg-white text-red-800 font-bold" : "text-white"
                }`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Orders</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full table-auto">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Customer name</th>
                  <th className="px-6 py-3 text-left">Address</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr
                      className="cursor-pointer hover:bg-red-100 transition-all"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <td className="px-6 py-4">{order._id}</td>
                      <td className="px-6 py-4">
                        {order.firstName} {order.lastName}
                      </td>
                      <td className="px-6 py-4">{order.address}</td>
                      <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-black">${order.total}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status || ""}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-gray-100 p-1 rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="success">Success</option>
                          <option value="dispatch">Dispatch</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order._id);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {selectedOrderId === order._id && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 p-4">
                          <h3 className="font-bold text-xl mb-2">Order Details</h3>
                          <p>Phone: <strong>{order.phone}</strong></p>
                          <p>Email: <strong>{order.email}</strong></p>
                          <p>City: <strong>{order.city}</strong></p>

                          <ul className="mt-2">
               {Array.isArray(order.cartItems) && order.cartItems.length > 0 ? (
                 order.cartItems.map((item) => (
                   <li key={`${order._id}-${item.productName}`} className="flex items-center gap-3">
                     <span>{item.productName}</span>
                     {item.image && (
                       <Image
                         src={urlFor(item.image).url()}
                         alt="Product Image"
                         width={100}
                         height={100}
                         className="rounded-md"
                       />
                     )}
                   </li>
               ))
           ) : (
             <li>No items available</li>
            )}
             </ul>

               </td>
                </tr>
             )}
              </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRout>
  );
}
