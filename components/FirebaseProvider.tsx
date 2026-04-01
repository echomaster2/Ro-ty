import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType, FirebaseUser, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  streak: number;
  lastActive: string;
  isPremium: boolean;
  avatarId: string;
  coins: number;
  inventory: string[];
  role: 'admin' | 'user';
  bio?: string;
  institution?: string;
  specialization?: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  calibrationData?: {
    style: string;
    strength: string;
    mission: string;
    dailyGoal: string;
    focusArea: string;
    impactPotential: string;
    calibratedAt: string;
  };
  birthDate?: string;
  birthTime?: string;
  studyGoals?: string;
  learningStyle?: string;
  mockExamHistory?: any[];
  lastMockExamScore?: number;
  plan?: 'free' | 'monthly' | 'annual' | 'lifetime';
  examDate?: string;
}

interface UserProgress {
  userId: string;
  completedTopicIds: string[];
  quizScores: Record<string, number>;
  unlockedModuleIdx: number;
  customFlashcards?: any[];
  lastInsight?: number;
  insightText?: string;
  vaultedScripts?: any[];
  assessmentReports?: any[];
  lastExamScore?: number;
  voiceRate?: number;
  voicePitch?: number;
  studyPlan?: {
    plan: string;
    generatedAt: string;
    goals: string;
    style: string;
  };
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  progress: UserProgress | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateProgress: (updates: Partial<UserProgress>) => Promise<void>;
  gainXP: (amount: number) => Promise<void>;
  isAdmin: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("FirebaseProvider: Loading timed out. Forcing loading to false.");
        setLoading(false);
      }
    }, 8000);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setProgress(null);
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      unsubscribeAuth();
      clearTimeout(safetyTimeout);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const progressDocRef = doc(db, 'progress', user.uid);

    const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName,
          photoURL: user.photoURL,
          xp: 0,
          level: 1,
          streak: 0,
          lastActive: new Date().toISOString(),
          isPremium: false,
          avatarId: 'default',
          coins: 500, // Starting bonus
          inventory: [],
          role: user.email === 'latchmanrav@gmail.com' ? 'admin' : 'user'
        };
        setDoc(userDocRef, initialProfile).catch(e => handleFirestoreError(e, OperationType.CREATE, 'users/' + user.uid));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users/' + user.uid));

    const unsubscribeProgress = onSnapshot(progressDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data() as UserProgress);
        setLoading(false);
      } else {
        // Initialize progress if it doesn't exist
        const initialProgress: UserProgress = {
          userId: user.uid,
          completedTopicIds: [],
          quizScores: {},
          unlockedModuleIdx: 0,
          customFlashcards: [],
          lastInsight: 0,
          insightText: '',
          vaultedScripts: [],
          assessmentReports: [],
          lastExamScore: 0
        };
        setDoc(progressDocRef, initialProgress).then(() => setLoading(false)).catch(e => {
          handleFirestoreError(e, OperationType.CREATE, 'progress/' + user.uid);
          setLoading(false);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'progress/' + user.uid);
      setLoading(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeProgress();
    };
  }, [user]);

  useEffect(() => {
    if (!profile || !user) return;

    const checkStreak = async () => {
      const now = new Date();
      const lastActive = new Date(profile.lastActive);
      
      // Reset time to midnight for comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Incremented streak
        await updateProfile({ 
          streak: (profile.streak || 0) + 1,
          lastActive: now.toISOString() 
        });
      } else if (diffDays > 1) {
        // Reset streak
        await updateProfile({ 
          streak: 1,
          lastActive: now.toISOString() 
        });
      } else if (diffDays === 0) {
        // Already active today, just update timestamp occasionally
        if (now.getTime() - lastActive.getTime() > 1000 * 60 * 60) { // Every hour
          await updateProfile({ lastActive: now.toISOString() });
        }
      }
    };

    checkStreak();
  }, [profile?.uid]);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + user.uid);
    }
  };

  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user) return;
    const progressDocRef = doc(db, 'progress', user.uid);
    try {
      await updateDoc(progressDocRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'progress/' + user.uid);
    }
  };

  const gainXP = async (amount: number) => {
    if (!profile || !user) return;
    
    // Streak multiplier: 10% bonus per day of streak, capped at 100% (2x)
    const streakBonus = Math.min((profile.streak || 0) * 0.1, 1);
    const totalAmount = Math.round(amount * (1 + streakBonus));
    
    const newXP = (profile.xp || 0) + totalAmount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    const updates: Partial<UserProfile> = { 
      xp: newXP,
      lastActive: new Date().toISOString() // Update last active on XP gain
    };
    
    if (newLevel > (profile.level || 1)) {
      updates.level = newLevel;
      updates.coins = (profile.coins || 0) + 100; // Level up bonus
    }
    
    await updateProfile(updates);
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'latchmanrav@gmail.com';

  return (
    <FirebaseContext.Provider value={{ user, profile, progress, loading, signIn, logout, updateProfile, updateProgress, gainXP, isAdmin }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
