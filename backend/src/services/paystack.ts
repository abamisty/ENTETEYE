const axios = require("axios");

async function verifyPayment(reference: any) {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.data.status === "success") {
      // Payment was successful
      return { success: true, data: response.data.data };
    } else {
      return { success: false, message: "Payment not successful" };
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return { success: false, message: error.message };
  }
}
