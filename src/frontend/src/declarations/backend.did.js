/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const CreateRecipeRequest = IDL.Record({
  'fat' : IDL.Int,
  'carbs' : IDL.Int,
  'calories' : IDL.Int,
  'name' : IDL.Text,
  'description' : IDL.Text,
  'steps' : IDL.Vec(IDL.Text),
  'imageUrl' : IDL.Text,
  'prepTime' : IDL.Int,
  'category' : IDL.Text,
  'isVeg' : IDL.Bool,
  'ingredients' : IDL.Vec(IDL.Text),
  'protein' : IDL.Int,
});
export const Recipe = IDL.Record({
  'id' : IDL.Nat,
  'fat' : IDL.Int,
  'carbs' : IDL.Int,
  'calories' : IDL.Int,
  'name' : IDL.Text,
  'description' : IDL.Text,
  'steps' : IDL.Vec(IDL.Text),
  'imageUrl' : IDL.Text,
  'prepTime' : IDL.Int,
  'category' : IDL.Text,
  'isVeg' : IDL.Bool,
  'ingredients' : IDL.Vec(IDL.Text),
  'protein' : IDL.Int,
});

export const idlService = IDL.Service({
  'claimOwner' : IDL.Func([], [IDL.Bool], []),
  'getOwner' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
  'isOwner' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
  'createRecipe' : IDL.Func([CreateRecipeRequest], [Recipe], []),
  'updateRecipe' : IDL.Func([IDL.Nat, CreateRecipeRequest], [Recipe], []),
  'deleteRecipe' : IDL.Func([IDL.Nat], [IDL.Bool], []),
  'getRecipe' : IDL.Func([IDL.Nat], [IDL.Opt(Recipe)], ['query']),
  'getRecipes' : IDL.Func([], [IDL.Vec(Recipe)], ['query']),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const CreateRecipeRequest = IDL.Record({
    'fat' : IDL.Int,
    'carbs' : IDL.Int,
    'calories' : IDL.Int,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'steps' : IDL.Vec(IDL.Text),
    'imageUrl' : IDL.Text,
    'prepTime' : IDL.Int,
    'category' : IDL.Text,
    'isVeg' : IDL.Bool,
    'ingredients' : IDL.Vec(IDL.Text),
    'protein' : IDL.Int,
  });
  const Recipe = IDL.Record({
    'id' : IDL.Nat,
    'fat' : IDL.Int,
    'carbs' : IDL.Int,
    'calories' : IDL.Int,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'steps' : IDL.Vec(IDL.Text),
    'imageUrl' : IDL.Text,
    'prepTime' : IDL.Int,
    'category' : IDL.Text,
    'isVeg' : IDL.Bool,
    'ingredients' : IDL.Vec(IDL.Text),
    'protein' : IDL.Int,
  });
  return IDL.Service({
    'claimOwner' : IDL.Func([], [IDL.Bool], []),
    'getOwner' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'isOwner' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'createRecipe' : IDL.Func([CreateRecipeRequest], [Recipe], []),
    'updateRecipe' : IDL.Func([IDL.Nat, CreateRecipeRequest], [Recipe], []),
    'deleteRecipe' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getRecipe' : IDL.Func([IDL.Nat], [IDL.Opt(Recipe)], ['query']),
    'getRecipes' : IDL.Func([], [IDL.Vec(Recipe)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
