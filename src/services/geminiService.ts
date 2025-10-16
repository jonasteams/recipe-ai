import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { Recipe, Language } from '../types';
import { GEMINI_MODEL } from '../constants';

// ✅ Fix 1: Use import.meta.env for Vite environment variables
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

// Schema for the recipe data (text only)
const recipeDataSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING, description: 'The name of the recipe.' },
    description: { type: Type.STRING, description: 'A short, appealing description of the dish.' },
    servings: { type: Type.INTEGER, description: 'The default number of people this recipe serves.' },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: { type: Type.STRING, description: 'e.g., grams, ml, tsp, cup' },
        },
        required: ['name', 'quantity', 'unit'],
      },
    },
    standardInstructions: {
      type: Type.ARRAY,
      description: 'Step-by-step cooking instructions for a standard kitchen.',
      items: { type: Type.STRING },
    },
    thermomixInstructions: {
      type: Type.ARRAY,
      description: 'Step-by-step cooking instructions specifically for a Thermomix machine.',
      items: { type: Type.STRING },
    },
  },
  required: [
    'recipeName',
    'description',
    'servings',
    'ingredients',
    'standardInstructions',
    'thermomixInstructions',
  ],
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: recipeDataSchema,
    },
  },
};

// Helper function to generate a single image for a recipe
const generateImageForRecipe = async (recipe: Omit<Recipe, 'imageUrl'>): Promise<string> => {
  const imagePrompt = `A professional, vibrant, high-quality photograph of ${recipe.recipeName}. ${recipe.description}. Food photography, delicious, appetizing, centered, well-lit.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: imagePrompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // ✅ Fix 2: Safe check for response.candidates
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData) {
        return part.inlineData.data; // Return base64 image
      }
    }
  }

  throw new Error(`No image data found in response for prompt: ${imagePrompt}`);
};

export const fetchRecipes = async (prompt: string, language: Language): Promise<Recipe[]> => {
  try {
    const systemInstruction = `You are an expert recipe assistant. Generate recipes in ${language}. Ensure the output strictly follows the provided JSON schema. Do not include markdown formatting like \`\`\`json in your response.`;

    const textResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = textResponse.text?.trim() || '';
    const parsedData = JSON.parse(jsonText);

    if (!parsedData || !Array.isArray(parsedData.recipes)) {
      console.error('Parsed data is not in the expected format:', parsedData);
      throw new Error('Failed to parse recipes from API response.');
    }

    const recipesData: Omit<Recipe, 'imageUrl'>[] = parsedData.recipes;
    if (recipesData.length === 0) return [];

    // Generate images for each recipe
    const imagePromises = recipesData.map((recipe) =>
      generateImageForRecipe(recipe).catch((error) => {
        console.error(`Failed to generate image for "${recipe.recipeName}":`, error);
        return '';
      }),
    );

    const base64Images = await Promise.all(imagePromises);

    return recipesData.map((recipe, index) => ({
      ...recipe,
      imageUrl: base64Images[index] ? `data:image/png;base64,${base64Images[index]}` : '',
    }));
  } catch (error) {
    console.error('Error fetching recipes or generating images:', error);
    throw new Error('Could not fetch recipes. Please check your API key and network connection.');
  }
};
