import React from 'react';
import { useStore } from '../../hooks/useStore';
import { Button } from '../ui/Button';
import { Order, CartItem } from '../../types';
import { generateInvoicePdf } from '../../services/pdfService';

const OrderHistory = () => {
    const { userOrders, customers, settings, dispatchCartAction, products } = useStore();

    const handleReorder = (order: Order) => {
        const itemsToAdd: CartItem[] = order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return {
                ...item,
                cartItemId: `cart${Date.now()}-${Math.random()}` // Create a new unique ID
            };
        }).filter((item): item is CartItem => item !== null);

        if (itemsToAdd.length > 0) {
            dispatchCartAction({ type: 'ADD_MULTIPLE_TO_CART', payload: itemsToAdd });
            alert(`${itemsToAdd.length} item(s) have been added to your cart.`);
        }
    };
    
    const handleDownloadInvoice = (order: Order) => {
        const customer = customers.find(c => c.id === order.customerId);
        if (customer && settings) {
            generateInvoicePdf(order, customer, settings);
        } else {
            alert("Could not generate invoice. Customer or store settings are missing.");
        }
    };

    const statusColor = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Processing: 'bg-blue-100 text-blue-800',
        Shipped: 'bg-green-100 text-green-800',
        Delivered: 'bg-gray-100 text-gray-800',
    };

    if (userOrders.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow text-center">
                <h2 className="text-xl font-bold text-brand-text mb-4">Order History</h2>
                <p>You haven't placed any orders yet.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-brand-text mb-4">Order History</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Payment</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userOrders.map(order => (
                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">{order.paymentMethod}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusColor[order.status]}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <Button variant="secondary" className="text-xs py-1" onClick={() => handleReorder(order)}>Re-order</Button>
                                    <Button variant="secondary" className="text-xs py-1" onClick={() => handleDownloadInvoice(order)}>Invoice</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderHistory;