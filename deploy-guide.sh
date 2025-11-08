#!/bin/bash

# EcoMeter Deployment Guide
# This script helps you deploy all services

echo "🚀 EcoMeter Deployment Helper"
echo "=============================="
echo ""

echo "📋 Deployment Checklist:"
echo "1. ✅ Push code to GitHub"
echo "2. 🤖 Deploy ML Service on Render"
echo "3. ⚡ Deploy Backend on Render" 
echo "4. 🎨 Deploy Frontend on Vercel"
echo "5. 🔗 Update environment variables"
echo ""

echo "🔗 Useful Links:"
echo "- Render: https://render.com"
echo "- Vercel: https://vercel.com" 
echo "- MongoDB Atlas: https://mongodb.com/atlas"
echo ""

echo "📝 Environment Variables Needed:"
echo ""
echo "Backend (Render):"
echo "- NODE_ENV=production"
echo "- PORT=10000"
echo "- MONGO_URI=mongodb+srv://..."
echo "- ML_SERVICE_URL=https://your-ml-service.onrender.com"
echo "- FRONTEND_URL=https://your-frontend.vercel.app"
echo ""
echo "Frontend (Vercel):"
echo "- VITE_BACKEND_URL=https://your-backend.onrender.com"
echo ""
echo "ML Service (Render):"
echo "- PYTHONUNBUFFERED=1"
echo ""

echo "✅ Ready to deploy! Follow the step-by-step guide in README.md"