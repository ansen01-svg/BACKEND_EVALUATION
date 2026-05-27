import { Request, Response } from "express";
import { User } from "../../models";

export const getPartners = async (req: Request, res: Response) => {
  try {
    const partnerIds = await User.distinct("partnerId", {
      role_id: 2,
    });

    return res.status(200).json({
      status: true,
      message: "Partners fetched successfully",
      data: partnerIds,
    });
  } catch (error) {
    console.error("Get partners error:", error);

    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};
