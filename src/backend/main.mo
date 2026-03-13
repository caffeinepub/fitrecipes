import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type RecipeV1 = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    calories : Int;
    protein : Int;
    carbs : Int;
    fat : Int;
    prepTime : Int;
    quantityGrams : Int;
    imageUrl : Text;
    ingredients : [Text];
    steps : [Text];
  };

  type Recipe = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    calories : Int;
    protein : Int;
    carbs : Int;
    fat : Int;
    prepTime : Int;
    isVeg : Bool;
    imageUrl : Text;
    ingredients : [Text];
    steps : [Text];
  };

  module Recipe {
    public func compare(recipe1 : Recipe, recipe2 : Recipe) : Order.Order {
      Nat.compare(recipe1.id, recipe2.id);
    };
  };

  type CreateRecipeRequest = {
    name : Text;
    description : Text;
    category : Text;
    calories : Int;
    protein : Int;
    carbs : Int;
    fat : Int;
    prepTime : Int;
    isVeg : Bool;
    imageUrl : Text;
    ingredients : [Text];
    steps : [Text];
  };

  // Legacy stable vars preserved for data migration
  var recipes = Map.empty<Nat, RecipeV1>();
  var seedRecipes : [(Nat, RecipeV1)] = [];
  var seededRecipes = Map.empty<Nat, RecipeV1>();

  // Current stable storage
  var recipesV2 = Map.empty<Nat, Recipe>();
  var nextIdStable : Nat = 9;

  var nextId : Nat = 9;

  // Compute a safe next ID by scanning existing recipes
  func computeNextId() : Nat {
    var maxId : Nat = nextIdStable;
    for ((id, _) in recipesV2.entries()) {
      if (id >= maxId) {
        maxId := id + 1;
      };
    };
    maxId;
  };

  system func postupgrade() {
    for ((id, r) in recipes.entries()) {
      let migrated : Recipe = {
        id = r.id;
        name = r.name;
        description = r.description;
        category = r.category;
        calories = r.calories;
        protein = r.protein;
        carbs = r.carbs;
        fat = r.fat;
        prepTime = r.prepTime;
        isVeg = true;
        imageUrl = r.imageUrl;
        ingredients = r.ingredients;
        steps = r.steps;
      };
      recipesV2.add(id, migrated);
    };
    recipes := Map.empty<Nat, RecipeV1>();
    seedRecipes := [];
    seededRecipes := Map.empty<Nat, RecipeV1>();
    nextId := computeNextId();
  };

  system func preupgrade() {
    nextIdStable := nextId;
  };

  public query func getRecipes() : async [Recipe] {
    recipesV2.values().toArray().sort();
  };

  public query func getRecipe(id : Nat) : async ?Recipe {
    recipesV2.get(id);
  };

  public shared func createRecipe(recipe : CreateRecipeRequest) : async Recipe {
    let id = nextId;
    nextId += 1;
    let newRecipe : Recipe = {
      id = id;
      name = recipe.name;
      description = recipe.description;
      category = recipe.category;
      calories = recipe.calories;
      protein = recipe.protein;
      carbs = recipe.carbs;
      fat = recipe.fat;
      prepTime = recipe.prepTime;
      isVeg = recipe.isVeg;
      imageUrl = recipe.imageUrl;
      ingredients = recipe.ingredients;
      steps = recipe.steps;
    };
    recipesV2.add(id, newRecipe);
    newRecipe;
  };

  public shared func updateRecipe(id : Nat, recipe : CreateRecipeRequest) : async Recipe {
    switch (recipesV2.get(id)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?existing) {
        let updated : Recipe = {
          id = existing.id;
          name = recipe.name;
          description = recipe.description;
          category = recipe.category;
          calories = recipe.calories;
          protein = recipe.protein;
          carbs = recipe.carbs;
          fat = recipe.fat;
          prepTime = recipe.prepTime;
          isVeg = recipe.isVeg;
          imageUrl = recipe.imageUrl;
          ingredients = recipe.ingredients;
          steps = recipe.steps;
        };
        recipesV2.add(id, updated);
        updated;
      };
    };
  };

  public shared func deleteRecipe(id : Nat) : async Bool {
    switch (recipesV2.get(id)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?_) {
        recipesV2.remove(id);
        true;
      };
    };
  };
};
