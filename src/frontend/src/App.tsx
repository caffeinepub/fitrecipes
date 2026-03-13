import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dumbbell, LogIn, LogOut, Plus, Search, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Recipe } from "./backend.d";
import { AddRecipeDialog } from "./components/AddRecipeDialog";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetailSheet } from "./components/RecipeDetailSheet";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetRecipes } from "./hooks/useQueries";

const CATEGORIES = [
  "All",
  "High Protein",
  "Low Carb",
  "Keto",
  "Vegan",
  "Bulking",
  "Cutting",
];

const SKELETON_KEYS = ["sk-0", "sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: BigInt(1),
    name: "Grilled Chicken & Quinoa Power Bowl",
    description:
      "High-protein meal prep staple with perfectly seasoned chicken and fluffy quinoa.",
    category: "High Protein",
    calories: BigInt(520),
    protein: BigInt(48),
    carbs: BigInt(42),
    fat: BigInt(12),
    prepTime: BigInt(25),
    isVeg: false,
    imageUrl: "",
    ingredients: [
      "200g chicken breast",
      "80g dry quinoa",
      "1 cup spinach",
      "1/2 avocado",
      "Cherry tomatoes",
      "Lemon juice",
      "Olive oil",
      "Salt & pepper",
    ],
    steps: [
      "Season chicken with salt, pepper, and garlic powder.",
      "Grill chicken 6 min per side until cooked through.",
      "Cook quinoa per package instructions.",
      "Assemble bowl with quinoa base, sliced chicken, spinach, avocado, and tomatoes.",
      "Drizzle with lemon juice and olive oil.",
    ],
  },
  {
    id: BigInt(2),
    name: "Keto Avocado Egg Salad",
    description:
      "Creamy, satisfying low-carb egg salad loaded with healthy fats to keep you full.",
    category: "Keto",
    calories: BigInt(380),
    protein: BigInt(18),
    carbs: BigInt(4),
    fat: BigInt(32),
    prepTime: BigInt(10),
    isVeg: true,
    imageUrl: "",
    ingredients: [
      "3 hard-boiled eggs",
      "1 ripe avocado",
      "1 tbsp Dijon mustard",
      "2 tbsp mayo",
      "Fresh dill",
      "Salt & pepper",
      "Paprika",
    ],
    steps: [
      "Mash avocado in a bowl.",
      "Chop hard-boiled eggs and add to bowl.",
      "Mix in mustard, mayo, and dill.",
      "Season with salt, pepper, and paprika.",
      "Serve on lettuce wraps or cucumber slices.",
    ],
  },
  {
    id: BigInt(3),
    name: "Vegan Lentil Protein Soup",
    description:
      "Warming red lentil soup packed with plant protein and anti-inflammatory spices.",
    category: "Vegan",
    calories: BigInt(340),
    protein: BigInt(22),
    carbs: BigInt(48),
    fat: BigInt(6),
    prepTime: BigInt(30),
    isVeg: true,
    imageUrl: "",
    ingredients: [
      "200g red lentils",
      "1 large onion",
      "3 garlic cloves",
      "1 can diced tomatoes",
      "2 tsp cumin",
      "1 tsp turmeric",
      "1 tsp paprika",
      "Vegetable broth",
      "Fresh cilantro",
    ],
    steps: [
      "Saute onion and garlic in olive oil until golden.",
      "Add spices and cook 1 minute until fragrant.",
      "Add rinsed lentils, tomatoes, and broth.",
      "Simmer 20 minutes until lentils are soft.",
      "Blend half the soup for a creamy texture.",
      "Garnish with cilantro and a squeeze of lemon.",
    ],
  },
  {
    id: BigInt(4),
    name: "Bulking Peanut Butter Oat Pancakes",
    description:
      "Calorie-dense, macro-balanced pancakes perfect for a mass-building breakfast.",
    category: "Bulking",
    calories: BigInt(680),
    protein: BigInt(34),
    carbs: BigInt(72),
    fat: BigInt(26),
    prepTime: BigInt(15),
    isVeg: true,
    imageUrl: "",
    ingredients: [
      "1 cup rolled oats",
      "2 eggs",
      "1 banana",
      "3 tbsp peanut butter",
      "1 scoop whey protein",
      "1/2 cup almond milk",
      "1 tsp baking powder",
      "Honey for topping",
    ],
    steps: [
      "Blend oats into flour consistency.",
      "Mix all ingredients until smooth batter forms.",
      "Heat non-stick pan over medium heat.",
      "Pour 1/4 cup batter per pancake.",
      "Cook 2-3 min per side until golden.",
      "Serve with honey and extra peanut butter.",
    ],
  },
  {
    id: BigInt(5),
    name: "Low Carb Turkey Lettuce Wraps",
    description:
      "Light, crispy lettuce wraps filled with savory ground turkey and fresh toppings.",
    category: "Low Carb",
    calories: BigInt(290),
    protein: BigInt(28),
    carbs: BigInt(8),
    fat: BigInt(16),
    prepTime: BigInt(20),
    isVeg: false,
    imageUrl: "",
    ingredients: [
      "250g ground turkey",
      "Butter lettuce leaves",
      "2 garlic cloves",
      "1 tbsp soy sauce (low sodium)",
      "1 tsp sesame oil",
      "Ginger",
      "Green onions",
      "Shredded carrots",
      "Sriracha",
    ],
    steps: [
      "Brown ground turkey in a pan over medium-high heat.",
      "Add garlic and ginger, cook 1 minute.",
      "Stir in soy sauce and sesame oil.",
      "Separate lettuce leaves into cups.",
      "Fill each leaf with turkey mixture.",
      "Top with carrots, green onions, and sriracha.",
    ],
  },
  {
    id: BigInt(6),
    name: "Cutting Tuna Zucchini Noodles",
    description:
      "Ultra-lean, high-protein pasta alternative that hits macros without the bulk.",
    category: "Cutting",
    calories: BigInt(240),
    protein: BigInt(36),
    carbs: BigInt(10),
    fat: BigInt(6),
    prepTime: BigInt(15),
    isVeg: false,
    imageUrl: "",
    ingredients: [
      "2 medium zucchinis",
      "1 can tuna in water",
      "2 tbsp tomato paste",
      "1 garlic clove",
      "Fresh basil",
      "Lemon zest",
      "Chili flakes",
      "Salt",
    ],
    steps: [
      "Spiralize zucchinis into noodles.",
      "Saute garlic in a pan with olive oil spray.",
      "Add tomato paste and chili flakes, cook 2 min.",
      "Drain tuna and add to pan.",
      "Toss zucchini noodles and cook 2 min max.",
      "Finish with lemon zest and fresh basil.",
    ],
  },
];

const queryClient = new QueryClient();

function AppContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: backendRecipes = [], isLoading } = useGetRecipes();

  const allRecipes = useMemo(() => {
    const backendIds = new Set(backendRecipes.map((r) => r.id));
    const filtered = SAMPLE_RECIPES.filter((r) => !backendIds.has(r.id));
    return [...backendRecipes, ...filtered];
  }, [backendRecipes]);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((recipe) => {
      const matchCategory =
        activeCategory === "All" || recipe.category === activeCategory;
      const matchSearch = recipe.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [allRecipes, activeCategory, search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/fitwise-logo-transparent.png"
              alt="Fitwise Recipes"
              className="h-10 w-auto object-contain mix-blend-multiply dark:mix-blend-screen"
              style={{ background: "transparent" }}
            />
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                data-ocid="header.primary_button"
                onClick={() => setShowAdd(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Recipe</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )}
            {isAuthenticated ? (
              <Button
                data-ocid="header.secondary_button"
                variant="outline"
                onClick={clear}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Button
                data-ocid="header.secondary_button"
                variant="outline"
                onClick={login}
                disabled={isLoggingIn}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isLoggingIn ? "Logging in..." : "Login"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96">
            {/* Background image */}
            <img
              src="/assets/uploads/ChatGPT-Image-Mar-13-2026-03_02_13-AM-2.png"
              alt="Fitness recipes"
              className="w-full h-full object-cover scale-105"
            />

            {/* Strong dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Animated shimmer sweep */}
            <div className="hero-shimmer absolute inset-0 pointer-events-none" />

            {/* Glow orb behind headline */}
            <div className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none hero-pulse" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-14">
              {/* Badge pill */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-3 inline-flex"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/20 text-white border border-primary/40 backdrop-blur-sm">
                  <Zap className="w-3 h-3" />
                  Your Nutrition Hub
                </span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.55 }}
                className="font-display font-800 text-4xl sm:text-5xl md:text-6xl text-white leading-none tracking-tight mb-3"
              >
                Fuel Your
                <br />
                <span className="relative inline-block mt-1">
                  <span className="absolute -inset-x-2 -inset-y-1 rounded-lg bg-primary/15 blur-sm" />
                  <span className="relative text-white hero-text-glow">
                    Performance
                  </span>
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="text-white text-sm sm:text-base font-medium max-w-xs sm:max-w-sm leading-relaxed"
              >
                Track macros. Discover recipes. Hit your goals.
              </motion.p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative mb-5"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="search.input"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground h-11"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-7"
        >
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex flex-wrap gap-1 h-auto bg-card border border-border p-1.5 rounded-xl">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  data-ocid="category.tab"
                  className="text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-muted-foreground px-3 py-1.5"
                >
                  {cat === "High Protein" ? (
                    <>
                      <Zap className="w-3 h-3 mr-1 inline" />
                      {cat}
                    </>
                  ) : (
                    cat
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {isLoading ? (
          <div
            data-ocid="recipe.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-44 rounded-xl bg-card" />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <motion.div
            data-ocid="recipe.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Dumbbell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-700 text-xl text-foreground mb-1">
              No recipes found
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search
                ? `No results for "${search}"`
                : `No ${activeCategory} recipes yet`}
            </p>
            {isAuthenticated && (
              <Button
                onClick={() => setShowAdd(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Plus className="w-4 h-4" /> Add Recipe
              </Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="sync">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard
                  key={String(recipe.id)}
                  recipe={recipe}
                  index={index}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      <RecipeDetailSheet
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isAdmin={isAuthenticated}
      />
      <AddRecipeDialog open={showAdd} onClose={() => setShowAdd(false)} />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
