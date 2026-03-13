/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface CreateRecipeRequest {
  'fat' : bigint,
  'carbs' : bigint,
  'calories' : bigint,
  'name' : string,
  'description' : string,
  'steps' : Array<string>,
  'imageUrl' : string,
  'prepTime' : bigint,
  'category' : string,
  'isVeg' : boolean,
  'ingredients' : Array<string>,
  'protein' : bigint,
}
export interface Recipe {
  'id' : bigint,
  'fat' : bigint,
  'carbs' : bigint,
  'calories' : bigint,
  'name' : string,
  'description' : string,
  'steps' : Array<string>,
  'imageUrl' : string,
  'prepTime' : bigint,
  'category' : string,
  'isVeg' : boolean,
  'ingredients' : Array<string>,
  'protein' : bigint,
}
export interface _SERVICE {
  'createRecipe' : ActorMethod<[CreateRecipeRequest], Recipe>,
  'deleteRecipe' : ActorMethod<[bigint], boolean>,
  'getRecipe' : ActorMethod<[bigint], [] | [Recipe]>,
  'getRecipes' : ActorMethod<[], Array<Recipe>>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
