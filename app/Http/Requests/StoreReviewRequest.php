<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reviewed_user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],

            'rating' => [
                'required',
                'integer',
                'between:1,5',
            ],

            'comment' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'reviewed_user_id.required' =>
                'O utilizador a avaliar é obrigatório.',
            'reviewed_user_id.exists' =>
                'O utilizador seleccionado não existe.',
            'rating.required' =>
                'Seleccione uma classificação.',
            'rating.between' =>
                'A classificação deve estar entre 1 e 5 estrelas.',
            'comment.max' =>
                'O comentário não pode exceder 1000 caracteres.',
        ];
    }
}