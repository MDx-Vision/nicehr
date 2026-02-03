import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Local login endpoint
router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "This account doesn't have a password set. Use Replit auth." });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.isActive || user.accessStatus !== 'active') {
      return res.status(403).json({ message: "Account is not active" });
    }

    // Set session user
    (req as any).session.userId = user.id;
    (req as any).session.userEmail = user.email;
    (req as any).session.userRole = user.role;
    (req as any).session.isLocalAuth = true;

    // Set req.user for compatibility with existing code
    (req as any).user = {
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
      },
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Local logout endpoint
router.post("/api/auth/logout", (req, res) => {
  req.session?.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ success: true });
  });
});

// Get current user
router.get("/api/auth/me", async (req, res) => {
  const session = req.session as any;

  if (!session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId));

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
  });
});

// Hash password utility (for creating users)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export default router;
