
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { Order } from '../../types';
import { formatError } from '../../utils/errorHelper';

const OrderManager = () => {
    const { orders, customers, updateOrderStatus } = useStore();

    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert(`There was an error updating the order status: ${formatError(error)}`);
        }
    };

    const getCustomerName = (customerId: string) => {
        return customers.find(c => c.id === customerId)?.name || 'darren edward';
    };

    const statusColor = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Processing: 'bg-blue-100 text-blue-800',
        Shipped: 'bg-green-100 text-green-800',
        Delivered: 'bg-gray-100 text-gray-800',
    };
    
    const orderStatuses: Order['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered'];

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-brand-text">Order Management</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                <td className="px-6 py-4">{getCustomerName(order.customerId)}</td>
                                <td className="px-6 py-4">{order.orderDate}</td>
                                <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                        className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded border-0 focus:ring-0 ${statusColor[order.status]}`}
                                    >
                                        {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderManager;
