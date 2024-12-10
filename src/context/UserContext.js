import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (username, password) => {
    if (users.some(u => u.username === username)) {
      return false;
    }
    
    const newUser = {
      id: Date.now(),
      username,
      password,
      avatar: null,
      favorites: [],
      recentPlays: []
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserAvatar = (avatar) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, avatar };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => 
      u.id === currentUser.id ? updatedUser : u
    ));
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      login,
      register,
      logout,
      updateUserAvatar
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}