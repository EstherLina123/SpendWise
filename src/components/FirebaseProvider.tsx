import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, Transaction, Category, Budget, OperationType, FirestoreErrorInfo } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  signIn: () => Promise<void>;
  signUpEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  handleFirestoreError: (error: unknown, operationType: OperationType, path: string | null) => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const authInstance = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance.currentUser?.uid,
      email: authInstance.currentUser?.email,
      emailVerified: authInstance.currentUser?.emailVerified,
      isAnonymous: authInstance.currentUser?.isAnonymous,
      tenantId: authInstance.currentUser?.tenantId,
      providerInfo: authInstance.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Test connection
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
           if(error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
          }
        }

        const profileDoc = doc(db, 'users', user.uid);
        const snap = await getDoc(profileDoc);
        
        if (!snap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            currency: 'USD',
            createdAt: new Date(),
          };
          await setDoc(profileDoc, {
            ...newProfile,
            createdAt: new Date() // Firestore timestamp
          });
          setProfile(newProfile);

          // Seed Categories
          const defaultCategories = [
            { name: 'Food', icon: '🍔', color: '#ff4b2b', type: 'expense' },
            { name: 'Transport', icon: '🚗', color: '#3182ce', type: 'expense' },
            { name: 'Rent', icon: '🏠', color: '#805ad5', type: 'expense' },
            { name: 'Salary', icon: '💰', color: '#38a169', type: 'income' },
            { name: 'Freelance', icon: '💻', color: '#d69e2e', type: 'income' },
            { name: 'Shopping', icon: '🛍️', color: '#e53e3e', type: 'expense' },
            { name: 'Groceries', icon: '🛒', color: '#ed8936', type: 'expense' },
            { name: 'Entertainment', icon: '🍿', color: '#b83280', type: 'expense' },
          ];

          for (const cat of defaultCategories) {
            const catRef = doc(collection(db, 'categories'));
            await setDoc(catRef, { ...cat, userId: user.uid });
          }
        } else {
          const data = snap.data();
          setProfile({
            ...data,
            createdAt: data.createdAt.toDate(),
          } as UserProfile);
        }
      } else {
        setProfile(null);
        setTransactions([]);
        setCategories([]);
        setBudgets([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch Transactions
    const qTransactions = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubTransactions = onSnapshot(qTransactions, 
      (snap) => {
        setTransactions(snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
        } as Transaction)));
      }, 
      (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
    );

    // Fetch Categories
    const qCategories = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
    );
    const unsubCategories = onSnapshot(qCategories, 
      (snap) => {
        setCategories(snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Category)));
      }, 
      (err) => handleFirestoreError(err, OperationType.LIST, 'categories')
    );

    // Fetch Budgets
    const qBudgets = query(
      collection(db, 'budgets'),
      where('userId', '==', user.uid)
    );
    const unsubBudgets = onSnapshot(qBudgets, 
      (snap) => {
        setBudgets(snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        } as Budget)));
      }, 
      (err) => handleFirestoreError(err, OperationType.LIST, 'budgets')
    );

    return () => {
      unsubTransactions();
      unsubCategories();
      unsubBudgets();
    };
  }, [user]);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpEmail = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
    
    // Explicitly create profile to ensure displayName is correct
    const profileDoc = doc(db, 'users', res.user.uid);
    await setDoc(profileDoc, {
      uid: res.user.uid,
      email: email,
      displayName: name,
      currency: 'USD',
      createdAt: new Date()
    });
  };

  const signInEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      profile,
      loading,
      transactions,
      categories,
      budgets,
      signIn,
      signUpEmail,
      signInEmail,
      logOut,
      handleFirestoreError
    }}>
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
