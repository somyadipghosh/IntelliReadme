# Deployment Guide

## 📦 Building for Production

### Local Build
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

### Environment Variables
Before deploying, make sure to set up your environment variables:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## 🚀 Deployment Options

### 1. GitHub Pages (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch

3. **Set up Secrets**:
   - Go to repository Settings > Secrets and variables > Actions
   - Add `VITE_GEMINI_API_KEY` with your API key

The GitHub Action will automatically deploy your site when you push to the main branch.

### 2. Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist` folder to Netlify
   - Or connect your GitHub repository for automatic deployments

3. **Environment Variables**:
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add `VITE_GEMINI_API_KEY` with your API key

### 3. Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Environment Variables**:
   - Use `vercel env add` to add your environment variables
   - Or add them through the Vercel dashboard

### 4. Custom Server

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server

3. **Configure your web server** to serve the static files

## 🔧 Configuration

### API Key Security
- **Never commit your API key** to version control
- Use environment variables for all deployments
- Consider implementing rate limiting and usage monitoring

### CORS Configuration
The app uses the GitHub API and Google Gemini API, both of which support CORS for browser requests.

## 🌐 Custom Domain

If deploying to GitHub Pages with a custom domain:

1. Add a `CNAME` file to the `public` directory with your domain
2. Update the `base` path in `vite.config.js` if needed
3. Configure your DNS to point to GitHub Pages

## 📊 Performance Optimization

The build includes:
- Tree shaking for smaller bundle sizes
- Asset optimization
- Code splitting
- Gzip compression (when served properly)

## 🔍 Troubleshooting

### Common Issues:

1. **Blank page after deployment**:
   - Check the base path in `vite.config.js`
   - Ensure all assets are loading correctly

2. **API key not working**:
   - Verify the environment variable name
   - Check if the API key has the correct permissions

3. **Build errors**:
   - Clear node_modules and reinstall dependencies
   - Check for any TypeScript or linting errors

## 📈 Monitoring

Consider adding:
- Google Analytics for usage tracking
- Error monitoring (Sentry, LogRocket)
- Performance monitoring (Web Vitals)

---

For more deployment options and advanced configurations, check the [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html).
