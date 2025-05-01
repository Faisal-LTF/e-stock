<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // izinkan semua user untuk mengakses request ini
    }

    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'selectedRoles' => ['required', 'array'],
            'email' => ['required', 'email', 'unique:users,email,' . $this->user->id],

        ];

        // Jika sedang membuat user baru (store)
        if ($this->isMethod('post')) {
            $rules['email'] = ['required', 'email', 'unique:users,email'];
            $rules['password'] = ['required', 'string', 'min:6'];
        }

        // Jika sedang update (put/patch)
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['email'] = ['required', 'email', 'unique:users,email,' . $this->user->id];
            $rules['password'] = ['nullable', 'string', 'min:6'];
        }

        return $rules;
    }
}
