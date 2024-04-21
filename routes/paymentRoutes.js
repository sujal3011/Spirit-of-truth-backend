// const express = require("express");
// const dotenv = require("dotenv");
// dotenv.config();
// const router = express.Router();
// const { PAYPAL_MODE, PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY } = process.env;

// paypal.configure({
//   mode: PAYPAL_MODE, // live
//   client_id: PAYPAL_CLIENT_ID,
//   client_secret: PAYPAL_SECRET_KEY,
// });

// const env = process.env.NODE_ENV;

// const url =
//   env === "Development"
//     ? process.env.REACT_APP_FRONTEND_URL_DEV
//     : process.env.REACT_APP_FRONTEND_URL_PROD;

// router.post("/create-payment", (req, res) => {
//   const create_payment_json = {
//     intent: "sale",
//     payer: {
//       payment_method: "paypal",
//     },
//     redirect_urls: {
//       return_url: ` ${url}/success`,
//       cancel_url: `${url}/cancel`,
//     },
//     transactions: [
//       {
//         item_list: {
//           items: [
//             {
//               name: "Red Sox Hat",
//               sku: "001",
//               price: "25.00",
//               currency: "USD",
//               quantity: 1,
//             },
//           ],
//         },
//         amount: {
//           currency: "USD",
//           total: "25.00",
//         },
//         description: "Hat for the best team ever",
//       },
//     ],
//   };

//   paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//       throw error;
//     } else {
//       for (let i = 0; i < payment.links.length; i++) {
//         if (payment.links[i].rel === "approval_url") {
//           res.redirect(payment.links[i].href);
//         }
//       }
//     }
//   });
// });

// router.get("/success", (req, res) => {
//   const payerId = req.query.PayerID;
//   const paymentId = req.query.paymentId;

//   const execute_payment_json = {
//     payer_id: payerId,
//     transactions: [
//       {
//         amount: {
//           currency: "USD",
//           total: "25.00",
//         },
//       },
//     ],
//   };

//   paypal.payment.execute(
//     paymentId,
//     execute_payment_json,
//     function (error, payment) {
//       if (error) {
//         console.log(error.response);
//         throw error;
//       } else {
//         console.log(JSON.stringify(payment));
//         res.send("Success");
//       }
//     }
//   );
// });

// router.get("/cancel", (req, res) => {
//   console.log("cancelled");
//   res.send("Cancelled");
// });

// module.exports = router;
