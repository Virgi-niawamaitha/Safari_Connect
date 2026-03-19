import {
  getPlatformStats,
  getAllUsers,
  getAllBookings,
  getAllSaccos,
  getAllPayments,
  setUserStatus,
  setSaccoStatus,
} from "./admin.service.js";

export const getStats = async (req, res, next) => {
  try {
    const data = await getPlatformStats();
    return res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const listUsers = async (req, res, next) => {
  try {
    const data = await getAllUsers(req.query);
    return res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const listBookings = async (req, res, next) => {
  try {
    const data = await getAllBookings(req.query);
    return res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const listSaccos = async (req, res, next) => {
  try {
    const data = await getAllSaccos();
    return res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const listPayments = async (req, res, next) => {
  try {
    const data = await getAllPayments(req.query);
    return res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const data = await setUserStatus(req.params.userId, req.body.status);
    return res.json({ success: true, message: "User status updated", data });
  } catch (error) { next(error); }
};

export const updateSaccoStatus = async (req, res, next) => {
  try {
    const data = await setSaccoStatus(req.params.saccoId, req.body.isActive);
    return res.json({ success: true, message: "Sacco status updated", data });
  } catch (error) { next(error); }
};
