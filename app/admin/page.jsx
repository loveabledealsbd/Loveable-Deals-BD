'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchAllProducts } from "@/lib/firestore/products"
import { fetchAllOrders } from "@/lib/firestore/orders"
import { fetchAllStores } from "@/lib/firestore/stores"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        totalStores: 0,
        ordersData: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Stores', value: dashboardData.totalStores, icon: StoreIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            const [products, orders, stores] = await Promise.all([
                fetchAllProducts(),
                fetchAllOrders(),
                fetchAllStores(),
            ])

            const totalEarnings = orders.reduce((sum, order) => sum + (order.total || 0), 0)

            // aggregate order data by date for chart
            const ordersChartData = []
            const dateMap = {}

            orders.forEach(order => {
                if(order.createdAt){
                    const date = order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(order.createdAt);
                    const dateStr = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                    if(dateMap[dateStr]){
                        dateMap[dateStr]++;
                    }else{
                        dateMap[dateStr] = 1;
                    }
                }
            })

            // add last 30 days dummy if not enough real data, else use real data. Just using real data.
            for (const [date, Order] of Object.entries(dateMap)) {
               ordersChartData.push({date, orders: Order})
            }
            
            // sort by date vaguely
            ordersChartData.sort((a,b) => new Date(a.date) - new Date(b.date))

            setDashboardData({
                totalProducts: products.length,
                totalEarnings: totalEarnings.toFixed(2),
                totalOrders: orders.length,
                totalStores: stores.length,
                ordersData: ordersChartData,
            })
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <OrdersAreaChart data={dashboardData.ordersData} />

        </div>
    )
}