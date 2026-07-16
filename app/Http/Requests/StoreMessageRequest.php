<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => [
                'required',
                'integer',
                'exists:users,id',
                'different:sender_id',
            ],

            'message' => [
                'required',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_id.required' => 'O destinatário é obrigatório.',
            'receiver_id.exists' => 'O destinatário seleccionado não existe.',
            'message.required' => 'Escreva uma mensagem.',
            'message.max' => 'A mensagem não pode exceder 2000 caracteres.',
        ];
    }
}