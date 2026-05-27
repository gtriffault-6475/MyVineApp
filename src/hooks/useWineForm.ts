import { useState } from 'react';
import type { WineForm } from '../types/wine';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const EMPTY_FORM: WineForm = {
  name: '',
  producer: '',
  appellation: '',
  vintage: '',
  score: null,
  location_type: 'home',
  restaurant_name: '',
  drunk_at: today(),
  food_pairing: '',
  photo_uri: null,
  comment: '',
  companion: '',
  buy_again: false,
};

interface FormErrors {
  name?: string;
  vintage?: string;
  drunk_at?: string;
}

export function useWineForm(initial: WineForm = EMPTY_FORM) {
  const [form, setForm] = useState<WineForm>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof WineForm>(key: K, value: WineForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Le nom du vin est obligatoire';
    }

    if (form.vintage) {
      const v = parseInt(form.vintage, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(v) || v < 1800 || v > currentYear) {
        newErrors.vintage = `Millésime invalide (1800–${currentYear})`;
      }
    }

    if (!form.drunk_at || !/^\d{4}-\d{2}-\d{2}$/.test(form.drunk_at)) {
      newErrors.drunk_at = 'Date invalide (format AAAA-MM-JJ)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function reset() {
    setForm(EMPTY_FORM);
    setErrors({});
  }

  return { form, errors, update, validate, reset };
}
