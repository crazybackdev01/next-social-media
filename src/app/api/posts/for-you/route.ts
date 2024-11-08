import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // console.log("enter the function");
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // array size is pageSize + 1 => n
    // last index will be n - 1
    // we are taking n pages from database but showing n-1 on frontend and sending last page id as nextCursor
    // after first query, the next query will return n pages again but including last page and will again contain one extra page for next cursor

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
// We will make a API route here then we will make a Client component ForYouFeed.tsx and using react query, will then fetch the data and show it in the <Post/> component and then Pass the <ForYouFeed/> component to the page.tsx of the (main) folder as a Child component
// The formatRelativeDate() function defined in utils.ts will only work if we pass the Date object argument to it but we will have to pass the result of the query from react query to the /api/posts/for-you which will be of string type after returning from the response of API
// Eg. Response.json(post)
// We will ky library to resolve this issue
