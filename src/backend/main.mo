import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

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
    public func compare(r1 : Recipe, r2 : Recipe) : Order.Order {
      Nat.compare(r1.id, r2.id);
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
  var nextIdStable : Nat = 0;
  var nextId : Nat = 0;
  var initialized : Bool = false;

  // Owner management
  var owner : ?Principal = null;

  // Compute a safe next ID by scanning all existing recipes
  func computeNextId() : Nat {
    var maxId : Nat = nextIdStable;
    for ((id, _) in recipesV2.entries()) {
      if (id + 1 > maxId) {
        maxId := id + 1;
      };
    };
    maxId;
  };

  func ensureInit() {
    if (not initialized) {
      nextId := computeNextId();
      initialized := true;
    };
  };

  func upsertRecipe(id : Nat, recipe : Recipe) {
    switch (recipesV2.get(id)) {
      case (?_) { recipesV2.remove(id) };
      case (null) {};
    };
    recipesV2.add(id, recipe);
  };

  system func postupgrade() {
    // Migrate any legacy RecipeV1 entries to Recipe
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
      upsertRecipe(id, migrated);
    };
    recipes := Map.empty<Nat, RecipeV1>();
    seedRecipes := [];
    seededRecipes := Map.empty<Nat, RecipeV1>();
    nextId := computeNextId();
    initialized := true;
  };

  system func preupgrade() {
    nextIdStable := nextId;
  };

  // Owner functions
  public shared(msg) func claimOwner() : async Bool {
    switch (owner) {
      case (?_) { false }; // already claimed
      case (null) {
        owner := ?msg.caller;
        true;
      };
    };
  };

  public query func getOwner() : async ?Principal {
    owner;
  };

  public query func isOwner(p : Principal) : async Bool {
    switch (owner) {
      case (?o) { Principal.equal(o, p) };
      case (null) { false };
    };
  };

  public query func getRecipes() : async [Recipe] {
    let arr = recipesV2.values().toArray();
    arr.sort();
  };

  public query func getRecipe(id : Nat) : async ?Recipe {
    recipesV2.get(id);
  };

  public shared(msg) func createRecipe(recipe : CreateRecipeRequest) : async Recipe {
    switch (owner) {
      case (?o) {
        if (not Principal.equal(msg.caller, o)) {
          Runtime.trap("Unauthorized: only the owner can create recipes");
        };
      };
      case (null) {
        Runtime.trap("No owner set");
      };
    };
    ensureInit();
    let id = nextId;
    nextId += 1;
    nextIdStable := nextId;
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
    upsertRecipe(id, newRecipe);
    newRecipe;
  };

  public shared(msg) func updateRecipe(id : Nat, recipe : CreateRecipeRequest) : async Recipe {
    switch (owner) {
      case (?o) {
        if (not Principal.equal(msg.caller, o)) {
          Runtime.trap("Unauthorized: only the owner can update recipes");
        };
      };
      case (null) {
        Runtime.trap("No owner set");
      };
    };
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
        upsertRecipe(id, updated);
        updated;
      };
    };
  };

  public shared(msg) func deleteRecipe(id : Nat) : async Bool {
    switch (owner) {
      case (?o) {
        if (not Principal.equal(msg.caller, o)) {
          Runtime.trap("Unauthorized: only the owner can delete recipes");
        };
      };
      case (null) {
        Runtime.trap("No owner set");
      };
    };
    switch (recipesV2.get(id)) {
      case (null) { Runtime.trap("Recipe does not exist") };
      case (?_) {
        recipesV2.remove(id);
        true;
      };
    };
  };
};
