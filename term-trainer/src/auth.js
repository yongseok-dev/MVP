// src/auth.js
const bcrypt = require("bcryptjs");
const { readJson, writeJson } = require("./db");

const USERS_FILE = "users.json";

function getUsers() {
  return readJson(USERS_FILE);
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  };
}

// 회원가입용
async function createUser(username, password) {
  const users = getUsers();

  if (users.find((u) => u.username === username)) {
    const err = new Error("USER_EXISTS");
    err.code = "USER_EXISTS";
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: "u_" + (users.length + 1),
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return toPublicUser(newUser);
}

// 로그인용
async function loginUser(username, password) {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return toPublicUser(user);
}

module.exports = {
  createUser,
  loginUser,
};
