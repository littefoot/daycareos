/**
 * DaycareOS Sovereign Authentication & Magic Link Engine
 * ----------------------------------------------------------------------------
 * Project: daycare-os-2026
 * Uses official Firebase Authentication SDK with Google Identity Platform.
 * Solves browser popup state management and handles cross-origin cryptographic verification.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink as fbIsSignInWithEmailLink, 
  signInWithEmailLink as fbSignInWithEmailLink,
  signOut,
  User
} from 'firebase/auth';

export const firebaseConfig = {
  projectId: "daycare-os-2026",
  appId: "1:32130514988:web:07cd32fac88e3cde445189",
  storageBucket: "daycare-os-2026.firebasestorage.app",
  apiKey: "",
  authDomain: "daycare-os-2026.firebaseapp.com",
  messagingSenderId: "32130514988",
  projectNumber: "32130514988",
  version: "2"
};

// Initialize sovereign Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize sovereign Firebase Auth instance
export const auth = getAuth(app);

// Configure Google OAuth provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface VerifyLinkResult {
  success: boolean;
  email?: string;
  name?: string;
  error?: string;
}

/**
 * Dispatches a cryptographic passwordless sign-in magic link to user's inbox
 */
export async function sendMagicLinkEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Invalid email address.' };
  }

  const continueUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://daycare-os-2026.web.app/';

  const actionCodeSettings = {
    url: continueUrl,
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', cleanEmail);
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase sendSignInLinkToEmail Error]:', err);
    return { success: false, error: err.message || 'Failed to dispatch magic link email.' };
  }
}

/**
 * Validates if the current URL contains an active Firebase magic link confirmation code
 */
export function isSignInWithEmailLink(url: string): boolean {
  if (!url) return false;
  return fbIsSignInWithEmailLink(auth, url);
}

/**
 * Completes cryptographic sign-in using the return URL
 */
export async function completeEmailLinkSignIn(providedEmail?: string): Promise<VerifyLinkResult> {
  if (typeof window === 'undefined') return { success: false, error: 'Window not defined' };
  
  const currentUrl = window.location.href;
  if (!fbIsSignInWithEmailLink(auth, currentUrl)) {
    return { success: false, error: 'Not a valid email sign-in link' };
  }

  let emailToUse = providedEmail || window.localStorage.getItem('emailForSignIn');
  if (!emailToUse) {
    emailToUse = window.prompt('Please confirm your email address to complete verification:');
  }

  if (!emailToUse) {
    return { success: false, error: 'Email confirmation is required.' };
  }

  try {
    const cred = await fbSignInWithEmailLink(auth, emailToUse.trim().toLowerCase(), currentUrl);
    window.localStorage.removeItem('emailForSignIn');
    const user = cred.user;
    return {
      success: true,
      email: user.email || emailToUse,
      name: user.displayName || emailToUse.split('@')[0]
    };
  } catch (err: any) {
    console.error('[Firebase signInWithEmailLink Error]:', err);
    return { success: false, error: err.message || 'Verification token has expired or is invalid.' };
  }
}

/**
 * Initiates authentic Google OAuth popup sign-in with full state management
 */
export async function signInWithGoogleOAuth(): Promise<VerifyLinkResult> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    return {
      success: true,
      email: user.email || 'verified_google@gmail.com',
      name: user.displayName || (user.email ? user.email.split('@')[0] : 'Google User')
    };
  } catch (err: any) {
    console.error('[Firebase signInWithPopup Error]:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in window was closed. Please try again.' };
    }
    if (err.code === 'auth/popup-blocked') {
      return { success: false, error: 'Popup was blocked by your browser. Please allow popups or use Email Magic Link.' };
    }
    return { success: false, error: err.message || 'Google Sign-In failed.' };
  }
}

export { signOut };
