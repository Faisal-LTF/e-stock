<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ganti jika pakai policy/authorization
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:roles,name,' . $this->id,
            'selectedPermission' => 'required|array|min:1',
            'selectedPermission.*' => 'exists:permissions,id',
        ];
    }
}
