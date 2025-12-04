

import React from 'react';
import { useStore } from '../../hooks/useStore';
import { Address } from '../../types';

const AddressDisplay: React.FC<{ address: Address, title: string }> = ({ address, title }) => (
    <div>
        <h4 className="text-md font-semibold text-brand-text">{title}</h4>
        <div className="text-sm text-brand-light-text">
            <p>{address.street}</p>
            <p>{address.city}, {address.postalCode}</p>
            <p>{address.country}</p>
        </div>
    </div>
);


const ClientManager = () => {
    // FIX: Destructure customers and orders directly from useStore.
    const { customers, orders } = useStore();

    const statusColor = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Processing: 'bg-blue-100 text-blue-800',
        Shipped: 'bg-green-100 text-green-800',
        Delivered: 'bg-gray-100 text-gray-800',
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-brand-text">Client Management</h2>
            <div className="space-y-8">
                {customers.map(customer => {
                    const customerOrders = orders.filter(order => order.customerId === customer.id);
                    return (
                        <div key={customer.id} className="border border-brand-border rounded-lg p-6 bg-gray-50/50">
                            <div className="mb-4 border-b border-brand-border pb-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <h3 className="text-lg font-semibold text-brand-text">{customer.name}</h3>
                                    <p className="text-sm text-brand-light-text">{customer.email}</p>
                                </div>
                                <div className="md:col-span-1">
                                    <AddressDisplay address={customer.shippingAddress} title="Shipping Address"/>
                                </div>
                                <div className="md:col-span-1">
                                     <AddressDisplay address={customer.billingAddress} title="Billing Address"/>
                                </div>
                            </div>
                            
                            <h4 className="text-md font-semibold text-brand-text mb-3">Order History</h4>
                            {customerOrders.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-brand-border">
                                    <table className="w-full text-sm text-left bg-white">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2">Order ID</th>
                                                <th className="px-4 py-2">Date</th>
                                                <th className="px-4 py-2">Total</th>
                                                <th className="px-4 py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerOrders.map(order => (
                                                <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.id}</td>
                                                    <td className="px-4 py-3">{order.orderDate}</td>
                                                    <td className="px-4 py-3 font-medium">${order.total.toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusColor[order.status]}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-brand-light-text text-center py-4 bg-white rounded-lg border">No orders found for this client.</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClientManager;
