import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home.js'
import Signup from './pages/Signup.js'
import Login from './pages/Login.js'
import Profile from './pages/Profile.js'
import PrivateRoute from './components/privateRoute.js'
import ListingsPage from './pages/Listing.js'
import CreateListing from './pages/createListing.js'
import ListingDetail from './pages/listingDetails.js'
import MyListings from './pages/myListings.js'
import UpdateListing from './pages/updateListing.js'
import InquiriesPage from './pages/inquiryPage.js'
import AppointmentsPage from './pages/appointmentPage.js'
import WishlistPage from './pages/wishlistPage.js'
function App() {

  return (
    <>
     
        <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home/>}></Route>
            <Route path='/signup' element={<Signup/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/listings' element={<ListingsPage/>}></Route>
            <Route path='/listings/:id' element={<ListingDetail/>}></Route>
            <Route element={<PrivateRoute/>}>
              <Route path='/mylistings' element={<MyListings/>}></Route>
              <Route path='/listings/create' element={<CreateListing/>}></Route>
              <Route path='/listings/update/:id' element={<UpdateListing/>}></Route>
              <Route path='/profile' element={<Profile/>}></Route>
              <Route path='/appointments' element={<AppointmentsPage/>}></Route>
              <Route path='/inquiries' element={<InquiriesPage/>}></Route>
              <Route path='/wishlist' element={<WishlistPage/>}></Route>
            </Route>
        </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
