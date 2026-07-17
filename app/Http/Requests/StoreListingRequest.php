<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'required',
                'string',
            ],

            'price' => [
                'nullable',
                'required_if:transaction_type,sale',
                'numeric',
                'min:0',
            ],

            'transaction_type' => [
                'required',
                'in:sale,exchange',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Seleccione uma categoria.',
            'category_id.exists' => 'A categoria seleccionada não existe.',
            'title.required' => 'Informe o título do anúncio.',
            'title.max' => 'O título não pode exceder 255 caracteres.',
            'description.required' => 'Informe a descrição do material.',
            'price.required_if' => 'Informe o preço do material.',
            'price.numeric' => 'O preço deve ser um número válido.',
            'price.min' => 'O preço não pode ser negativo.',
            'transaction_type.required' =>
                'Seleccione o tipo de transacção.',
            'transaction_type.in' =>
                'O tipo de transacção seleccionado é inválido.',
        ];
    }
}