// import { Webhook } from "svix";

// import User from '../models/User.js'

// //API controller function to manage clerk user with database

// export const clerkWebhooks = async (req, res) =>{
//     try {
//       const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

//       const headers = {
//         "svix-id": req.headers["svix-id"],
//         "svix-timestamp": req.headers["svix-timestamp"],
//         "svix-signature": req.headers["svix-signature"],
//       };

//        await whook.verify(JSON.stringify(req.body), headers); // req.body is raw buffer

//       const { data, type } = req.body;

//       switch (type) {
//         case "user.created": {
//           const userData = {
//             _id: data.id,
//             email: data.email_addresses[0].email_address,
//             name: data.first_name + " " + data.last_name,
//             imageUrl: data.image_url,
//           };
//           console.log(userData);
//          const user= await User.create(userData);
//          console.log(user)
//           res.status(200).json({});
//           break;
//         }
//         case "user.updated": {
//           const userData = {
//             email: data.email_addresses[0].email_address,
//             name: data.first_name + " " + data.last_name,
//             imageUrl: data.image_url,
//           };
//           await User.findByIdAndUpdate(data.id, userData);
//           res.json({});
//           break;
//         }
//         case "user.deleted": {
//           await User.findByIdAndDelete(data.id);
//           res.json({});
//           break;
//         }
//         default:
//           break;
//       }
//     } catch (err) {
//       console.error("Webhook error:", err);
//       res.json({ success: false, message: err.message });
//     }
    
// }

import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // ✅ Verify raw buffer
    const payload = req.body;
    const evt = whook.verify(payload, headers);

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        console.log("User data:", userData);
        const user = await User.create(userData);
        console.log("User saved:", user);
        res.status(200).json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.status(200).json({});
        break;
      }
      default:
        res.status(200).json({});
    }
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
export const stripeWebhooks = async (req,res) =>{
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    switch (event.type) {
      case "payment_intent.succeeded":{
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId
        })
        const {purchaseId} = session.data[0].metadata;

        console.log(purchaseId)
        const purchaseData = await Purchase.findById(purchaseId);
        console.log(purchaseData)
        const userData = await User.findById(purchaseData.userId);
        console.log(userData)
        const courseData = await Course.findById(purchaseData.courseId.toString())
        console.log(courseData)

        
        courseData.enrolledStudents.push(userData);
        const cdata = await courseData.save();
        console.log('cdata',cdata);
      
        userData.enrolledCourses.push(courseData._id)
        const udata = await userData.save()
        console.log("udata", udata);

        purchaseData.status = 'completed';
        const pdata = await purchaseData.save()
        console.log("pdata", pdata);

        console.log("PaymentIntent was successful!");
        break;
      }
      case "payment_intent.payment_failed":
        {
          const paymentIntent = event.data.object;
          const paymentIntentId = paymentIntent.id;
          const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
          });
          const { purchaseId } = session.data[0].metadata;

          const purchaseData = await Purchase.findById(purchaseId)

          purchaseData.status = 'failed'

          await purchaseData.save()

          break;
        }
        default:
          console.log(`unhandled event type ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event

    res.json({ received: true });
  } catch (err) {
    console.log(err.message)
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
 

// const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const stripeWebhooks = async (req, res) => {
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripeInstance.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     switch (event.type) {
//       case "payment_intent.succeeded": {
//         const paymentIntent = event.data.object;
//         const paymentIntentId = paymentIntent.id;

//         const session = await stripeInstance.checkout.sessions.list({
//           payment_intent: paymentIntentId,
//         });

//         const { purchaseId } = session.data[0].metadata;

//         const purchaseData = await Purchase.findById(purchaseId);
//         if (!purchaseData) throw new Error("Purchase not found");

//         const userData = await User.findById(purchaseData.userId);
//         const courseData = await Course.findById(purchaseData.courseId);

//         if (!userData || !courseData)
//           throw new Error("User or Course not found");

//         if (!courseData.enrolledStudents?.includes(userData._id)) {
//           courseData.enrolledStudents.push(userData._id);
//           await courseData.save();
//         }

//         if (!userData.enrolledCourses?.includes(courseData._id)) {
//           userData.enrolledCourses.push(courseData._id);
//           await userData.save();
//         }

//         purchaseData.status = "completed";
//         await purchaseData.save();

//         console.log("✅ Payment and enrollment successful");
//         break;
//       }

//       case "payment_intent.payment_failed": {
//         const paymentIntent = event.data.object;
//         const paymentIntentId = paymentIntent.id;

//         const session = await stripeInstance.checkout.sessions.list({
//           payment_intent: paymentIntentId,
//         });

//         const { purchaseId } = session.data[0].metadata;

//         const purchaseData = await Purchase.findById(purchaseId);
//         if (purchaseData) {
//           purchaseData.status = "failed";
//           await purchaseData.save();
//         }

//         console.log("❌ Payment failed");
//         break;
//       }

//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     res.status(200).json({ received: true });
//   } catch (err) {
//     console.error("❌ Stripe Webhook Error:", err.message);
//     res.status(400).send(`Webhook Error: ${err.message}`);
//   }
// };
