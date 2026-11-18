// Usage:  npm run set-passwords                 -> hashes a default password for users that have none
//         npm run set-passwords -- MyPass#2027  -> uses your password instead
//         npm run set-passwords -- MyPass#2027 --all   -> resets EVERY user
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const args = process.argv.slice(2);
const all = args.includes("--all");
const password = args.find((a) => !a.startsWith("--")) || "Concert@123";

const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "concert_deployment_db",
});

const hash = await bcrypt.hash(password, 10);
const [res] = await db.query(
  `UPDATE users SET Password_Hash = ? ${all ? "" : "WHERE Password_Hash IS NULL"}`,
  [hash]
);
console.log(`Updated ${res.affectedRows} user(s). Only the bcrypt hash is stored.`);
await db.end();
