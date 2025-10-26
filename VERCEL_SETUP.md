# Vercel Deployment Setup Guide

## 🚀 Step 1: Update Twitter Developer Portal

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Go to **"User authentication settings"**
4. Update **Callback URI / Redirect URL**:
   ```
   https://uars.vercel.app/api/auth/x/callback
   ```
5. Update **Website URL**:
   ```
   https://uars.vercel.app
   ```
6. **Save changes**

## 🔧 Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your **UARS** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Required Environment Variables

```env
# Push Chain Configuration
NEXT_PUBLIC_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_CHAIN_ID=42101

# Smart Contract Addresses
NEXT_PUBLIC_LENDING_CONTRACT=0x98CDdEcCc5614A15f0B0E97b2009ABbd71bF2C09
NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=0x198b41D6075D4b87606F2ff82C15f26aC20F1B40

# Twitter OAuth (IMPORTANT: Use production URL)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
NEXT_PUBLIC_REDIRECT_URI=https://uars.vercel.app/api/auth/x/callback
```

### Important Notes:
- ✅ Use `https://uars.vercel.app` (NOT `localhost:3000`)
- ✅ `TWITTER_CLIENT_SECRET` should be marked as **"Sensitive"**
- ✅ Apply to **Production**, **Preview**, and **Development** environments

## 🔄 Step 3: Redeploy

After updating environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** on the latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"** (optional)
5. Click **"Redeploy"**

## ✅ Step 4: Test

1. Visit: https://uars.vercel.app
2. Click **"Connect with X"**
3. Authorize the app
4. You should be redirected back to **https://uars.vercel.app** (NOT localhost)

## 🐛 Troubleshooting

### Issue: Still redirecting to localhost

**Solution:**
- Clear browser cache and cookies
- Check Vercel environment variables are set correctly
- Verify Twitter Developer Portal has the production callback URL
- Redeploy after making changes

### Issue: "Invalid redirect_uri"

**Solution:**
- Make sure callback URL in Twitter Developer Portal matches exactly:
  ```
  https://uars.vercel.app/api/auth/x/callback
  ```
- No trailing slash
- Must use `https://`

### Issue: "Something went wrong" on Twitter OAuth page

**Solution:**
- Verify `TWITTER_CLIENT_ID` is correct
- Verify callback URL matches in both Twitter Portal and Vercel env vars
- Check Twitter app is not in "Restricted" mode

## 📝 Local Development

For local development, keep a separate `.env.local` file:

```env
# Local Development
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/x/callback
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

**Note:** You may need to add `http://localhost:3000/api/auth/x/callback` as an additional callback URL in Twitter Developer Portal for local testing.

## 🎉 Done!

Your UARS dashboard should now work correctly on Vercel with Twitter OAuth!

