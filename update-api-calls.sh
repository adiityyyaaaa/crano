#!/bin/bash

# Script to update API calls to use the API utility

echo "Updating API calls to use environment-based URLs..."

# Update pages/Teach.tsx
sed -i '' "s|const endpoint = isSignInMode ? '/api/auth/login' : '/api/auth/register';|import { getApiUrl } from '../utils/api';\n    const endpoint = isSignInMode ? getApiUrl('api/auth/login') : getApiUrl('api/auth/register');|g" pages/Teach.tsx

# Update pages/Discover.tsx  
sed -i '' "s|await fetch('/api/teachers')|import { apiFetch } from '../utils/api';\n        await apiFetch('api/teachers')|g" pages/Discover.tsx

# Update components/AuthModal.tsx
sed -i '' "s|const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';|import { getApiUrl } from '../utils/api';\n    const endpoint = isSignUp ? getApiUrl('api/auth/register') : getApiUrl('api/auth/login');|g" components/AuthModal.tsx

echo "Done! Please review the changes and update remaining files manually."
