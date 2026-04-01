
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseData as initialCourseData, Module } from '../data/courseContent';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface CourseContextType {
    courseData: Module[];
    updateModule: (moduleId: string, updatedModule: Partial<Module>) => void;
    updateTopic: (moduleId: string, topicId: string, updatedTopic: any) => void;
    saveCourse: () => Promise<void>;
    isLoading: boolean;
    lastSaved: Date | null;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courseData, setCourseData] = useState<Module[]>(initialCourseData);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load course data from Firestore on mount
    useEffect(() => {
        const courseDocRef = doc(db, 'content', 'course_data');
        
        const unsubscribe = onSnapshot(courseDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.modules) {
                    setCourseData(data.modules);
                    if (data.updatedAt) {
                        setLastSaved(data.updatedAt.toDate());
                    }
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to course data:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateModule = useCallback((moduleId: string, updatedModule: Partial<Module>) => {
        setCourseData(prev => prev.map(m => m.id === moduleId ? { ...m, ...updatedModule } : m));
    }, []);

    const updateTopic = useCallback((moduleId: string, topicId: string, updatedTopic: any) => {
        setCourseData(prev => prev.map(m => {
            if (m.id === moduleId) {
                return {
                    ...m,
                    topics: m.topics.map(t => t.id === topicId ? { ...t, ...updatedTopic } : t)
                };
            }
            return m;
        }));
    }, []);

    const saveCourse = async () => {
        try {
            const courseDocRef = doc(db, 'content', 'course_data');
            await setDoc(courseDocRef, {
                modules: courseData,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid || 'system'
            }, { merge: true });
            setLastSaved(new Date());
            console.log("Course data saved to Firestore");
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'content/course_data');
            throw error;
        }
    };

    return (
        <CourseContext.Provider value={{ courseData, updateModule, updateTopic, saveCourse, isLoading, lastSaved }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourse must be used within a CourseProvider');
    }
    return context;
};
