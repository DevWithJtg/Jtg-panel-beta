import "dotenv/config";
import bcrypt from "bcryptjs";
import readline from "readline";
import path from "path";
import fs from "fs-extra";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

fs.ensureDirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");

console.log("=== JTG Panel Admin User Creation ===");

rl.question("Username: ", async (username) => {
  rl.question("Password: ", async (password) => {
    if (!username || !password) {
      console.error("Username and password are required.");
      process.exit(1);
    }
    const users = await fs.readJson(USERS_FILE);
    const existing = users.find((u: any) => u.username === username);
    if (existing) {
      console.error("User already exists.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });

    await fs.writeJson(USERS_FILE, users, { spaces: 2 });
    console.log("Admin user created successfully.");
    process.exit(0);
  });
});
