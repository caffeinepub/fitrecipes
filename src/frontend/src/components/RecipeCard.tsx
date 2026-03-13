import { Card, CardContent } from "@/components/ui/card";
import { Clock, Flame, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { Recipe } from "../backend.d";

const CATEGORY_COLORS: Record<string, string> = {
  "High Protein": "macro-protein",
  "Low Carb": "macro-carbs",
  Keto: "macro-fat",
  Vegan: "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30",
  Bulking: "bg-yellow-900/60 text-yellow-300 border border-yellow-500/30",
  Cutting: "bg-sky-900/60 text-sky-300 border border-sky-500/30",
  Other: "bg-muted text-muted-foreground",
};

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  onClick: () => void;
}

export function RecipeCard({ recipe, index, onClick }: RecipeCardProps) {
  const categoryClass =
    CATEGORY_COLORS[recipe.category] ?? CATEGORY_COLORS.Other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      data-ocid={`recipe.item.${index + 1}`}
    >
      <Card
        className="cursor-pointer card-glow transition-all duration-200 hover:translate-y-[-2px] bg-card border-border shadow-card overflow-hidden group"
        onClick={onClick}
      >
        <CardContent className="p-0">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-[120px] object-cover rounded-t-xl"
            />
          ) : (
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, oklch(0.82 0.22 130) 0%, oklch(0.75 0.18 50) ${Math.min(100, Number(recipe.calories) / 10)}%, transparent 100%)`,
              }}
            />
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-display font-700 text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {recipe.name}
              </h3>
              <span
                className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${categoryClass}`}
              >
                {recipe.category}
              </span>
            </div>

            {recipe.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                {recipe.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap mb-3">
              <div className="flex items-center gap-1 macro-protein px-2 py-0.5 rounded-full text-xs font-semibold">
                <Zap className="w-3 h-3" />
                <span>{Number(recipe.protein)}g P</span>
              </div>
              <div className="flex items-center gap-1 macro-carbs px-2 py-0.5 rounded-full text-xs font-semibold">
                <span>{Number(recipe.carbs)}g C</span>
              </div>
              <div className="flex items-center gap-1 macro-fat px-2 py-0.5 rounded-full text-xs font-semibold">
                <span>{Number(recipe.fat)}g F</span>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  recipe.isVeg
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30"
                    : "bg-red-900/60 text-red-300 border border-red-500/30"
                }`}
              >
                <span>{recipe.isVeg ? "🥦" : "🍗"}</span>
                <span>{recipe.isVeg ? "Veg" : "Non-Veg"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span className="font-semibold text-foreground">
                  {Number(recipe.calories)}
                </span>
                <span>kcal</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{Number(recipe.prepTime)} min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
