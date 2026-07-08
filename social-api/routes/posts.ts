import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { auth } from "../middlewares/auth";

export const router = express.Router();

function getUserId(req: express.Request) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    const data = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    return data.id;
  } catch {
    return null;
  }
}

router.get("/posts", async (req, res) => {
  const userId = getUserId(req);

  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: {
      id: "desc",
    },
    include: {
      user: true,
      comments: true,
      _count: { select: { likes: true } },
    },
  });

  const postIds = posts.map((p: any) => p.id);
  const userLikes = userId
    ? await prisma.like.findMany({
        where: { userId, postId: { in: postIds } },
      })
    : [];
  const likedPostIds = new Set(userLikes.map((l: any) => l.postId));

  const result = posts.map((post: any) => ({
    ...post,
    likesCount: post._count.likes,
    likedByMe: likedPostIds.has(post.id),
    _count: undefined,
  }));

  res.json(result);
});

router.post("/posts", auth, async (req, res) => {
  const id = res.locals.user.id;
  const content = req.body?.content;
  if (!content) {
    return res.status(400).json({ meg: "content is required" });
  }
  const post = await prisma.post.create({
    data: {
      content,
      userId: id,
    },
  });
  res.status(201).json(post);
});

router.get("/posts/:id", async (req, res) => {
  const userId = getUserId(req);
  const id = req.params.id;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      user: true,
      comments: {
        orderBy: { id: "desc" },
        include: {
          user: true,
        },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!post) return res.status(404).json({ msg: "post not found" });

  const likedByMe = userId
    ? (await prisma.like.findUnique({
        where: { userId_postId: { userId, postId: post.id } },
      })) !== null
    : false;

  res.json({ ...post, likesCount: post._count.likes, likedByMe, _count: undefined });
});

router.delete("/posts/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = res.locals.user.id;

  if (!id) {
    return res.status(400).json({ msg: "invalid post id" });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!post) {
    return res.status(404).json({ msg: "post not found" });
  }

  if (post.userId !== userId) {
    return res.status(403).json({ msg: "cannot delete this post" });
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { postId: id } }),
    prisma.like.deleteMany({ where: { postId: id } }),
    prisma.post.delete({ where: { id } }),
  ]);

  res.status(204).end();
});

router.post("/comments", auth, async (req, res) => {
  const postId = Number(req.body?.postId);
  const content = req.body?.content;
  const userId = res.locals.user.id;

  if (!postId) {
    return res.status(400).json({ msg: "postId is required" });
  }

  if (!content) {
    return res.status(400).json({ msg: "content is required" });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return res.status(404).json({ msg: "post not found" });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId,
    },
    include: {
      user: true,
    },
  });

  res.status(201).json(comment);
});

router.delete("/comments/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = res.locals.user.id;

  if (!id) {
    return res.status(400).json({ msg: "invalid comment id" });
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!comment) {
    return res.status(404).json({ msg: "comment not found" });
  }

  if (comment.userId !== userId) {
    return res.status(403).json({ msg: "cannot delete this comment" });
  }

  await prisma.comment.delete({ where: { id } });

  res.status(204).end();
});

router.get("/likes/:postId", async (req, res) => {
  const postId = Number(req.params.postId);
  const likes = await prisma.like.findMany({
    where: { postId },
    include: { user: true },
  });
  res.json(likes.map((l: any) => l.user));
});

router.post("/likes", auth, async (req, res) => {
  const postId = Number(req.body?.postId);
  const userId = res.locals.user.id;

  if (!postId) {
    return res.status(400).json({ msg: "postId is required" });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  const likesCount = await prisma.like.count({ where: { postId } });
  res.json({ liked: !existing, likesCount });
});
