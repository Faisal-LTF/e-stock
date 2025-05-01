import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import Table from '@/Components/Dashboard/Table';
import Search from '@/Components/Dashboard/Search';
import Pagination from '@/Components/Dashboard/Pagination';
import { IconDatabaseOff, IconPrinter, IconFileDownload } from '@tabler/icons-react';

const formatPrice = (price) => {
    return price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export default function Index() {
    const { transactions } = usePage().props;

    // Tentukan apakah transactions memiliki struktur paginasi
    const isPaginated = transactions && transactions.data && Array.isArray(transactions.data);
    const transactionList = isPaginated ? transactions.data : Array.isArray(transactions) ? transactions : [];

    return (
        <>
            <Head title="Histori Transaksi" />
            <div className="mb-2">
                <div className="flex justify-between items-center gap-2">
                    <div className="w-full md:w-4/12">
                        <Search
                            url={route('transactions-histori.index')}
                            placeholder="Cari transaksi berdasarkan invoice atau nama pelanggan..."
                        />
                    </div>
                </div>
            </div>
            <Table.Card title="Riwayat Transaksi">
                <Table>
                    <Table.Thead>
                        <tr>
                            <Table.Th className="w-10">No</Table.Th>
                            <Table.Th className="w-40">Invoice</Table.Th>
                            <Table.Th className="w-40">Customer</Table.Th>
                            <Table.Th className="w-32">Tanggal</Table.Th>
                            <Table.Th className="w-40">Total</Table.Th>
                            <Table.Th className="w-40">Kasir</Table.Th>
                            <Table.Th className="w-20"></Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {transactionList.length ? (
                            <>
                                {transactionList.map((trx, i) => (
                                    <tr className="hover:bg-gray-100 dark:hover:bg-gray-900" key={trx.id}>
                                        <Table.Td className="text-center">
                                            {isPaginated
                                                ? ++i + (transactions.current_page - 1) * transactions.per_page
                                                : ++i}
                                        </Table.Td>
                                        <Table.Td>{trx.invoice}</Table.Td>
                                        <Table.Td>{trx.customer?.name || '-'}</Table.Td>
                                        <Table.Td>{formatDate(trx.created_at)}</Table.Td>
                                        <Table.Td>{formatPrice(trx.grand_total)}</Table.Td>
                                        <Table.Td>{trx.cashier?.name || '-'}</Table.Td>
                                        <Table.Td>
                                            <a
                                                href={route('transactions.print', trx.invoice)}
                                                target="_blank"
                                                className="flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm transition-colors"
                                            >
                                                <IconPrinter size={16} strokeWidth={1.5} />
                                            </a>
                                        </Table.Td>
                                    </tr>
                                ))}
                            </>
                        ) : (
                            <Table.Empty colSpan={7} message={
                                <>
                                    <div className="flex justify-center items-center text-center mb-2">
                                        <IconDatabaseOff
                                            size={24}
                                            strokeWidth={1.5}
                                            className="text-gray-500 dark:text-white"
                                        />
                                    </div>
                                    <span className="text-gray-500">
                                        Data transaksi
                                    </span>{' '}
                                    <span className="text-rose-500 underline underline-offset-2">
                                        tidak ditemukan.
                                    </span>
                                </>
                            } />
                        )}
                    </Table.Tbody>
                </Table>
            </Table.Card>

            {isPaginated && transactions.last_page !== 1 && (
                <Pagination links={transactions.links} />
            )}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
