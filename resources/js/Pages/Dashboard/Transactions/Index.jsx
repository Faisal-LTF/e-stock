import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import Card from '@/Components/Dashboard/Card';
import Input from '@/Components/Dashboard/Input';
import { IconArrowRight, IconMoneybag, IconPencilPlus, IconReceipt, IconShoppingCart, IconShoppingCartPlus, IconTrash } from '@tabler/icons-react';
import Button from '@/Components/Dashboard/Button';
import axios from 'axios';
import InputSelect from '@/Components/Dashboard/InputSelect';
import Table from '@/Components/Dashboard/Table';
import toast from 'react-hot-toast';

// Fungsi untuk mengubah angka menjadi format Rupiah
const formatRupiah = (number) => {
    if (!number) return '';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Fungsi untuk mengubah format Rupiah kembali ke angka
const parseRupiah = (string) => {
    return parseInt(string.replace(/\./g, '')) || 0;
};

export default function Index({ carts, carts_total, customers }) {
    const { errors, auth } = usePage().props;

    const [barcode, setBarcode] = useState('');
    const [product, setProduct] = useState({});
    const [qty, setQty] = useState(1);
    const [grandTotal, setGrandTotal] = useState(carts_total);
    const [cash, setCash] = useState(0);
    const [cashInput, setCashInput] = useState('');
    const [change, setChange] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountInput, setDiscountInput] = useState('');
    const [discountType, setDiscountType] = useState('rupiah');
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [taxPercentage, setTaxPercentage] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Helper function to format price
    const formatPrice = (price) => {
        return price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    };

    const { data, setData, post, processing } = useForm({
        customer_id: '',
        product_id: '',
        sell_price: '',
        qty: '',
        discount: '',
        discount_type: 'rupiah',
        tax_percentage: 0,
        tax_amount: 0,
        cash: '',
        change: '',
    });

    // Set selected customer
    const setSelectedCustomerHandler = (value) => {
        setSelectedCustomer(value);
        setData('customer_id', value.id);
    };

    useEffect(() => {
        let calculatedDiscount = discount;
        if (discountType === 'percentage') {
            calculatedDiscount = (discountPercentage / 100) * carts_total;
        }
        setDiscount(calculatedDiscount);

        const taxableAmount = carts_total - calculatedDiscount;
        const calculatedTax = (taxPercentage / 100) * taxableAmount;
        setTaxAmount(calculatedTax);
        setData('tax_amount', calculatedTax);

        const calculatedGrandTotal = taxableAmount + calculatedTax;
        setGrandTotal(calculatedGrandTotal);
        setChange(cash - calculatedGrandTotal);
        setData('grand_total', calculatedGrandTotal);
        setData('change', cash - calculatedGrandTotal);
    }, [carts_total, discount, discountType, discountPercentage, taxPercentage, cash]);

    const searchProduct = (e) => {
        e.preventDefault();
        axios.post('/dashboard/transactions/searchProduct', { barcode })
            .then(response => {
                if (response.data.success) {
                    setProduct(response.data.data);
                } else {
                    setProduct({});
                }
            });
    };

    const addToCart = (e) => {
        e.preventDefault();
        router.post(route('transactions.addToCart'), {
            product_id: product.id,
            sell_price: product.sell_price,
            qty,
        });
    };

    // Modify the storeTransaction function to open in a new tab instead of navigating
    const storeTransaction = (e) => {
        e.preventDefault();
        if (!data.customer_id) {
            toast('Pilih pelanggan terlebih dahulu', {
                style: {
                    borderRadius: '10px',
                    background: '#FF0000',
                    color: '#fff',
                },
            });
        } else {
            if (cash >= grandTotal) {
                // Use axios for the form submission instead of router.post
                axios.post(route('transactions.store'), {
                    customer_id: selectedCustomer ? selectedCustomer.id : '',
                    discount: discountType === 'percentage' ? discountPercentage : discount,
                    discount_type: discountType,
                    tax_percentage: taxPercentage,
                    tax_amount: taxAmount,
                    grand_total: grandTotal,
                    cash,
                    change,
                }).then(response => {
                    toast('Data transaksi berhasil disimpan', {
                        icon: '👏',
                        style: {
                            borderRadius: '10px',
                            background: '#1C1F29',
                            color: '#fff',
                        },
                    });

                    // Open the print page in a new tab using the invoice from the response
                    const invoice = response.data.invoice;
                    window.open(route('transactions.print', invoice), '_blank');

                    // Refresh the current page to update the cart
                    window.location.reload();
                }).catch(error => {
                    console.log('Store Transaction Errors:', error);
                    toast('Terjadi kesalahan saat menyimpan transaksi', {
                        style: {
                            borderRadius: '10px',
                            background: '#FF0000',
                            color: '#fff',
                        },
                    });
                });
            } else {
                toast('Uang tunai tidak cukup', {
                    style: {
                        borderRadius: '10px',
                        background: '#FF0000',
                        color: '#fff',
                    },
                });
            }
        }
    };

    // Handler untuk input Diskon (Rupiah)
    const handleDiscountChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setDiscountInput(formatRupiah(value));
        setDiscount(parseRupiah(value));
    };

    // Handler untuk input Diskon (Persentase)
    const handleDiscountPercentageChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setDiscountPercentage(0);
        } else {
            const numValue = parseInt(value) || 0;
            if (numValue >= 0 && numValue <= 100) {
                setDiscountPercentage(numValue);
            }
        }
    };

    // Handler untuk input Pajak (Persentase)
    const handleTaxPercentageChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setTaxPercentage(0);
            setData('tax_percentage', 0);
        } else {
            const numValue = parseFloat(value) || 0;
            if (numValue >= 0 && numValue <= 100) {
                setTaxPercentage(numValue);
                setData('tax_percentage', numValue);
            }
        }
    };

    // Handler untuk input Bayar
    const handleCashChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setCashInput('');
            setCash(0);
        } else {
            setCashInput(formatRupiah(value));
            setCash(parseRupiah(value));
        }
    };
    // Fungsi untuk mendapatkan label jenis diskon
    const getDiscountTypeLabel = () => {
        return discountType === 'rupiah' ? 'Rupiah (Rp)' : 'Persentase (%)';
    };

    return (
        <>
            <Head title="Dashboard Transaksi" />
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
                    <Card
                        title={'Tambah Data Produk'}
                        icon={<IconShoppingCart size={20} strokeWidth={1.5} />}
                        footer={
                            <Button
                                type={'submit'}
                                label={'Tambah'}
                                icon={<IconShoppingCartPlus size={20} strokeWidth={1.5} />}
                                disabled={!product.id}
                                className={`border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 mt-5 ${!product.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        }
                        form={addToCart}
                    >
                        <div className="mb-2">
                            <Input
                                type={'text'}
                                label={'Scan/Input Barcode Produk'}
                                placeholder={'Barcode Produk'}
                                onChange={e => setBarcode(e.target.value)}
                                onKeyUp={searchProduct}
                            />
                        </div>
                        <div className="mb-2">
                            <Input
                                type={'text'}
                                label={'Produk'}
                                placeholder={'Nama produk'}
                                disabled
                                value={product.title || ''}
                            />
                        </div>
                        <div className="mb-2">
                            <Input
                                type={'number'}
                                label={'Kuantitas'}
                                placeholder={'Kuantitas'}
                                onChange={e => setQty(e.target.value)}
                            />
                            <small className="text-gray-500">
                                Stok : {product.stock || 0}
                            </small>
                        </div>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-8">
                    <Card
                        title={'Transaksi'}
                        icon={<IconPencilPlus size={20} strokeWidth={1.5} />}
                    >
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12">
                                <div className="flex justify-between">
                                    <h1 className="text-lg md:text-2xl text-black dark:text-white">Total Belanja</h1>
                                    <h1 className="text-lg md:text-2xl text-black dark:text-white">
                                        {formatPrice(carts_total)}
                                    </h1>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Input
                                    type={'text'}
                                    label={'Kasir'}
                                    placeholder={'Kasir'}
                                    disabled
                                    value={auth.user.name}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <InputSelect
                                    label="Pelanggan"
                                    data={customers}
                                    selected={selectedCustomer}
                                    setSelected={setSelectedCustomerHandler}
                                    placeholder="Pelanggan"
                                    errors={errors.customer_id}
                                    multiple={false}
                                    searchable={true}
                                    displayKey='name'
                                />
                            </div>
                        </div>
                    </Card>

                    <Table.Card title={'Keranjang'} className={'mt-5'}>
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th className='w-10'>No</Table.Th>
                                    <Table.Th>Produk</Table.Th>
                                    <Table.Th>Harga</Table.Th>
                                    <Table.Th>Qty</Table.Th>
                                    <Table.Th>Sub Total</Table.Th>
                                    <Table.Th></Table.Th>
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {carts.map((item, index) => (
                                    <tr key={item.id}>
                                        <Table.Td className='w-10'>{index + 1}</Table.Td>
                                        <Table.Td>{item.product.title}</Table.Td>
                                        <Table.Td>{formatPrice(item.price)}</Table.Td>
                                        <Table.Td>{item.qty}</Table.Td>
                                        <Table.Td>{formatPrice(item.price * item.qty)}</Table.Td>
                                        <Table.Td>
                                            <Button
                                                type={'delete'}
                                                icon={<IconTrash size={16} strokeWidth={1.5} />}
                                                className={'border bg-rose-100 border-rose-300 text-rose-500 hover:bg-rose-200 dark:bg-rose-950 dark:border-rose-800 dark:text-gray-300  dark:hover:bg-rose-900'}
                                                url={route('transactions.destroyCart', item.id)}
                                            />
                                        </Table.Td>
                                    </tr>
                                ))}
                            </Table.Tbody>
                            <tfoot>
                                <tr>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td></Table.Td>
                                    <Table.Td>Total</Table.Td>
                                    <Table.Td>{formatPrice(carts_total)}</Table.Td>
                                    <Table.Td></Table.Td>
                                </tr>
                            </tfoot>
                        </Table>
                    </Table.Card>

                    <div className="my-5"></div>

                    <Card
                        title={'Pembayaran'}
                        icon={<IconReceipt size={20} strokeWidth={1.5} />}
                    >
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-2 md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Jenis Diskon</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => {
                                        setDiscountType(e.target.value);
                                        setData('discount_type', e.target.value);
                                        setDiscount(0);
                                        setDiscountInput('');
                                        setDiscountPercentage(0);
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 text-sm py-2 px-3"
                                >
                                    <option value="rupiah">Rupiah (Rp)</option>
                                    <option value="percentage">Persentase (%)</option>
                                </select>
                            </div>
                            <div className="col-span-10 md:col-span-4">
                                <Input
                                    type={discountType === 'rupiah' ? 'text' : 'number'}
                                    label={`Diskon ${discountType === 'rupiah' ? '(Rp)' : '(%)'}`}
                                    placeholder={`Silahkan Masukan Nilai  Diskon ${discountType === 'rupiah' ? '(Rp)' : '(%)'}`}
                                    value={discountType === 'rupiah' ? discountInput : (discountPercentage === 0 ? '' : discountPercentage)}
                                    onChange={discountType === 'rupiah' ? handleDiscountChange : handleDiscountPercentageChange}
                                    min={discountType === 'percentage' ? 0 : undefined}
                                    max={discountType === 'percentage' ? 100 : undefined}
                                />
                                {discountType === 'percentage' && discount > 0 && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Nilai Diskon: {formatPrice(discount)}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-12 md:col-span-4">
                                <Input
                                    type="number"
                                    label="Pajak (%)"
                                    placeholder="Silahkan Masukan Pajak (%)"
                                    value={taxPercentage === 0 ? '' : taxPercentage}
                                    onChange={handleTaxPercentageChange}
                                    min={0}
                                    max={100}
                                    step="0.01"
                                />
                                {taxAmount > 0 && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Nilai Pajak: {formatPrice(taxAmount)}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <Input
                                    type={'text'}
                                    label={'Bayar'}
                                    placeholder="Bayar (Rp)"
                                    value={cashInput}
                                    onChange={handleCashChange}
                                />
                            </div>
                            {/* Debugging: Tampilkan grand_total dan change di UI */}
                            <div className="col-span-12 text-sm text-gray-500">
                                <p>Grand Total: {formatPrice(grandTotal)}</p>
                                <p>Kembalian: {formatPrice(change)}</p>
                            </div>
                        </div>
                        <Button
                            type={'submit'}
                            label={'Bayar'}
                            icon={<IconMoneybag size={20} strokeWidth={1.5} />}
                            onClick={storeTransaction}
                            disabled={cash < grandTotal}
                            className={`border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 mt-5 ${cash < grandTotal ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Bayar
                        </Button>
                    </Card>
                </div>
            </div>
        </>
    );
}

Index.layout = page => <DashboardLayout children={page} />;
