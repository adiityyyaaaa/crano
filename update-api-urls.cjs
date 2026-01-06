#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
    {
        path: 'pages/Teach.tsx',
        replacements: [
            {
                search: "import { GRADES } from '../constants';",
                replace: "import { GRADES } from '../constants';\nimport { getApiUrl } from '../utils/api';"
            },
            {
                search: "const endpoint = isSignInMode ? '/api/auth/login' : '/api/auth/register';",
                replace: "const endpoint = isSignInMode ? getApiUrl('api/auth/login') : getApiUrl('api/auth/register');"
            }
        ]
    },
    {
        path: 'pages/Discover.tsx',
        replacements: [
            {
                search: "import { SUBJECTS, GRADES } from '../constants';",
                replace: "import { SUBJECTS, GRADES } from '../constants';\nimport { getApiUrl } from '../utils/api';"
            },
            {
                search: "const response = await fetch('/api/teachers');",
                replace: "const response = await fetch(getApiUrl('api/teachers'));"
            }
        ]
    },
    {
        path: 'pages/Dashboard.tsx',
        replacements: [
            {
                search: "import { Calendar, Clock, User, BookOpen, TrendingUp, Award, MessageSquare, ChevronRight, Star, Video, Loader2 } from 'lucide-react';",
                replace: "import { Calendar, Clock, User, BookOpen, TrendingUp, Award, MessageSquare, ChevronRight, Star, Video, Loader2 } from 'lucide-react';\nimport { getApiUrl } from '../utils/api';"
            },
            {
                search: "const url = `/api/bookings/student/${encodeURIComponent(userName)}`;",
                replace: "const url = getApiUrl(`api/bookings/student/${encodeURIComponent(userName)}`);"
            },
            {
                search: "const teachersRes = await fetch('/api/teachers');",
                replace: "const teachersRes = await fetch(getApiUrl('api/teachers'));"
            },
            {
                search: "const bookingsRes = await fetch(`/api/bookings/${currentTeacher._id}`);",
                replace: "const bookingsRes = await fetch(getApiUrl(`api/bookings/${currentTeacher._id}`));"
            },
            {
                search: "const statsRes = await fetch(`/api/teachers/${currentTeacher._id}/stats`);",
                replace: "const statsRes = await fetch(getApiUrl(`api/teachers/${currentTeacher._id}/stats`));"
            }
        ]
    },
    {
        path: 'pages/TeacherProfile.tsx',
        replacements: [
            {
                search: "import { GRADES } from '../constants';",
                replace: "import { GRADES } from '../constants';\nimport { getApiUrl } from '../utils/api';"
            },
            {
                search: "const slotsResponse = await fetch(`/api/teachers/${teacher._id}/availability?date=${dateStr}`);",
                replace: "const slotsResponse = await fetch(getApiUrl(`api/teachers/${teacher._id}/availability?date=${dateStr}`));"
            },
            {
                search: "const bookingsResponse = await fetch(`/api/bookings/${teacher._id}`);",
                replace: "const bookingsResponse = await fetch(getApiUrl(`api/bookings/${teacher._id}`));"
            },
            {
                search: "const response = await fetch('/api/packages/create', {",
                replace: "const response = await fetch(getApiUrl('api/packages/create'), {"
            },
            {
                search: "const response = await fetch('/api/bookings', {",
                replace: "const response = await fetch(getApiUrl('api/bookings'), {"
            },
            {
                search: "fetch(`/api/teachers/${id}`),",
                replace: "fetch(getApiUrl(`api/teachers/${id}`)),"
            },
            {
                search: "fetch(`/api/bookings/${id}`)",
                replace: "fetch(getApiUrl(`api/bookings/${id}`))"
            }
        ]
    },
    {
        path: 'components/ChatModal.tsx',
        replacements: [
            {
                search: "import { X, Send, Loader2 } from 'lucide-react';",
                replace: "import { X, Send, Loader2 } from 'lucide-react';\nimport { getApiUrl } from '../utils/api';"
            },
            {
                search: "const response = await fetch(`/api/chat/conversation/${otherUserId}`, {",
                replace: "const response = await fetch(getApiUrl(`api/chat/conversation/${otherUserId}`), {"
            },
            {
                search: "const response = await fetch('/api/chat/send', {",
                replace: "const response = await fetch(getApiUrl('api/chat/send'), {"
            }
        ]
    },
    {
        path: 'components/PaymentModal.tsx',
        replacements: [
            {
                search: "import { X, CreditCard, Loader2, CheckCircle2, XCircle } from 'lucide-react';",
                replace: "import { X, CreditCard, Loader2, CheckCircle2, XCircle } from 'lucide-react';\nimport { getApiUrl } from '../utils/api';"
            },
            {
                search: "const orderResponse = await fetch('/api/payment/create-order', {",
                replace: "const orderResponse = await fetch(getApiUrl('api/payment/create-order'), {"
            },
            {
                search: "const verifyResponse = await fetch('/api/payment/verify', {",
                replace: "const verifyResponse = await fetch(getApiUrl('api/payment/verify'), {"
            },
            {
                search: "fetch('/api/payment/failure', {",
                replace: "fetch(getApiUrl('api/payment/failure'), {"
            }
        ]
    }
];

console.log('🔧 Updating API URLs in frontend files...\n');

files.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        file.replacements.forEach(({ search, replace }) => {
            if (content.includes(search)) {
                content = content.replace(search, replace);
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${file.path}`);
        } else {
            console.log(`⏭️  Skipped: ${file.path} (no changes needed)`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${file.path}:`, error.message);
    }
});

console.log('\n✨ Done! All files updated.');
