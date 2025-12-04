
import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Order } from '../../types';

// --- ICONS ---
const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const AOVIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 2.803M15 21a6 6 0 00-9-5.197" /></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    return "Just now";
};

// --- SUB-COMPONENTS ---
const StatCard: React.FC<{ title: string; value: string; trend: number; icon: React.ReactNode }> = ({ title, value, trend, icon }) => {
    const isPositive = trend >= 0;
    const trendText = isFinite(trend) ? `${isPositive ? '+' : ''}${trend.toFixed(1)}%` : '...';
    return (
        <div className="bg-white p-5 rounded-lg shadow">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
            </div>
            <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-bold text-brand-text">{value}</p>
                <div className={`ml-2 flex items-center text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                    <span>{trendText}</span>
                </div>
            </div>
        </div>
    );
};

const PerformanceChart: React.FC<{ data: { date: string; revenue: number; sales: number }[] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any } | null>(null);
    const chartRef = React.useRef<SVGSVGElement>(null);
    const width = 600;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };

    const maxValRevenue = Math.max(...data.map(d => d.revenue), 0);
    const maxValSales = Math.max(...data.map(d => d.sales), 0);
    
    // Prevent division by zero errors when there is no data
    const maxRevenue = maxValRevenue === 0 ? 10 : maxValRevenue;
    const maxSales = maxValSales === 0 ? 10 : maxValSales;
    
    const xScale = (index: number) => {
        const denominator = Math.max(data.length - 1, 1);
        return padding.left + (index / denominator) * (width - padding.left - padding.right);
    };
    const yRevenueScale = (value: number) => height - padding.bottom - (value / maxRevenue) * (height - padding.top - padding.bottom);
    const ySalesScale = (value: number) => (value / maxSales) * (height - padding.top - padding.bottom);

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yRevenueScale(d.revenue)}`).join(' ');
    const areaPath = `${linePath} V ${height - padding.bottom} H ${padding.left} Z`;
    
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!chartRef.current) return;
        const rect = chartRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const index = Math.round(((mouseX - padding.left) / (width - padding.left - padding.right)) * (data.length - 1));
        if (index >= 0 && index < data.length) {
            const pointData = data[index];
            setTooltip({
                x: xScale(index),
                y: yRevenueScale(pointData.revenue),
                data: pointData,
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow relative">
            <h3 className="text-lg font-semibold text-brand-text">Store Performance</h3>
            {data.length > 1 ? (
                <svg ref={chartRef} viewBox={`0 0 ${width} ${height}`} onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
                    {/* Y-Axis Labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map(tick => (
                        <g key={tick} className="text-gray-400 text-xs">
                            <text x={padding.left - 8} y={yRevenueScale(maxRevenue * tick)} textAnchor="end" alignmentBaseline="middle">${(maxRevenue * tick).toFixed(0)}</text>
                            <line x1={padding.left} x2={width - padding.right} y1={yRevenueScale(maxRevenue * tick)} y2={yRevenueScale(maxRevenue * tick)} stroke="#E5E7EB" strokeWidth="1" />
                        </g>
                    ))}

                    {/* Bars for Sales */}
                    {data.map((d, i) => (
                        <rect key={i} x={xScale(i) - 5} y={height - padding.bottom - ySalesScale(d.sales)} width="10" height={ySalesScale(d.sales)} fill="#EBC7C7" opacity="0.4" rx="2" />
                    ))}
                    
                    {/* Line and Area for Revenue */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5C374C" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#5C374C" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#areaGradient)" />
                    <path d={linePath} fill="none" stroke="#5C374C" strokeWidth="2" />
                    
                    {/* X-Axis Labels */}
                    {data.map((d, i) => (i % Math.ceil(data.length / 7) === 0) && (
                         <text key={i} x={xScale(i)} y={height - padding.bottom + 15} textAnchor="middle" className="text-gray-500 text-xs">
                           {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </text>
                    ))}

                    {/* Tooltip */}
                    {tooltip && (
                         <>
                            <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} stroke="#5C374C" strokeDasharray="3,3" />
                            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#5C374C" stroke="white" strokeWidth="2" />
                             <g transform={`translate(${tooltip.x > width / 2 ? tooltip.x - 130 : tooltip.x + 10}, ${padding.top})`}>
                                <rect x="0" y="0" width="120" height="60" rx="4" fill="white" className="shadow-lg" stroke="#E5E7EB" />
                                <text x="10" y="20" className="text-xs font-semibold">{new Date(tooltip.data.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</text>
                                <text x="10" y="40" className="text-xs">Revenue: <tspan className="font-bold">${tooltip.data.revenue.toFixed(2)}</tspan></text>
                                <text x="10" y="55" className="text-xs">Sales: <tspan className="font-bold">{tooltip.data.sales}</tspan></text>
                            </g>
                        </>
                    )}
                </svg>
            ) : <div className="h-72 flex items-center justify-center text-gray-500">Not enough data to display chart.</div>}
        </div>
    );
};


// --- DASHBOARD COMPONENT ---
interface DashboardProps {
    navigateToSupport?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateToSupport }) => {
    const { orders, allProfiles, products, customers } = useStore();
    const [timePeriod, setTimePeriod] = useState<7 | 30 | 90>(30);

    const { currentPeriodData, chartData, bestSellers, recentOrders } = useMemo(() => {
        const now = new Date();
        const currentPeriodEnd = new Date(now);
        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(now.getDate() - timePeriod);

        const prevPeriodEnd = new Date(currentPeriodStart);
        prevPeriodEnd.setDate(prevPeriodEnd.getDate() - 1);
        const prevPeriodStart = new Date(prevPeriodEnd);
        prevPeriodStart.setDate(prevPeriodEnd.getDate() - timePeriod);

        const filterDataByPeriod = (startDate: Date, endDate: Date) => {
            const periodOrders = orders.filter(o => {
                const orderDate = new Date(o.orderDate);
                return orderDate >= startDate && orderDate <= endDate;
            });
            const periodNewProfiles = allProfiles.filter(p => {
                if (!p.created_at) return false;
                const profileDate = new Date(p.created_at);
                return profileDate >= startDate && profileDate <= endDate;
            });
            const revenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
            const sales = periodOrders.length;
            const aov = sales > 0 ? revenue / sales : 0;
            return { revenue, sales, aov, newCustomers: periodNewProfiles.length, orders: periodOrders };
        };

        const currentData = filterDataByPeriod(currentPeriodStart, currentPeriodEnd);
        const prevData = filterDataByPeriod(prevPeriodStart, prevPeriodEnd);

        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };

        const currentPeriodData = {
            revenue: currentData.revenue,
            aov: currentData.aov,
            sales: currentData.sales,
            newCustomers: currentData.newCustomers,
            revenueTrend: calculateTrend(currentData.revenue, prevData.revenue),
            aovTrend: calculateTrend(currentData.aov, prevData.aov),
            salesTrend: calculateTrend(currentData.sales, prevData.sales),
            newCustomersTrend: calculateTrend(currentData.newCustomers, prevData.newCustomers),
        };
        
        // Chart data aggregation
        const dailyData: { [key: string]: { revenue: number, sales: number } } = {};
        for (let i = 0; i < timePeriod; i++) {
            const d = new Date(currentPeriodStart);
            d.setDate(d.getDate() + i);
            dailyData[d.toISOString().split('T')[0]] = { revenue: 0, sales: 0 };
        }
        currentData.orders.forEach(order => {
            const date = new Date(order.orderDate).toISOString().split('T')[0];
            if (dailyData[date]) {
                dailyData[date].revenue += order.total;
                dailyData[date].sales += 1;
            }
        });
        const chartData = Object.entries(dailyData).map(([date, data]) => ({ date, ...data }));
        
        // Best Sellers calculation
        const productSales: { [key: string]: { revenue: number, units: number } } = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { revenue: 0, units: 0 };
                }
                productSales[item.productId].revenue += item.price * item.quantity;
                productSales[item.productId].units += item.quantity;
            });
        });
        const bestSellers = Object.entries(productSales)
            .map(([productId, sales]) => ({
                product: products.find(p => p.id === productId),
                ...sales
            }))
            .filter(item => item.product)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Recent orders
        const recentOrders = orders.slice(0, 5).map(o => ({
            ...o,
            customerName: customers.find(c => c.id === o.customerId)?.name || 'darren edward'
        }));

        return { currentPeriodData, chartData, bestSellers, recentOrders };
    }, [timePeriod, orders, allProfiles, products, customers]);
    
    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.lowStockThreshold != null && p.stock <= p.lowStockThreshold)
                       .sort((a,b) => a.stock - b.stock);
    }, [products]);

    const statusColor: Record<Order['status'], string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Processing: 'bg-blue-100 text-blue-800',
        Shipped: 'bg-green-100 text-green-800',
        Delivered: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brand-text">Dashboard</h2>
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                    {[7, 30, 90].map(period => (
                        <button key={period} onClick={() => setTimePeriod(period as 7 | 30 | 90)} className={`px-4 py-1 text-sm font-medium rounded-md ${timePeriod === period ? 'bg-white shadow-sm text-brand-header' : 'text-gray-500 hover:text-brand-header'}`}>
                            Last {period} days
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(currentPeriodData.revenue)} trend={currentPeriodData.revenueTrend} icon={<RevenueIcon />} />
                <StatCard title="Avg. Order Value" value={formatCurrency(currentPeriodData.aov)} trend={currentPeriodData.aovTrend} icon={<AOVIcon />} />
                <StatCard title="Total Sales" value={currentPeriodData.sales.toString()} trend={currentPeriodData.salesTrend} icon={<SalesIcon />} />
                <StatCard title="New Customers" value={currentPeriodData.newCustomers.toString()} trend={currentPeriodData.newCustomersTrend} icon={<UsersIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PerformanceChart data={chartData} />
                </div>
                <div className="space-y-6">
                     {/* Help Card */}
                     <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-blue-800 mb-2">Need Help?</h3>
                            <p className="text-sm text-blue-600 mb-4">
                                Stuck? Check out our simple guide for store owners. Learn how to add products, manage orders, and more.
                            </p>
                        </div>
                        {navigateToSupport && (
                            <button 
                                onClick={navigateToSupport}
                                className="w-full py-2 bg-white text-blue-600 font-semibold rounded-md border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                                Read Support Guide
                            </button>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-brand-text mb-4">Best Sellers</h3>
                        {bestSellers.length > 0 ? (
                            <ul className="space-y-4">
                                {bestSellers.map(({product, revenue}) => (
                                    <li key={product!.id} className="flex items-center space-x-4 text-sm">
                                        <img src={product!.imageUrl} alt={product!.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                        <p className="flex-grow font-medium truncate">{product!.name}</p>
                                        <p className="font-semibold">{formatCurrency(revenue)}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-gray-500">No sales data yet.</p>
                        )}
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-brand-text mb-4">Recent Orders</h3>
                         {recentOrders.length > 0 ? (
                            <ul className="space-y-4">
                                {recentOrders.map(order => (
                                    <li key={order.id} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium">{order.customerName}</p>
                                            <p className="text-xs text-gray-500">{timeAgo(new Date(order.created_at || order.orderDate))}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(order.total)}</p>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No recent orders.</p>
                        )}
                    </div>
                    {lowStockProducts.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                           <h3 className="text-lg font-semibold text-red-600 mb-4">Low Stock Alerts</h3>
                           <ul className="space-y-3">
                                {lowStockProducts.map(p => (
                                    <li key={p.id} className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-800">{p.name}</span>
                                        <span className="font-bold text-red-500">Only {p.stock} left</span>
                                    </li>
                                ))}
                            </ul>
                       </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
