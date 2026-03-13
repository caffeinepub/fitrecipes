import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Recipe } from "../backend.d";
import { useUpdateRecipe } from "../hooks/useQueries";

const CATEGORIES = [
  "High Protein",
  "Low Carb",
  "Keto",
  "Vegan",
  "Bulking",
  "Cutting",
  "Other",
];

interface ListItem {
  id: string;
  value: string;
}

let idCounter = 0;
const newId = () => `item-${++idCounter}`;

function toListItems(arr: string[]): ListItem[] {
  if (arr.length === 0) return [{ id: newId(), value: "" }];
  return arr.map((v) => ({ id: newId(), value: v }));
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 600;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          }
        } else {
          if (height > MAX) {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface EditRecipeDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
}

export function EditRecipeDialog({
  recipe,
  open,
  onClose,
}: EditRecipeDialogProps) {
  const updateMutation = useUpdateRecipe();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    prepTime: "",
    isVeg: true,
    imageUrl: "",
    ingredients: [{ id: newId(), value: "" }] as ListItem[],
    steps: [{ id: newId(), value: "" }] as ListItem[],
  });

  useEffect(() => {
    if (recipe && open) {
      setForm({
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        calories: String(Number(recipe.calories)),
        protein: String(Number(recipe.protein)),
        carbs: String(Number(recipe.carbs)),
        fat: String(Number(recipe.fat)),
        prepTime: String(Number(recipe.prepTime)),
        isVeg: recipe.isVeg,
        imageUrl: recipe.imageUrl,
        ingredients: toListItems(recipe.ingredients),
        steps: toListItems(recipe.steps),
      });
    }
  }, [recipe, open]);

  const handleField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, imageUrl: compressed }));
    } catch {
      toast.error("Failed to process image.");
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateListItem = (
    field: "ingredients" | "steps",
    id: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item) =>
        item.id === id ? { ...item, value } : item,
      ),
    }));
  };

  const addListItem = (field: "ingredients" | "steps") => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], { id: newId(), value: "" }],
    }));
  };

  const removeListItem = (field: "ingredients" | "steps", id: string) => {
    setForm((prev) => {
      const list = prev[field].filter((item) => item.id !== id);
      return {
        ...prev,
        [field]: list.length > 0 ? list : [{ id: newId(), value: "" }],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe) return;
    if (!form.name.trim() || !form.category) {
      toast.error("Name and category are required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: recipe.id,
        recipe: {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          calories: BigInt(Number(form.calories) || 0),
          protein: BigInt(Number(form.protein) || 0),
          carbs: BigInt(Number(form.carbs) || 0),
          fat: BigInt(Number(form.fat) || 0),
          prepTime: BigInt(Number(form.prepTime) || 0),
          isVeg: form.isVeg,
          imageUrl: form.imageUrl,
          ingredients: form.ingredients
            .map((i) => i.value)
            .filter((v) => v.trim()),
          steps: form.steps.map((s) => s.value).filter((v) => v.trim()),
        },
      });
      toast.success("Recipe updated!");
      onClose();
    } catch {
      toast.error("Failed to update recipe");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="edit_recipe.dialog"
        className="sm:max-w-lg bg-card border-border p-0 gap-0 max-h-[90vh]"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-display font-700 text-xl text-foreground">
            Edit Recipe
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
          <form
            id="edit-recipe-form"
            onSubmit={handleSubmit}
            className="px-6 py-5 space-y-5"
          >
            {/* Image */}
            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-sm">
                Recipe Image
              </Label>
              {form.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-ocid="edit_recipe.upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer bg-background"
                >
                  <ImagePlus className="w-7 h-7" />
                  <span className="text-sm font-medium">Upload food image</span>
                  <span className="text-xs">PNG, JPG, WebP supported</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-sm">
                Recipe Name <span className="text-destructive">*</span>
              </Label>
              <Input
                data-ocid="edit_recipe.name.input"
                placeholder="e.g. High-Protein Chicken Bowl"
                value={form.name}
                onChange={(e) => handleField("name", e.target.value)}
                className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-sm">
                Description
              </Label>
              <Textarea
                placeholder="Brief description..."
                value={form.description}
                onChange={(e) => handleField("description", e.target.value)}
                className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-sm">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => handleField("category", v)}
              >
                <SelectTrigger
                  data-ocid="edit_recipe.category.select"
                  className="bg-background border-input text-foreground"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="text-popover-foreground"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-sm">
                Type
              </Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  data-ocid="edit_recipe.veg.toggle"
                  onClick={() => handleField("isVeg", true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    form.isVeg
                      ? "border-emerald-500 bg-emerald-900/40 text-emerald-300"
                      : "border-border bg-background text-muted-foreground hover:border-emerald-500/50"
                  }`}
                >
                  <span>🥦</span> Veg
                </button>
                <button
                  type="button"
                  data-ocid="edit_recipe.nonveg.toggle"
                  onClick={() => handleField("isVeg", false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    !form.isVeg
                      ? "border-red-500 bg-red-900/40 text-red-300"
                      : "border-border bg-background text-muted-foreground hover:border-red-500/50"
                  }`}
                >
                  <span>🍗</span> Non-Veg
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground font-semibold text-sm">
                  Calories (kcal)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="450"
                  value={form.calories}
                  onChange={(e) => handleField("calories", e.target.value)}
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground font-semibold text-sm">
                  Prep Time (min)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="20"
                  value={form.prepTime}
                  onChange={(e) => handleField("prepTime", e.target.value)}
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground font-semibold text-sm">
                  Protein (g)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="40"
                  value={form.protein}
                  onChange={(e) => handleField("protein", e.target.value)}
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground font-semibold text-sm">
                  Carbs (g)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="30"
                  value={form.carbs}
                  onChange={(e) => handleField("carbs", e.target.value)}
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-foreground font-semibold text-sm">
                  Fat (g)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="12"
                  value={form.fat}
                  onChange={(e) => handleField("fat", e.target.value)}
                  className="bg-background border-input text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-semibold text-sm">
                Ingredients
              </Label>
              {form.ingredients.map((item, i) => (
                <div key={item.id} className="flex gap-2">
                  <Input
                    placeholder={`Ingredient ${i + 1}`}
                    value={item.value}
                    onChange={(e) =>
                      updateListItem("ingredients", item.id, e.target.value)
                    }
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("ingredients", item.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem("ingredients")}
                className="border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary w-full"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Ingredient
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-semibold text-sm">
                Steps
              </Label>
              {form.steps.map((item, i) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mt-2">
                    {i + 1}
                  </span>
                  <Textarea
                    placeholder={`Step ${i + 1}...`}
                    value={item.value}
                    onChange={(e) =>
                      updateListItem("steps", item.id, e.target.value)
                    }
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground resize-none"
                    rows={2}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListItem("steps", item.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive mt-2"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem("steps")}
                className="border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary w-full"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Step
              </Button>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border flex gap-2">
          <Button
            data-ocid="edit_recipe.cancel_button"
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border text-foreground hover:bg-secondary"
          >
            Cancel
          </Button>
          <Button
            data-ocid="edit_recipe.submit_button"
            type="submit"
            form="edit-recipe-form"
            disabled={updateMutation.isPending}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
