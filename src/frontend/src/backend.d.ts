import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CreateRecipeRequest {
    fat: bigint;
    carbs: bigint;
    calories: bigint;
    name: string;
    description: string;
    steps: Array<string>;
    imageUrl: string;
    prepTime: bigint;
    category: string;
    isVeg: boolean;
    ingredients: Array<string>;
    protein: bigint;
}
export interface Recipe {
    id: bigint;
    fat: bigint;
    carbs: bigint;
    calories: bigint;
    name: string;
    description: string;
    steps: Array<string>;
    imageUrl: string;
    prepTime: bigint;
    category: string;
    isVeg: boolean;
    ingredients: Array<string>;
    protein: bigint;
}
export interface backendInterface {
    createRecipe(recipe: CreateRecipeRequest): Promise<Recipe>;
    updateRecipe(id: bigint, recipe: CreateRecipeRequest): Promise<Recipe>;
    deleteRecipe(id: bigint): Promise<boolean>;
    getRecipe(id: bigint): Promise<Recipe | null>;
    getRecipes(): Promise<Array<Recipe>>;
}
