import { useState } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import PrivateRoute from './components/privateRoute'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     
        <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home/>}></Route>
            <Route path='/signup' element={<Signup/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/about' element={<About/>}></Route>
            <Route element={<PrivateRoute/>}>
              <Route path='/profile' element={<Profile/>}></Route>
            </Route>
        </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
