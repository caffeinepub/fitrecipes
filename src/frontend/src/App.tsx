import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Dumbbell,
  LogIn,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Recipe } from "./backend.d";
import { AddRecipeDialog } from "./components/AddRecipeDialog";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetailSheet } from "./components/RecipeDetailSheet";
import { useActor } from "./hooks/useActor";
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

const queryClient = new QueryClient();

function AppContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [ownerPrincipal, setOwnerPrincipal] = useState<
    string | null | undefined
  >(undefined);
  const [isOwnerChecked, setIsOwnerChecked] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { identity, login, clear, isLoggingIn, loginStatus } =
    useInternetIdentity();
  const { actor } = useActor();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: backendRecipes = [], isLoading } = useGetRecipes();

  // Load owner principal on startup
  useEffect(() => {
    if (!actor) return;
    actor
      .getOwner()
      .then((o) => {
        setOwnerPrincipal(o ? o.toString() : null);
      })
      .catch(() => {
        setOwnerPrincipal(null);
      });
  }, [actor]);

  // After login, verify caller is the owner
  useEffect(() => {
    if (!isAuthenticated || !actor || ownerPrincipal === undefined) return;
    if (isOwnerChecked) return;

    const callerPrincipal = identity!.getPrincipal().toString();

    if (ownerPrincipal === null) {
      setIsOwnerChecked(true);
      return;
    }

    if (callerPrincipal !== ownerPrincipal) {
      toast.error("Access denied. Only the app owner can log in.");
      clear();
    }
    setIsOwnerChecked(true);
  }, [isAuthenticated, actor, ownerPrincipal, identity, clear, isOwnerChecked]);

  // Reset check flag when logged out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsOwnerChecked(false);
    }
  }, [isAuthenticated]);

  // Hide login button after 10 seconds
  useEffect(() => {
    if (!showLoginButton || isAuthenticated) return;
    const timer = setTimeout(() => setShowLoginButton(false), 10000);
    return () => clearTimeout(timer);
  }, [showLoginButton, isAuthenticated]);

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      setShowLoginButton(true);
    } else {
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0;
      }, 2000);
    }
  };

  const handleClaimOwner = async () => {
    if (!actor || !isAuthenticated) return;
    try {
      const success = await actor.claimOwner();
      if (success) {
        const principal = identity!.getPrincipal().toString();
        setOwnerPrincipal(principal);
        toast.success("You are now the app owner! Only you can log in.");
      } else {
        toast.error("Owner is already claimed.");
      }
    } catch {
      toast.error("Failed to claim ownership.");
    }
  };

  const filteredRecipes = useMemo(() => {
    return backendRecipes.filter((recipe) => {
      const matchCategory =
        activeCategory === "All" || recipe.category === activeCategory;
      const matchSearch = recipe.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [backendRecipes, activeCategory, search]);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const showClaimBanner = isAuthenticated && ownerPrincipal === null;

  // Login button visible only when: no owner set yet, OR secret logo tap triggered
  const showLoginBtn =
    !isAuthenticated && (showLoginButton || ownerPrincipal === null);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Clicking the logo 5 times reveals the hidden login button */}
            <button
              type="button"
              onClick={handleLogoClick}
              className="focus:outline-none bg-transparent border-0 p-0"
              aria-label="App logo"
            >
              <img
                src="/assets/generated/fitwise-logo-transparent.png"
                alt="Fitwise Recipes"
                className="h-10 w-auto object-contain mix-blend-multiply dark:mix-blend-screen cursor-pointer select-none"
                style={{ background: "transparent" }}
              />
            </button>
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
            ) : showLoginBtn ? (
              <Button
                data-ocid="header.secondary_button"
                variant="outline"
                onClick={login}
                disabled={isLoggingIn || loginStatus === "logging-in"}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isLoggingIn ? "Logging in..." : "Login"}
                </span>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Claim owner banner */}
      {showClaimBanner && (
        <div className="bg-amber-900/30 border-b border-amber-700/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-300 text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                No owner is set yet. Click to claim ownership so only you can
                log in.
              </span>
            </div>
            <Button
              data-ocid="claim_owner.button"
              size="sm"
              onClick={handleClaimOwner}
              className="bg-amber-600 hover:bg-amber-500 text-white shrink-0"
            >
              Claim Ownership
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96">
            <img
              src="/assets/uploads/ChatGPT-Image-Mar-13-2026-03_02_13-AM-2.png"
              alt="Fitness recipes"
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="hero-shimmer absolute inset-0 pointer-events-none" />
            <div className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none hero-pulse" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-14">
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
                  onClick={() => handleSelectRecipe(recipe)}
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
        isBackendRecipe={true}
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
