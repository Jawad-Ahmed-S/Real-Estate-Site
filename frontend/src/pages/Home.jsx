import React from 'react';
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import Header from '../components/header';
import Hero from '../components/hero'
import Slider from '../components/homeslider'
import Footer from '../components/footer';
export default function Home() {
  return (
    <>
    <Header/>
    <Hero/>
    <Slider/>
    <Footer/>
    
    </>
  );
}