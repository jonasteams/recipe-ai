export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  servings: number;
  imageUrl: string;
  ingredients: Ingredient[];
  standardInstructions: string[];
  thermomixInstructions: string[];
}

export type Language = 'en' | 'fr' | 'ar';

export type CookMode = 'standard' | 'thermomix';
