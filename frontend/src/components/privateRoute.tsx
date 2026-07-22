import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet,Navigate } from 'react-router-dom';
import type { RootState } from '../redux/store.js';

export default function privateRoute() {
  
  const {currentUser} = useSelector((state:RootState)=>state.user)
  
  return currentUser? <Outlet/> : <Navigate to= '/login'/>
  
}