import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  ApplicationFormData,
  GirlfriendApplication,
  ApplicationStatus,
  ApplicationStage,
} from '../types/application';

const APPLICATIONS_COLLECTION = 'applications';

// Helper to generate a human-friendly unique application ID
export function generateApplicationId(name: string): string {
  const prefix = 'GF';
  const cleanName = name.trim().slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'APP');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${cleanName}-${randomNum}`;
}

export async function submitApplication(
  formData: ApplicationFormData,
  compatibilityScore: number,
  uid: string
): Promise<{ id: string; application: GirlfriendApplication }> {
  const applicationId = generateApplicationId(formData.fullName);
  const docRef = doc(db, APPLICATIONS_COLLECTION, uid);

  const newApplication: GirlfriendApplication = {
    id: applicationId,
    fullName: formData.fullName.trim(),
    preferredName: formData.preferredName?.trim() || formData.fullName.trim().split(' ')[0],
    age: Number(formData.age) || 24,
    location: formData.location.trim(),
    email: formData.email.trim().toLowerCase(),
    uid,
    instagram: formData.instagram?.trim() || '',
    personality: formData.personality,
    communicationStyle: formData.communicationStyle,
    loveLanguage: formData.loveLanguage,
    personalityTraits: formData.personalityTraits || [],
    disagreementStyle: formData.disagreementStyle,
    communicationFrequency: formData.communicationFrequency,
    idealDate: formData.idealDate,
    jealousyLevel: Number(formData.jealousyLevel) || 3,
    whySelected: formData.whySelected.trim(),
    relationshipValue: formData.relationshipValue.trim(),
    somethingToKnow: formData.somethingToKnow.trim(),
    greenFlag: formData.greenFlag.trim(),
    redFlag: formData.redFlag.trim(),
    compatibilityScore,
    status: 'pending',
    currentStage: 'application_submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, newApplication);

  return { id: applicationId, application: newApplication };
}

export function subscribeToApplicantApplication(uid: string, onData: (application: GirlfriendApplication | null) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(doc(db, APPLICATIONS_COLLECTION, uid), (snapshot) => onData(snapshot.exists() ? ({ ...(snapshot.data() as GirlfriendApplication), id: snapshot.data().id } as GirlfriendApplication) : null), onError);
}

export function subscribeToApplications(
  onData: (applications: GirlfriendApplication[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, APPLICATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const apps: GirlfriendApplication[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        apps.push({
          ...(data as GirlfriendApplication),
          id: docSnap.id,
        });
      });
      onData(apps);
    },
    (err) => {
      console.error('Firestore real-time subscription error:', err);
      onError(err);
    }
  );
}

export async function updateApplicationStatusAndStage(
  id: string,
  status: ApplicationStatus,
  currentStage: ApplicationStage,
  adminNotes?: string,
  adminMessage?: string
): Promise<void> {
  const docRef = doc(db, APPLICATIONS_COLLECTION, id);
  const updateData: Record<string, any> = {
    status,
    currentStage,
    updatedAt: serverTimestamp(),
  };
  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }
  if (adminMessage !== undefined) updateData.adminMessage = adminMessage;
  await updateDoc(docRef, updateData);
}

export async function deleteApplicationDoc(id: string): Promise<void> {
  const docRef = doc(db, APPLICATIONS_COLLECTION, id);
  await deleteDoc(docRef);
}
