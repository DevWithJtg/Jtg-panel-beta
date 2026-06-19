import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readJSON } from "../services/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "jtg-panel-super-secret";

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const users = await readJSON("users.json") || [];
  const user = users.find((u: any) => u.username === username);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, username: user.username } });
};

export const logout = (req: Request, res: Response) => {
  res.json({ message: "Logged out" });
};

export const getMe = (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
};
