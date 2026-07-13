import { useState } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import PrivateRoute from './components/privateRoute'
import ListingsPage from './pages/Listing'
import CreateListing from './pages/createListing'
import ListingDetail from './pages/listingDetails'
import MyListings from './pages/myListings'
import UpdateListing from './pages/updateListing'
import InquiriesPage from './pages/inquiryPage'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     
        <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home/>}></Route>
            <Route path='/signup' element={<Signup/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/listings' element={<ListingsPage/>}></Route>
            <Route path='/mylistings' element={<MyListings/>}></Route>
            <Route path='/listings/create' element={<CreateListing/>}></Route>
            <Route path='/listings/update/:id' element={<UpdateListing/>}></Route>
            <Route path='/listings/:id' element={<ListingDetail/>}></Route>
            <Route path='/about' element={<About/>}></Route>
            <Route path='/inquiries' element={<InquiriesPage/>}></Route>
            <Route element={<PrivateRoute/>}>
              <Route path='/profile' element={<Profile/>}></Route>
            </Route>
        </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
