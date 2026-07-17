<?php

namespace App\Http\Requests;

use App\Models\Listing;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'listing_id' => [
                'nullable',
                'integer',
                'exists:listings,id',
            ],

            'reported_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'reason' => [
                'required',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (!$this->listing_id && !$this->reported_user_id) {
                $validator->errors()->add(
                    'target',
                    'Deve denunciar um anúncio ou um utilizador.'
                );
            }

            if ($this->listing_id && $this->reported_user_id) {
                $validator->errors()->add(
                    'target',
                    'Só pode denunciar um alvo de cada vez.'
                );
            }

            if (
                $this->reported_user_id &&
                (int) $this->reported_user_id === (int) $this->user()->id
            ) {
                $validator->errors()->add(
                    'reported_user_id',
                    'Não pode denunciar a si próprio.'
                );
            }

            if ($this->listing_id) {
                $listing = Listing::find($this->listing_id);

                if (
                    $listing &&
                    (int) $listing->user_id === (int) $this->user()->id
                ) {
                    $validator->errors()->add(
                        'listing_id',
                        'Não pode denunciar o seu próprio anúncio.'
                    );
                }
            }
        });
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'listing_id.integer' => 'O anúncio seleccionado é inválido.',
            'listing_id.exists' => 'O anúncio não foi encontrado.',

            'reported_user_id.integer' => 'O utilizador seleccionado é inválido.',
            'reported_user_id.exists' => 'O utilizador não foi encontrado.',

            'reason.required' => 'Indique o motivo da denúncia.',
            'reason.string' => 'O motivo deve ser um texto.',
            'reason.max' => 'O motivo não pode exceder 1000 caracteres.',
        ];
    }
}