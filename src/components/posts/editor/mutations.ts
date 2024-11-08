import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";
import { useSessionContext } from "@/app/(main)/SessionProvider";
// import { revalidateTag } from "next/cache";
// import { redirect } from "next/navigation";

export function useCreatePostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { user } = useSessionContext();
  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      // const queryFilter: QueryFilters = { queryKey: ["post-feed", "for-you"] };
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      // This code runs when the Backend has already the data and is not empty....In this case, we will just update the already existing cache in the client side manually to update the UI when the User will upload any post.....
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          //(property) InfiniteData<PostsPage, string | null>.pages: PostsPage[] => pages is an array of PostsPage type objects
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      // (property) QueryFilters.predicate?: ((query: Query) => boolean) | undefined
      // Include queries matching this predicate function

      // QueryClient.invalidateQueries(filters?: InvalidateQueryFilters, options?: InvalidateOptions): Promise<void>

      // This code runs when the Backend has not any data and is empty....In this case, we will update the UI by fetching the posts again from the Database when the User uploads any post because no data is already in the cache of client already.....
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          // return !query.state.data;
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}
