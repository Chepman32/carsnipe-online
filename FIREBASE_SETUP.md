# Firebase Hosting Setup Guide

This guide will help you set up Firebase hosting for your Carsnipe application.

## Prerequisites

1. Install Firebase CLI globally (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Make sure you have a Firebase project created at [Firebase Console](https://console.firebase.google.com/)

## Setup Steps

### 1. Install Dependencies

The Firebase CLI has been added as a dev dependency. Install it:

```bash
yarn install
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Hosting

```bash
yarn firebase:init
```

During initialization:
- Select your Firebase project
- Use `build` as your public directory
- Configure as a single-page app: **Yes**
- Set up automatic builds and deploys: **No** (we'll handle this manually)

### 4. Update Project Configuration

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

## Available Scripts

- `yarn firebase:init` - Initialize Firebase hosting
- `yarn firebase:deploy` - Deploy to Firebase hosting
- `yarn firebase:serve` - Serve locally for testing
- `yarn deploy` - Build and deploy in one command

## Deployment

### Manual Deployment

1. Build your application:
   ```bash
   yarn build
   ```

2. Deploy to Firebase:
   ```bash
   yarn firebase:deploy
   ```

### One-Command Deployment

Use the combined deploy script:
```bash
yarn deploy
```

## Local Testing

Test your build locally before deploying:

```bash
yarn firebase:serve
```

This will serve your built application locally at `http://localhost:5000`

## Configuration Details

The `firebase.json` file is configured with:

- **Public Directory**: `build` (where React builds the production files)
- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Caching**: Static assets are cached for 1 year for better performance
- **Ignore Patterns**: Excludes unnecessary files from deployment

## Environment Variables

If you need to set environment variables for production, you can:

1. Add them to your Firebase project settings
2. Use Firebase Functions for server-side logic
3. Configure them in the Firebase Console under Project Settings > General > Your Apps

## Troubleshooting

### Common Issues

1. **Build fails**: Make sure all dependencies are installed
2. **Deploy fails**: Check if you're logged in to Firebase CLI
3. **Routing issues**: The SPA configuration should handle all routes

### Useful Commands

- `firebase projects:list` - List all your Firebase projects
- `firebase use <project-id>` - Switch to a different project
- `firebase hosting:channel:deploy preview` - Deploy to a preview channel

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic with Firebase)
3. Set up CI/CD pipeline for automatic deployments
4. Configure Firebase Analytics (optional)

## Security Rules

Firebase hosting serves static content, so no additional security rules are needed for the hosting itself. If you add Firebase services later (Firestore, Auth, etc.), you'll need to configure security rules for those services. 