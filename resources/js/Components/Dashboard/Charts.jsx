import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Charts({ monthlySales, monthlyTransactionCounts, dailySales, dailyTransactionCounts }) {
    // Map English month names to Indonesian
    const monthMap = {
        January: 'Januari',
        February: 'Februari',
        March: 'Maret',
        April: 'April',
        May: 'Mei',
        June: 'Juni',
        July: 'Juli',
        August: 'Agustus',
        September: 'September',
        October: 'Oktober',
        November: 'November',
        December: 'Desember'
    };

    // Define month labels
    const monthLabels = Object.values(monthMap);

    // Monthly Sales Line Chart Data
    const monthlySalesChartData = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Total Penjualan (Rp)',
                data: monthLabels.map((month) => {
                    const englishMonth = Object.keys(monthMap).find(key => monthMap[key] === month);
                    return monthlySales[englishMonth] || 0;
                }),
                borderColor: 'rgb(59, 130, 246)', // Tailwind blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Monthly Transaction Counts Line Chart Data
    const monthlyTransactionCountsChartData = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Jumlah Transaksi',
                data: monthLabels.map((month) => {
                    const englishMonth = Object.keys(monthMap).find(key => monthMap[key] === month);
                    return monthlyTransactionCounts[englishMonth] || 0;
                }),
                borderColor: 'rgb(236, 72, 153)', // Tailwind pink-500
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Define daily labels
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Daily Sales Bar Chart Data
    const dailySalesChartData = {
        labels: dailyLabels,
        datasets: [
            {
                label: 'Total Penjualan (Rp)',
                data: dailyLabels.map((day) => dailySales[day] || 0),
                backgroundColor: 'rgb(34, 197, 94)', // Tailwind green-500
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
            },
        ],
    };

    // Daily Transaction Counts Bar Chart Data
    const dailyTransactionCountsChartData = {
        labels: dailyLabels,
        datasets: [
            {
                label: 'Jumlah Transaksi',
                data: dailyLabels.map((day) => dailyTransactionCounts[day] || 0),
                backgroundColor: 'rgb(234, 179, 8)', // Tailwind yellow-500
                borderColor: 'rgb(234, 179, 8)',
                borderWidth: 1,
            },
        ],
    };

    // Chart Options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                },
            },
            title: {
                display: true,
                color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
            },
            tooltip: {
                callbacks: {
                    title: function (tooltipItems) {
                        // Modify tooltip title for daily charts to show "Tanggal X"
                        const label = tooltipItems[0].label;
                        if (tooltipItems[0].dataset.label.includes('Total Penjualan') || tooltipItems[0].dataset.label.includes('Jumlah Transaksi')) {
                            return `Tanggal ${label}`;
                        }
                        return label;
                    },
                    label: function (context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (label.includes('Total Penjualan')) {
                            return `${label}: Rp ${value.toLocaleString('id-ID')}`;
                        }
                        return `${label}: ${value}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                },
                grid: {
                    color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                },
            },
            y: {
                ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                    callback: function (value) {
                        if (this.chart.data.datasets[0].label.includes('Total Penjualan')) {
                            return `Rp ${value.toLocaleString('id-ID')}`;
                        }
                        return value;
                    },
                },
                grid: {
                    color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                },
                beginAtZero: true,
            },
        },
    };

    // Monthly Sales Chart Options
    const monthlySalesChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                ...chartOptions.plugins.title,
                text: 'Total Penjualan Bulanan (Rp)',
            },
        },
    };

    // Monthly Transaction Counts Chart Options
    const monthlyTransactionCountsChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                ...chartOptions.plugins.title,
                text: 'Jumlah Transaksi Bulanan',
            },
        },
    };

    // Daily Sales Chart Options
    const dailySalesChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                ...chartOptions.plugins.title,
                text: 'Total Penjualan Harian (Rp)',
            },
        },
    };

    // Daily Transaction Counts Chart Options
    const dailyTransactionCountsChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                ...chartOptions.plugins.title,
                text: 'Jumlah Transaksi Harian',
            },
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Sales Line Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                {monthlySales && Object.keys(monthlySales).length > 0 ? (
                    <div className="h-80">
                        <Line data={monthlySalesChartData} options={monthlySalesChartOptions} />
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Tidak ada data penjualan bulanan untuk ditampilkan.
                    </div>
                )}
            </div>

            {/* Monthly Transaction Counts Line Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                {monthlyTransactionCounts && Object.keys(monthlyTransactionCounts).length > 0 ? (
                    <div className="h-80">
                        <Line data={monthlyTransactionCountsChartData} options={monthlyTransactionCountsChartOptions} />
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Tidak ada data transaksi bulanan untuk ditampilkan.
                    </div>
                )}
            </div>

            {/* Daily Sales Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                {dailySales && Object.keys(dailySales).length > 0 ? (
                    <div className="h-80">
                        <Bar data={dailySalesChartData} options={dailySalesChartOptions} />
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Tidak ada data penjualan harian untuk ditampilkan.
                    </div>
                )}
            </div>

            {/* Daily Transaction Counts Bar Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                {dailyTransactionCounts && Object.keys(dailyTransactionCounts).length > 0 ? (
                    <div className="h-80">
                        <Bar data={dailyTransactionCountsChartData} options={dailyTransactionCountsChartOptions} />
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        Tidak ada data transaksi harian untuk ditampilkan.
                    </div>
                )}
            </div>
        </div>
    );
}
