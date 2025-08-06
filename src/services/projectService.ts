import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project, CreateProjectData } from '../types/Project';

const PROJECTS_COLLECTION = 'projects';

export class ProjectService {
  static async createProject(userId: string, data: CreateProjectData): Promise<string> {
    const projectData = {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);
    return docRef.id;
  }

  static async getUserProjects(userId: string): Promise<Project[]> {
    // Temporary: Simple query without ordering to avoid index requirement
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      } as Project);
    });

    // Sort in JavaScript instead of Firestore
    return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  static async getProject(projectId: string): Promise<Project | null> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      } as Project;
    }

    return null;
  }

  static async updateProject(projectId: string, data: Partial<CreateProjectData>): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  static async deleteProject(projectId: string): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(docRef);
  }

  static async saveProjectData(projectId: string, studioData: Project['studioData']): Promise<void> {
    await this.updateProject(projectId, { studioData });
  }
}