import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser, signOut as supabaseSignOut } from '../supabase';

function MyAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {  
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  }

  async function signOut() {
    await supabaseSignOut();
    setUser(null);
  }

  if (!user) {
    return (
      <div>
        <p>Please sign in to continue</p>
      </div>
    );
  }

  return (
    <div>
      <div>Welcome, {user.email}!</div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

export default MyAuth;