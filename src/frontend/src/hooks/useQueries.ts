import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRecipeRequest, Recipe } from "../backend.d";
import { useActor } from "./useActor";

export function useGetRecipes() {
  const { actor, isFetching } = useActor();
  return useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecipes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipe: CreateRecipeRequest) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createRecipe(recipe);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useDeleteRecipe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteRecipe(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
