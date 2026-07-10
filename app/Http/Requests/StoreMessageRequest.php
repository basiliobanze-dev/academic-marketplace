<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
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
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_id.required' => 'Receiver is required.',
            'receiver_id.exists' => 'Selected receiver does not exist.',

            'message.required' => 'Message is required.',
            'message.max' => 'Message cannot exceed 1000 characters.',
        ];
    }
}
