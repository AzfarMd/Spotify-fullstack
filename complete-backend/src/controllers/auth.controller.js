const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const LOCAL_USERS_FILE = path.join(__dirname, "../../data/users.json");

function getLocalUsers() {
    try {
        if (!fs.existsSync(LOCAL_USERS_FILE)) {
            fs.mkdirSync(path.dirname(LOCAL_USERS_FILE), { recursive: true });
            fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(LOCAL_USERS_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveLocalUsers(users) {
    try {
        fs.mkdirSync(path.dirname(LOCAL_USERS_FILE), { recursive: true });
        fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2));
    } catch (e) {
        console.error("Error saving local users:", e);
    }
}

async function registerUser(req, res) {
    try {
        const { username, email, password, role = "user" } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // If MongoDB is connected, use Mongoose
        if (mongoose.connection.readyState === 1) {
            const isUserAlreadyExists = await userModel.findOne({
                $or: [
                    { username },
                    { email: email || username }
                ]
            });

            if (isUserAlreadyExists) {
                return res.status(409).json({ message: "User already exists" });
            }

            const hash = await bcrypt.hash(password, 10);

            const user = await userModel.create({
                username,
                email: email || `${username}@spotify.demo`,
                password: hash,
                role
            });

            const token = jwt.sign({
                id: user._id,
                role: user.role,
            }, process.env.JWT_SECRET || 'spotify_jwt_secret_dev_key');

            res.cookie("token", token);

            return res.status(201).json({
                message: "User registered successfully",
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                }
            });
        }

        // Standalone local file storage mode (when MongoDB is not running)
        const localUsers = getLocalUsers();
        const existing = localUsers.find(
            (u) =>
                u.username.toLowerCase() === username.toLowerCase() ||
                (email && u.email.toLowerCase() === email.toLowerCase())
        );

        if (existing) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hash = await bcrypt.hash(password, 10);
        const newUser = {
            _id: `usr_${Date.now()}`,
            username,
            email: email || `${username}@spotify.demo`,
            password: hash,
            role: role || "user"
        };

        localUsers.push(newUser);
        saveLocalUsers(localUsers);

        const token = jwt.sign({
            id: newUser._id,
            role: newUser.role,
        }, process.env.JWT_SECRET || 'spotify_jwt_secret_dev_key');

        res.cookie("token", token);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            }
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Registration error: " + err.message });
    }
}

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // If MongoDB is connected, use Mongoose
        if (mongoose.connection.readyState === 1) {
            const user = await userModel.findOne({
                $or: [
                    { username },
                    { email }
                ]
            });

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({
                id: user._id,
                role: user.role,
            }, process.env.JWT_SECRET || 'spotify_jwt_secret_dev_key');

            res.cookie("token", token);

            return res.status(200).json({
                message: "User logged in successfully",
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                }
            });
        }

        // Standalone local file storage mode (when MongoDB is not running)
        const localUsers = getLocalUsers();
        const searchVal = (username || email || "").toLowerCase();

        const user = localUsers.find(
            (u) =>
                u.username.toLowerCase() === searchVal ||
                u.email.toLowerCase() === searchVal
        );

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role,
        }, process.env.JWT_SECRET || 'spotify_jwt_secret_dev_key');

        res.cookie("token", token);

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login error: " + err.message });
    }
}

async function logoutUser(req, res) {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
}

module.exports = { registerUser, loginUser, logoutUser };