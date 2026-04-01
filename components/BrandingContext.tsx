
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export type AdminOverride = {
    value: string;
    type: 'image' | 'video' | 'text' | 'audio' | 'shop-item' | 'topic-media' | 'color';
    label?: string;
    metadata?: any;
};

interface BrandingContextType {
    overrides: Record<string, AdminOverride>;
    updateOverride: (id: string, value: string, type: AdminOverride['type'], label?: string, metadata?: any) => void;
    resetOverride: (id: string) => void;
    saveOverrides: () => Promise<void>;
    getOverride: (id: string, fallback: string) => string;
    isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [overrides, setOverrides] = useState<Record<string, AdminOverride>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Initial load from localStorage and Firestore
    useEffect(() => {
        const localSaved = localStorage.getItem('spi-admin-overrides');
        if (localSaved) {
            try {
                setOverrides(JSON.parse(localSaved));
            } catch (e) {
                console.error("Error parsing local overrides:", e);
            }
        }

        // Listen to Firestore for global overrides
        const brandingDocRef = doc(db, 'branding', 'overrides');
        const unsubscribe = onSnapshot(brandingDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.overrides) {
                    // Merge Firestore data first, then apply local overrides on top
                    // to prevent local changes from being overwritten by stale Firestore data
                    // before they are saved.
                    setOverrides(prev => ({ ...data.overrides, ...prev }));
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to branding overrides:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateOverride = useCallback((id: string, value: string, type: AdminOverride['type'], label?: string, metadata?: any) => {
        setOverrides(prev => ({
            ...prev,
            [id]: { value, type, label, metadata }
        }));
    }, []);

    const resetOverride = useCallback((id: string) => {
        setOverrides(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    const saveOverrides = useCallback(async () => {
        try {
            // Save to local storage for immediate persistence
            localStorage.setItem('spi-admin-overrides', JSON.stringify(overrides));
            
            // Save to Firestore for global persistence
            const brandingDocRef = doc(db, 'branding', 'overrides');
            await setDoc(brandingDocRef, {
                overrides,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid || 'system'
            }, { merge: true });
            
            console.log("Branding overrides saved to Firestore");
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'branding/overrides');
            throw error;
        }
    }, [overrides]);

    const getOverride = useCallback((id: string, fallback: string) => {
        return overrides[id]?.value || fallback;
    }, [overrides]);

    // Apply primary color override to CSS variable if it exists
    useEffect(() => {
        const primaryColor = overrides['brand-primary-color']?.value;
        if (primaryColor) {
            document.documentElement.style.setProperty('--gold-main', primaryColor);
        } else {
            document.documentElement.style.removeProperty('--gold-main');
        }
    }, [overrides]);

    return (
        <BrandingContext.Provider value={{ overrides, updateOverride, resetOverride, saveOverrides, getOverride, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
};
