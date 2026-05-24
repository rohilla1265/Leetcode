import React from 'react';
import {Routes,Route} from "react-router"
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../authSlice';
import { useEffect } from 'react';
import { Navigate } from 'react-router';
import AdminPanel from '../src/components/AdminPanel';
import ProblemPage from './pages/ProblemPage';
import AdminDashboard from './pages/AdminDashboard';
import UpdateList from './components/updatelist';
import UpdatePanel from './components/updatePane';
export default function App(){
  const {isAuthenticated,user} = useSelector((state)=>state.auth);
  // const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(checkAuth());
  },[isAuthenticated]);
  return(
    <Routes>
      <Route path="/" element={isAuthenticated ?<Home></Home>:<Navigate to="/signup" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<SignUp></SignUp>}></Route>
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      <Route 
        path="/admin" 
        element={
          user?.role === 'admin' ?
            // <AdminPanel />
            <AdminDashboard/> : 
            <Navigate to="/" />
        }
        ></Route>
        <Route path="/admin/create" element={
          user?.role === 'admin' ?
            // <AdminPanel />
            <AdminPanel/> : 
            <Navigate to="/" />
        } />
        <Route path="/admin/update" element={<UpdateList />} />
        <Route path="/admin/update/:id" element={<UpdatePanel/>} />
        <Route path="/admin/delete" element={<UpdateList/>} />
    </Routes>
)
}