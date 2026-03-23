<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRestaurantRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'cuisine_type' => 'required|string|max:100',
            'price_range' => 'required|string|in:$,$$,$$$,$$$$',
            'dietary_options' => 'nullable|array',
            'dietary_options.*' => 'string|max:50',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
            'phone' => 'nullable|string|max:20|regex:/^[+]?[\d\s\-()]+$/',
            'website' => 'nullable|url|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:2048',
            'images' => 'nullable|array|max:5',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:2048',
            'average_price' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Le nom du restaurant est obligatoire.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'address.required' => 'L\'adresse est obligatoire.',
            'cuisine_type.required' => 'Le type de cuisine est obligatoire.',
            'price_range.in' => 'La gamme de prix doit être $, $$, $$$ ou $$$$.',
            'opening_time.date_format' => 'L\'heure d\'ouverture doit être au format HH:MM.',
            'closing_time.date_format' => 'L\'heure de fermeture doit être au format HH:MM.',
            'website.url' => 'L\'URL du site web doit être valide.',
            'image.image' => 'L\'image doit être un fichier image.',
            'image.max' => 'L\'image ne peut pas dépasser 2MB.',
        ];
    }
}
