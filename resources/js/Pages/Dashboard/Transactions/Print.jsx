import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Print({ transaction, store }) {
    const formatPrice = (price) => {
        return price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    };

    useEffect(() => {
        window.print();
    }, []);

    const totalSubtotal = transaction.details.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    return (
        <>
            <Head title="Print Invoice" />
            {/* Memperlebar ukuran maksimal container */}
            <div className="max-w-4xl mx-auto p-4 bg-white dark:bg-black text-black dark:text-white text-sm">
                <div className="flex items-center">

                    {/* Konten tengah */}
                    <div className="flex-1 text-left">
                        {/* <h1 className="text-2xl font-bold text-blue-300">{store?.name || 'Toko'}</h1> */}
                        <h1 className="text-2xl font-bold" style={{ color: '#00877b' }}>{store?.name || 'Toko'}</h1>
                        <p >{store?.address || 'Alamat Toko'}</p>
                        <p>{store?.phone || 'Nomor Telepon'}</p>
                    </div>
                    {/* Logo di pojok kiri */}
                    <div className="flex-shrink-0">
                        <img
                            src="/img/amaa.png" // Path logo kiri
                            alt="Left Logo"
                            className="h-20 w-auto" // Sesuaikan ukuran
                            style={{ opacity: 0.5 }} // Atur opasitas
                        />
                    </div>
                </div>

                <div className="flex justify-between mb-2">
                    <div className="text-left">
                        <h2 className="text-lg font-semibold">Pelanggan</h2>
                        <div className="flex justify-end">
                            <div className="inline-block text-right font-medium" style={{ width: '5rem', textAlign: 'left' }}>
                                <div>Nama</div>
                                <div>Telepon</div>
                                <div>Alamat</div>
                            </div>
                            <div className="inline-block mx-2">
                                <div>:</div>
                                <div>:</div>
                                <div>:</div>
                            </div>
                            <div className="inline-block text-left">
                                <div>{transaction.customer?.name || 'Umum'}</div>
                                <div>{transaction.customer?.no_telp || '-'}</div>
                                <div>{transaction.customer?.address || '-'}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Faktur </h2>
                        <p>No: {transaction.invoice}</p>
                        <p>Tanggal: {new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="border-t border-b border-black dark:border-white">
                        <tr>
                            <th className=" w-12">No</th>
                            <th className="">Produk</th>
                            <th className="">Harga</th>
                            <th className=" w-16">Jumlah</th>
                            <th className=" text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="border-b border-black dark:border-white">
                        {transaction.details.map((item, index) => (
                            <tr key={index}>
                                <td className="">{index + 1}</td>
                                <td className="">{item.product.title}</td>
                                <td className="">{formatPrice(item.price)}</td>
                                <td className="">{item.qty}</td>
                                <td className=" text-right">{formatPrice(item.price * item.qty)}</td>
                            </tr>
                        ))}

                        {/* Tambah baris kosong jika kurang dari 3 */}
                        {Array.from({ length: 2 - transaction.details.length }, (_, i) => (
                            <tr key={`empty-${i}`}>
                                <td className="py-4">&nbsp;</td>
                                <td className="py-4">&nbsp;</td>
                                <td className="py-4">&nbsp;</td>
                                <td className="py-4">&nbsp;</td>
                                <td className="py-4">&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Layout dengan dua kolom untuk informasi dan ringkasan */}
                <div className="flex flex-wrap">
                    {/* Kolom kiri: Keterangan/Syarat */}
                    <div className="w-full md:w-1/2 pr-4">
                        <div className=" pt-2">
                            <h3 className="font-semibold mb-2">Keterangan:</h3>
                            <ol className="list-decimal pl-5 text-xs space-y-1">
                                <li>Barang yang sudah dibeli tidak bisa ditukar ataupun dikembalikan</li>
                                <li>Garansi hilang apabila disebabkan faktor external</li>
                            </ol>

                            {/* Area Tanda Tangan di bawah keterangan */}
                            <div className="mt-2">
                                <div className="flex">
                                    <div className="text-center w-1/2">
                                        <p className="text-xs">Hormat kami,</p>
                                        <div className="h-12"></div>
                                        <p className="text-xs font-mono">( .................. )</p>
                                    </div>
                                    <div className="text-center w-1/2">
                                        <p className="text-xs">Penerima,</p>
                                        <div className="h-12"></div>
                                        <p className="text-xs font-mono">( .................. )</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 text-left mt-4">
                                <div className="inline-block text-right font-medium" >
                                    <div>Rekening</div>
                                </div>
                                <p >{store?.rec || 'Rekening Toko'}</p>
                            </div>
                            {/* <div className="flex justify-end">
                                <div className="inline-block text-right font-medium" >
                                    <div>Rekening</div>
                                </div>
                                <div className="inline-block mx-2">
                                    <div>:</div>
                                </div>
                                <div className="inline-block text-left">
                                    <div>{store?.rec || 'Rekening Toko'}</div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Kolom kanan: Ringkasan Transaksi */}
                    <div className="w-full md:w-1/2 mt-4 md:mt-0">
                        <div className=" pt-2">
                            <div className="flex justify-between py-1">
                                <span>Subtotal</span>
                                <span>{formatPrice(totalSubtotal)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>
                                    Diskon (
                                    {transaction.discount_type === 'percentage'
                                        ? `${transaction.discount_percentage}%`
                                        : 'Rupiah'}
                                    )
                                </span>
                                <span>{formatPrice(transaction.discount)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Pajak ({Number(transaction.tax_percentage).toFixed(2)}%)</span>
                                <span>{formatPrice(transaction.tax_amount)}</span>
                            </div>
                            <div className="flex justify-between py-1 font-bold border-t border-black dark:border-white pt-2">
                                <span>Grand Total</span>
                                <span>{formatPrice(transaction.grand_total)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Bayar</span>
                                <span>{formatPrice(transaction.cash)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Kembalian</span>
                                <span>{formatPrice(transaction.change)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
