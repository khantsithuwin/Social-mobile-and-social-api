import express from "express";

import cors from "cors";
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded());

import { router as userRouter } from "./routes/users";
app.use(userRouter);

import { router as postRouter } from "./routes/posts";
app.use(postRouter);

app.get("/", (req, res) => {
  res.json({ status: "Social API running...." });
});

app.listen(8800, () => {
  console.log("Social API running at 8800");
});
