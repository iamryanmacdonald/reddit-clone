import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { APIModelInputs } from "~/lib/api-models";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    // Make sure the user is authorized
    const session = await getServerSession(authOptions);

    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // Pull id from the params
    const { id } = params;

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) return new NextResponse("Post does not exist", { status: 404 });

    // Pull inputs from the request
    const body = await req.json();
    const data = APIModelInputs["posts/[id]/vote"].parse(body);

    const postVote = await prisma.postVote.upsert({
      create: {
        postId: id,
        userId: session.user.id,
        vote: data.vote,
      },
      update: {
        vote: data.vote,
      },
      where: {
        postId_userId: {
          postId: id,
          userId: session.user.id,
        },
      },
    });

    // Get post votes to return
    const votesAgg = await prisma.postVote.aggregate({
      _sum: {
        vote: true,
      },
      where: {
        postId: id,
      },
    });

    return new NextResponse(
      JSON.stringify({ vote: postVote.vote, votes: votesAgg._sum.vote ?? 0 }),
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error creating post", { status: 500 });
  }
}
