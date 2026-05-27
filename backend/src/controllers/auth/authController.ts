import { Request, Response } from "express";
import { console } from "inspector/promises";
import jwt from "../../middleware/auth";
import { User } from "../../models";

const signAuthToken = jwt.signAuthToken;

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const valid = password === user.password;

  if (!valid) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const token = await signAuthToken({
    userId: user._id,
    role_id: user.role_id,
    email: user.email,
    partnerId: user.partnerId,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: true,
  });
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).send({ status: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
