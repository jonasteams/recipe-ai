import React, { useState, useMemo } from 'react';
import type { Recipe, Language, CookMode } from '../types';
import { TRANSLATIONS } from '../constants';
import { BackArrowIcon, MinusIcon, PlusIcon, HeartIcon, FilledHeartIcon } from './icons';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  language: Language;
  isFavorite: boolean;
  onToggleFavorite: (recipeName: string) => void;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop';


export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, language, isFavorite, onToggleFavorite }) => {
  const [portions, setPortions] = useState(recipe.servings);
  const [cookMode, setCookMode] = useState<CookMode>('standard');

  const portionMultiplier = useMemo(() => portions / recipe.servings, [portions, recipe.servings]);

  const adjustedIngredients = useMemo(() => {
    return recipe.ingredients.map(ing => ({
      ...ing,
      quantity: parseFloat((ing.quantity * portionMultiplier).toFixed(2)),
    }));
  }, [recipe.ingredients, portionMultiplier]);
  
  const handleFavoriteClick = () => {
    onToggleFavorite(recipe.recipeName);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative">
            <button onClick={onBack} className="absolute top-4 left-4 flex items-center gap-2 z-10 bg-white/70 backdrop-blur-sm py-2 px-4 rounded-full text-gray-800 hover:bg-white font-semibold transition-colors">
                <BackArrowIcon />
                {TRANSLATIONS[language].backButton}
            </button>
            <img
                src={recipe.imageUrl || PLACEHOLDER_IMAGE}
                alt={recipe.recipeName}
                onError={handleImageError}
                className="w-full h-64 sm:h-80 object-cover"
            />
        </div>
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <div className="flex justify-between items-start gap-4">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex-1">{recipe.recipeName}</h1>
              <button
                onClick={handleFavoriteClick}
                className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-colors border hover:bg-gray-100"
                aria-label={isFavorite ? TRANSLATIONS[language].removeFromFavorites : TRANSLATIONS[language].addToFavorites}
              >
                {isFavorite
                  ? <FilledHeartIcon className="w-5 h-5 text-red-500" />
                  : <HeartIcon className="w-5 h-5 text-gray-600" />}
                <span>{isFavorite ? TRANSLATIONS[language].favorites : TRANSLATIONS[language].addToFavorites}</span>
              </button>
          </div>
          <p className="text-gray-600">{recipe.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Ingredients Section */}
          <div className="md:col-span-1 bg-orange-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-orange-800">{TRANSLATIONS[language].ingredients}</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-700">{TRANSLATIONS[language].servings}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPortions(p => Math.max(1, p - 1))} className="p-1 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition"><MinusIcon /></button>
                <span className="w-8 text-center font-bold text-lg">{portions}</span>
                <button onClick={() => setPortions(p => p + 1)} className="p-1 rounded-full bg-orange-200 text-orange-800 hover:bg-orange-300 transition"><PlusIcon /></button>
              </div>
            </div>
            <ul className="space-y-2">
              {adjustedIngredients.map((ing, i) => (
                <li key={i} className="flex justify-between">
                  <span className="flex-1 text-gray-700">{ing.name}</span>
                  <span className="text-gray-900 font-medium">{ing.quantity} {ing.unit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions Section */}
          <div className="md:col-span-2">
            <div className="flex border-b mb-4">
              <button
                onClick={() => setCookMode('standard')}
                className={`py-2 px-4 font-semibold transition-colors ${cookMode === 'standard' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-orange-600'}`}
              >
                {TRANSLATIONS[language].standardCook}
              </button>
              <button
                onClick={() => setCookMode('thermomix')}
                className={`py-2 px-4 font-semibold transition-colors ${cookMode === 'thermomix' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-orange-600'}`}
              >
                {TRANSLATIONS[language].thermomixCook}
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">{TRANSLATIONS[language].instructions}</h2>
              <ol className="space-y-4 list-decimal list-inside text-gray-700 marker:text-orange-600 marker:font-bold">
                {(cookMode === 'standard' ? recipe.standardInstructions : recipe.thermomixInstructions).map((step, i) => (
                  <li key={i} className="pl-2">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};