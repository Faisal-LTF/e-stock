// FlashMessage.jsx
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { usePage } from '@inertiajs/react';

export default function FlashMessage() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            Swal.fire({
                title: 'Success!',
                text: flash.success,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });
        }

        if (flash.error) {
            Swal.fire({
                title: 'Error!',
                text: flash.error,
                icon: 'error',
                showConfirmButton: true,
            });
        }
    }, [flash]);

    return null;
}
