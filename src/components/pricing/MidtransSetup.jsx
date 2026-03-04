/**
 * Midtrans Integration Setup Guide
 * 
 * To integrate Midtrans payment gateway:
 * 
 * 1. Register at https://dashboard.midtrans.com
 * 
 * 2. Get your API Keys from Dashboard:
 *    - Server Key (for backend)
 *    - Client Key (for frontend)
 * 
 * 3. Set environment variables in your .env file:
 *    REACT_APP_MIDTRANS_CLIENT_KEY=your_client_key_here
 *    MIDTRANS_SERVER_KEY=your_server_key_here (for backend)
 * 
 * 4. Payment Flow:
 *    a. User clicks "Upgrade to Premium"
 *    b. Frontend requests Snap token from backend
 *    c. Backend creates transaction via Midtrans API
 *    d. Frontend opens Midtrans Snap payment popup
 *    e. User completes payment
 *    f. Midtrans sends webhook callback to backend
 *    g. Backend updates user subscription status
 *    h. User redirected to dashboard
 * 
 * 5. To handle payment callbacks, you need a Backend Function (Builder+ plan):
 *    - Create endpoint to receive Midtrans webhook notifications
 *    - Verify notification signature
 *    - Update user subscription status in database
 * 
 * Midtrans Webhook Notification Handler (Backend Function Example):
 * 
 * export async function handleMidtransCallback(req) {
 *   const { order_id, transaction_status, signature_key } = req.body;
 *   
 *   // Verify signature
 *   const serverKey = process.env.MIDTRANS_SERVER_KEY;
 *   const hash = crypto
 *     .createHash("sha512")
 *     .update(`${order_id}${transaction_status}${serverKey}`)
 *     .digest("hex");
 *   
 *   if (hash !== signature_key) {
 *     return { status: "unauthorized" };
 *   }
 *   
 *   // Update user subscription if payment success
 *   if (transaction_status === "settlement") {
 *     const user = await db.users.findOne({ midtrans_subscription_id: order_id });
 *     await db.users.updateOne({ id: user.id }, {
 *       subscription_status: "premium",
 *       subscription_end_date: new Date(Date.now() + 30*24*60*60*1000)
 *     });
 *   }
 *   
 *   return { status: "ok" };
 * }
 * 
 * Supported Payment Methods:
 * - Credit Card (Visa, Mastercard)
 * - Debit Card (ATM)
 * - Bank Transfers (BCA, BRI, Mandiri, etc.)
 * - E-wallets (GCash, OVO, DANA, LinkAja, etc.)
 * - Buy Now Pay Later (Akulaku, Kredivo, etc.)
 */

export const MidtransSetupGuide = {};