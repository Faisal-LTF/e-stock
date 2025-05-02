import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Widget from '@/Components/Dashboard/Widget';
import Charts from '@/Components/Dashboard/Charts';
import { IconBox, IconCategory, IconMoneybag, IconUsers } from '@tabler/icons-react';

export default function Dashboard({ kategoriCount, produkCount, transaksiCount, penggunaCount, monthlySales, monthlyTransactionCounts, dailySales, dailyTransactionCounts }) {

    return (
        <DashboardLayout>
            <Head title="Dashboard" />
            <div className="p-6">
                {/* Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    <Widget
                        title={'Kategori'}
                        subtitle={'Total Kategori'}
                        color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                        icon={<IconCategory size={'20'} strokeWidth={'1.5'} />}
                        total={kategoriCount}
                    />
                    <Widget
                        title={'Produk'}
                        subtitle={'Total Produk'}
                        color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                        icon={<IconBox size={'20'} strokeWidth={'1.5'} />}
                        total={produkCount}
                    />
                    <Widget
                        title={'Transaksi'}
                        subtitle={'Total Transaksi'}
                        color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                        icon={<IconMoneybag size={'20'} strokeWidth={'1.5'} />}
                        total={transaksiCount}
                    />
                    <Widget
                        title={'Pengguna'}
                        subtitle={'Total Pengguna'}
                        color={'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}
                        icon={<IconUsers size={'20'} strokeWidth={'1.5'} />}
                        total={penggunaCount}
                    />
                </div>

                {/* Charts */}
                <Charts
                    monthlySales={monthlySales}
                    monthlyTransactionCounts={monthlyTransactionCounts}
                    dailySales={dailySales}
                    dailyTransactionCounts={dailyTransactionCounts}
                />
            </div>
        </DashboardLayout>
    );
}
