# Deployment Guide for Render.com

## Prerequisites
- GitHub account
- Render.com account
- Your Gemini API key

## Step-by-Step Deployment

### 1. Prepare Your Repository
```bash
# Make sure .gitignore includes sensitive files
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore

# Commit and push to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Deploy on Render
1. **Connect Repository**:
   - Go to [Render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your Smart Exam Platform repository

2. **Configure Service**:
   - **Name**: `smart-exam-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for better performance)

3. **Set Environment Variables**:
   - In the service settings, go to "Environment"
   - Add: `GEMINI_API_KEY` = `your_actual_api_key_here`
   - Add: `NODE_ENV` = `production`
   - **Important**: Never put the API key in your code or render.yaml file!

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### 3. Access Your App
- Your app will be available at: `https://your-app-name.onrender.com`
- Render provides a free `.onrender.com` subdomain
- You can also connect a custom domain if desired

## Security Best Practices

### ✅ What's Secure on Render:
- Environment variables are encrypted and secure
- HTTPS is provided by default
- No sensitive data in your code repository
- Automatic SSL certificates

### ✅ Additional Security Tips:
- Use strong API keys
- Enable 2FA on your Render account
- Monitor your API usage in Google Cloud Console
- Consider rate limiting for production use

## Monitoring and Maintenance

### Render Dashboard Features:
- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU, memory, and request metrics
- **Auto-Deploy**: Automatically deploy when you push to GitHub
- **Scaling**: Easy horizontal scaling (paid plans)

### Troubleshooting:
- Check logs in Render dashboard if deployment fails
- Verify environment variables are set correctly
- Ensure all dependencies are in package.json

## Cost Considerations

### Free Tier:
- ✅ Perfect for testing and small projects
- ✅ 750 hours/month (enough for constant uptime)
- ❌ Apps sleep after 15 minutes of inactivity
- ❌ Limited to 512MB RAM

### Paid Tiers ($7+/month):
- ✅ No sleeping
- ✅ More RAM and CPU
- ✅ Custom domains
- ✅ Priority support

## Alternative Hosting Options

If you want to explore other platforms:
- **Vercel**: Great for frontend, serverless functions
- **Railway**: Similar to Render, good Node.js support
- **Heroku**: More expensive but very reliable
- **DigitalOcean App Platform**: Good middle ground

## Environment Variables Setup

In Render dashboard, add these variables:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
PORT=10000
```

**Never commit these to your repository!**
