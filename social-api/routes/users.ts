import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { auth } from "../middlewares/auth";

export const router = express.Router();

router.get("/verify", auth, async (req, res) => {
  const id = res.locals.user.id as number;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  res.json(user);
});

router.post("/login", async (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    return res.status(400).json({ msg: "username and password are require" });
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (user) {
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET as string,
      );
      return res.json({ user, token });
    }
  }

  res.status(401).json({ msg: "invaild username or password" });
});

router.get("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { id: "desc" },
        include: {
          _count: { select: { likes: true, comments: true } },
          user: true,
        },
      },
    },
  });

  if (!user) return res.status(404).json({ msg: "user not found" });

  const userId = (() => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return null;
      const data = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
      return data.id;
    } catch {
      return null;
    }
  })();

  const postIds = user.posts.map((p: any) => p.id);
  const userLikes = userId
    ? await prisma.like.findMany({
        where: { userId, postId: { in: postIds } },
      })
    : [];
  const likedPostIds = new Set(userLikes.map((l: any) => l.postId));

  const posts = user.posts.map((post: any) => ({
    ...post,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByMe: likedPostIds.has(post.id),
    _count: undefined,
  }));

  res.json({ ...user, posts });
});

router.post("/users", async (req, res) => {
  const name = req.body?.name;
  const username = req.body?.username;
  const bio = req.body?.bio;
  const password = req.body?.password;

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ msg: "name,username and password are required" });
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
      bio,
      password: await bcrypt.hash(password, 10),
    },
  });

  res.status(201).json(user);
});
