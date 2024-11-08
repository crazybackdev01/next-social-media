"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ForYouFeed() {
  //   console.log("Re render");
  //   const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  //   /api/posts/for-you?cursor=cmasna2g28kasnagq0001x9snajnsamwpyx0rwnz
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you",
          pageParam
            ? {
                searchParams: { cursor: pageParam },
              }
            : {},
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: true,
    // retry: false,
    // refetchOnWindowFocus: false,
  });

  //   console.log("Re render 2");

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  //   const query = useQuery<PostData[]>({
  //     queryKey: ["post-feed", "for-you"],
  //     queryFn: kyInstance.get("api/posts/for-you", {
  //       timeout: 30000,
  //     }).json<PostData[]>,
  //     retry: false,
  //     refetchOnWindowFocus: false,
  //   });

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No one has posted anything yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomScroll={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
