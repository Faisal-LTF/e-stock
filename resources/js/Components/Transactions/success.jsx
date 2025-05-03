import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import Card from '@/Components/Dashboard/Card';
import Button from '@/Components/Dashboard/Button';
import { IconArrowRight } from '@tabler/icons-react';

export default function Success() {
    return (
        <>
            <Head title="Transaksi Berhasil" />
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                    <Card title="Transaksi Berhasil">
                        <p className="text-gray-700 dark:text-gray-200">
                            Transaksi Anda telah berhasil disimpan. Terima kasih!
                        </p>
                        <Button
                            label="Kembali ke Transaksi"
                            icon={<IconArrowRight size={20} strokeWidth={1.5} />}
                            onClick={() => window.location.href = route('transactions.index')}
                            className="mt-4 border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                        />
                    </Card>
                </div>
            </div>
        </>
    );
}

Success.layout = page => <DashboardLayout children={page} />;
