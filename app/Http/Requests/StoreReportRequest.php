<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
                'exists:listings,id'
            ],

            'reported_user_id' => [
                'nullable',
                'exists:users,id',
                'different:' . $this->user()->id,
            ],

            'reason' => [
                'required',
                'string',
                'max:1000'
            ]

        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {

            if (!$this->listing_id && !$this->reported_user_id) {

                $validator->errors()->add(
                    'target',
                    'You must report either a listing or a user.'
                );

            }

            if ($this->listing_id && $this->reported_user_id) {

                $validator->errors()->add(
                    'target',
                    'You can report only one target at a time.'
                );

            }

        });
    }

    public function messages(): array
    {
        return [

            'listing_id.exists' => 'Listing not found.',

            'reported_user_id.exists' => 'User not found.',

            'reported_user_id.different' => 'You cannot report yourself.',

            'reason.required' => 'Reason is required.',

            'reason.max' => 'Reason cannot exceed 1000 characters.'

        ];
    }
}
