import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { Recipe, Language } from '../types';
import { GEMINI_MODEL } from '../constants';

// Fix: Per coding guidelines, the API key must be obtained from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  required: ['recipeName', 'description', 'servings', 'ingredients', 'standardInstructions', 'thermomixInstructions'],
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
        model: 'gemini-2.5-flash-image', // Image generation model
        contents: {
            parts: [{ text: imagePrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data; // Return the base64 string
        }
    }
    throw new Error(`No image data found in response for prompt: ${imagePrompt}`);
};

export const fetchRecipes = async (prompt: string, language: Language): Promise<Recipe[]> => {
  try {
    // Step 1: Get the text data for all recipes
    const systemInstruction = `You are an expert recipe assistant. Generate recipes in ${language}. Ensure the output strictly follows the provided JSON schema. Do not include markdown formatting like \`\`\`json in your response.`;
    
    const textResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = textResponse.text.trim();
    const parsedData = JSON.parse(jsonText);

    if (!parsedData || !Array.isArray(parsedData.recipes)) {
      console.error("Parsed data is not in the expected format:", parsedData);
      throw new Error("Failed to parse recipes from API response.");
    }
    
    const recipesData: Omit<Recipe, 'imageUrl'>[] = parsedData.recipes;
    
    if (recipesData.length === 0) {
        return [];
    }

    // Step 2: Generate an image for each recipe in parallel
    const imagePromises = recipesData.map(recipe => 
        generateImageForRecipe(recipe).catch(error => {
            console.error(`Failed to generate image for "${recipe.recipeName}":`, error);
            return ''; // Return an empty string on failure, so the UI can use a placeholder
        })
    );

    const base64Images = await Promise.all(imagePromises);

    // Step 3: Combine recipe data with the new, generated images
    const recipesWithImages: Recipe[] = recipesData.map((recipe, index) => ({
        ...recipe,
        imageUrl: base64Images[index] ? `data:image/png;base64,${base64Images[index]}` : '',
    }));

    return recipesWithImages;

  } catch (error) {
    console.error('Error fetching recipes or generating images:', error);
    throw new Error('Could not fetch recipes. Please check your API key and network connection.');
  }
};
