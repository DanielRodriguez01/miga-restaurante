import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import { ToastProvider } from './ui';
import Login from './screens/Login';
import ClientApp from './screens/Client';
import AdminApp from './screens/Admin';

const SESSION_KEY = 'miga.session';

function Shell() {
  const { state, actions } = useStore();
  const [sessionId, setSessionId] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  });

  const user = state.users.find((candidate) => candidate.id === sessionId) || null;

  useEffect(() => {
    try {
      if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* sessionStorage puede estar bloqueado */
    }
  }, [sessionId]);

  const login = (nextUser) => {
    setSessionId(nextUser.id);
    window.scrollTo({ top: 0 });
  };

  const register = (data) => {
    const nextUser = actions.addUser({ ...data, role: 'client' });
    setSessionId(nextUser.id);
    return nextUser;
  };

  const logout = () => {
    setSessionId(null);
    window.scrollTo({ top: 0 });
  };

  if (!user) {
    return <Login onLogin={login} onRegister={register} />;
  }

  if (user.role === 'admin') {
    return <AdminApp key={user.id} user={user} onLogout={logout} />;
  }

  return <ClientApp key={user.id} user={user} onLogout={logout} />;
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </StoreProvider>
  );
}
