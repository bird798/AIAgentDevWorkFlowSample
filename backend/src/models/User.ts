export interface User {
  id: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  createdAt: Date;
}

// 인메모리 사용자 저장소 (실제 환경에서는 DB로 교체)
const users: Map<string, User> = new Map();

export function findUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.get(id);
}

export function createUser(data: Omit<User, 'id' | 'createdAt'>): User {
  const user: User = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
  users.set(user.id, user);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const user = users.get(id);
  if (!user) return undefined;
  const updated = { ...user, ...updates };
  users.set(id, updated);
  return updated;
}
