import { stkPushSchema } from "./mpesa.validation.js";
import { getPaymentStatus, handleMpesaCallback, initiateStkPush } from "./mpesa.service.js";

export const stkPush = async (req, res, next) => {
  try {
    const payload = stkPushSchema.parse(req.body);
    const data = await initiateStkPush(payload);

    return res.status(200).json({
      success: true,
      message: "STK push initiated",
      data
    });
  } catch (error) {
    return next(error);
  }
};

export const mpesaCallback = async (req, res, next) => {
  try {
    const data = handleMpesaCallback(req.body || {});

    return res.status(200).json({
      success: true,
      message: "Callback received",
      data
    });
  } catch (error) {
    return next(error);
  }
};

export const paymentStatus = async (req, res, next) => {
  try {
    const data = getPaymentStatus(req.params.checkoutRequestId);

    return res.status(200).json({
      success: true,
      message: "Payment status fetched",
      data
    });
  } catch (error) {
    return next(error);
  }
};
