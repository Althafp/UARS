# Production Deployment Checklist ✅

## 🎯 What You Need To Do Now

### 1. Update Twitter Developer Portal (CRITICAL)

Go to: https://developer.twitter.com/en/portal/dashboard

1. Select your UARS app
2. Click **"User authentication settings"** → **Edit**
3. Update **Callback URI**:
   ```
   https://uars.vercel.app/api/auth/x/callback
   ```
4. Update **Website URL**:
   ```
   https://uars.vercel.app
   ```
5. **SAVE CHANGES** ✅

### 2. Set Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your UARS Project → Settings → Environment Variables

Add these variables:

```env
NEXT_PUBLIC_RPC_URL=https://evm.rpc-testnet-donut-node1.push.org/
NEXT_PUBLIC_CHAIN_ID=42101
NEXT_PUBLIC_LENDING_CONTRACT=0x98CDdEcCc5614A15f0B0E97b2009ABbd71bF2C09
NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS=0x198b41D6075D4b87606F2ff82C15f26aC20F1B40
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
NEXT_PUBLIC_REDIRECT_URI=https://uars.vercel.app/api/auth/x/callback
```

**Important:**
- Mark `TWITTER_CLIENT_SECRET` as **Sensitive** ✅
- Apply to **Production**, **Preview**, and **Development** ✅

### 3. Push Updated Code to GitHub

```bash
git add .
git commit -m "Update to production URLs for Vercel deployment"
git push origin main
```

### 4. Redeploy on Vercel

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for build to complete

### 5. Test Production

Visit: https://uars.vercel.app

1. ✅ Click "Connect with X"
2. ✅ Authorize on Twitter
3. ✅ Should redirect back to **https://uars.vercel.app** (NOT localhost)
4. ✅ Your Twitter profile should appear in header

---

## 📦 What Was Updated

### Code Changes:
- ✅ `uars-extension/content.js` - API URL changed to `https://uars.vercel.app`
- ✅ `uars-extension/background.js` - Dashboard URL updated
- ✅ `uars-extension/popup.html` - Links updated to production
- ✅ `uars-extension/manifest.json` - Host permissions updated
- ✅ `README.md` - Added live demo link
- ✅ `VERCEL_SETUP.md` - Complete setup guide created
- ✅ `.npmrc` - Added to fix Vercel build issues
- ✅ `package.json` - Removed `vaul` dependency

### Environment Variables:
All code uses `process.env.NEXT_PUBLIC_REDIRECT_URI` which you'll set in Vercel.

---

## 🐛 Troubleshooting

### Still redirecting to localhost?

**Check:**
1. Vercel environment variable `NEXT_PUBLIC_REDIRECT_URI` is set to production URL
2. Twitter Developer Portal callback URL is updated
3. You've redeployed after setting env vars
4. Clear browser cache

### "Invalid redirect_uri" error?

**Fix:**
- Callback URL in Twitter Portal must **exactly match**:
  ```
  https://uars.vercel.app/api/auth/x/callback
  ```
- No trailing slash
- Must use `https://`

### Extension not working?

**Fix:**
1. Reload the extension in Chrome
2. Visit `chrome://extensions/`
3. Click reload icon on UARS extension
4. Try visiting a Twitter profile again

---

## ✅ Success Criteria

- [ ] Twitter OAuth redirects to production URL
- [ ] Twitter profile appears in header after connecting
- [ ] Browser extension shows reputation on Twitter profiles
- [ ] Achievement NFTs can be claimed
- [ ] No console errors on production

---

## 🎉 You're Done!

Your UARS dashboard is now fully deployed on Vercel with Twitter OAuth working correctly!

**Live URL**: https://uars.vercel.app

