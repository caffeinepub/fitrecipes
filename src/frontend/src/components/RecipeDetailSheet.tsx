import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChefHat, Clock, Flame, Pencil, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Recipe } from "../backend.d";
import { useDeleteRecipe } from "../hooks/useQueries";
import { EditRecipeDialog } from "./EditRecipeDialog";

const CATEGORY_COLORS: Record<string, string> = {
  "High Protein": "macro-protein",
  "Low Carb": "macro-carbs",
  Keto: "macro-fat",
  Vegan: "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30",
  Bulking: "bg-yellow-900/60 text-yellow-300 border border-yellow-500/30",
  Cutting: "bg-sky-900/60 text-sky-300 border border-sky-500/30",
  Other: "bg-muted text-muted-foreground",
};

interface RecipeDetailSheetProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  isBackendRecipe?: boolean;
}

export function RecipeDetailSheet({
  recipe,
  open,
  onClose,
  isAdmin = false,
  isBackendRecipe = false,
}: RecipeDetailSheetProps) {
  const deleteMutation = useDeleteRecipe();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (!recipe) return;
    if (!isBackendRecipe) {
      toast.info(
        "Sample recipes cannot be deleted. Only recipes you added can be deleted.",
      );
      return;
    }
    try {
      await deleteMutation.mutateAsync(recipe.id);
      toast.success("Recipe deleted");
      onClose();
    } catch {
      toast.error("Failed to delete recipe");
    }
  };

  const handleEdit = () => {
    if (!isBackendRecipe) {
      toast.info(
        "Sample recipes cannot be edited. Only recipes you added can be edited.",
      );
      return;
    }
    setShowEdit(true);
  };

  if (!recipe) return null;

  const categoryClass =
    CATEGORY_COLORS[recipe.category] ?? CATEGORY_COLORS.Other;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          data-ocid="recipe.detail.sheet"
          side="right"
          className="w-full sm:max-w-lg p-0 bg-card border-border"
        >
          <ScrollArea className="h-full">
            <div className="p-6">
              {recipe.imageUrl && (
                <div className="mb-5 -mx-6 -mt-6">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-52 object-cover"
                  />
                </div>
              )}

              <SheetHeader className="mb-6 text-left">
                <div className="flex items-start justify-between gap-3">
                  <SheetTitle className="font-display text-2xl font-800 text-foreground leading-tight">
                    {recipe.name}
                  </SheetTitle>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryClass}`}
                  >
                    {recipe.category}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {Number(recipe.prepTime)} min
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      recipe.isVeg
                        ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30"
                        : "bg-red-900/60 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {recipe.isVeg ? "🥦 Veg" : "🍗 Non-Veg"}
                  </span>
                </div>
              </SheetHeader>

              {recipe.description && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {recipe.description}
                </p>
              )}

              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="flex flex-col items-center bg-background rounded-lg p-3 border border-border">
                  <Flame className="w-4 h-4 text-accent mb-1" />
                  <span className="font-display font-700 text-lg text-foreground">
                    {Number(recipe.calories)}
                  </span>
                  <span className="text-muted-foreground text-xs">kcal</span>
                </div>
                <div className="flex flex-col items-center bg-background rounded-lg p-3 border border-border macro-protein">
                  <Zap className="w-4 h-4 mb-1" />
                  <span className="font-display font-700 text-lg">
                    {Number(recipe.protein)}g
                  </span>
                  <span className="text-xs opacity-70">protein</span>
                </div>
                <div className="flex flex-col items-center bg-background rounded-lg p-3 border border-border macro-carbs">
                  <span className="text-sm mb-1">🌾</span>
                  <span className="font-display font-700 text-lg">
                    {Number(recipe.carbs)}g
                  </span>
                  <span className="text-xs opacity-70">carbs</span>
                </div>
                <div className="flex flex-col items-center bg-background rounded-lg p-3 border border-border macro-fat">
                  <span className="text-sm mb-1">🥑</span>
                  <span className="font-display font-700 text-lg">
                    {Number(recipe.fat)}g
                  </span>
                  <span className="text-xs opacity-70">fat</span>
                </div>
              </div>

              <Separator className="mb-6" />

              {recipe.ingredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-700 text-foreground mb-3 flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-primary" />
                    Ingredients
                  </h3>
                  <ul className="space-y-1.5">
                    {recipe.ingredients.map((ingredient) => (
                      <li
                        key={ingredient}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.steps.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-700 text-foreground mb-3 flex items-center gap-2">
                    <span className="text-primary">📋</span>
                    Instructions
                  </h3>
                  <ol className="space-y-3">
                    {recipe.steps.map((step, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: steps are ordered
                      <li key={`step-${i}`} className="flex gap-3 text-sm">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-display">
                          {i + 1}
                        </span>
                        <p className="text-foreground leading-relaxed pt-0.5">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {isAdmin && (
                <>
                  <Separator className="mb-4" />
                  <div className="flex gap-3">
                    <Button
                      data-ocid="recipe.detail.edit_button"
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary/10"
                      onClick={handleEdit}
                      disabled={!isBackendRecipe}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Recipe
                    </Button>
                    <Button
                      data-ocid="recipe.detail.delete_button"
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending || !isBackendRecipe}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deleteMutation.isPending
                        ? "Deleting..."
                        : "Delete Recipe"}
                    </Button>
                  </div>
                  {!isBackendRecipe && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Sample recipes cannot be edited or deleted
                    </p>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <EditRecipeDialog
        recipe={recipe}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </>
  );
}
