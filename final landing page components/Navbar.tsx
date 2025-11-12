'use client';
import { Menu } from 'lucide-react';
import LogoImage from '../src/assets/icons/logo.svg';

interface NavbarProps {
  user?: any;
  loading?: boolean;
  signOut?: () => void;
}

export const Navbar = ({ user, loading, signOut }: NavbarProps) => {
  const handleGetForFree = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/sign-in';
    }
  };

  return (
    <div className="bg-black">
      <div className="px-4">
    <div className="container bg-black">
      <div className="py-4 flex items-center justify-between">

      <div className="relative">
        <div className='absolute w-full top-2 bottom-0 bg-[linear-gradient(to_right,#F7AABE,#B57CEC,#E472D1)] blur-md '></div>

      <LogoImage className="h-12 w-12 relative mt-1"/>
      </div>
      <div className='border border-white border-opacity-30 h-10 w-10 inline-flex justify-center items-center rounded-lg sm:hidden'>

      <Menu className="text-white w-6 h-6" />
      </div>
      <nav className='text-white gap-6 items-center hidden sm:flex'>

        <a href="#features" className='text-opacity-60 text-white hover:text-opacity-100 transition scroll-smooth' >Features</a>
        <a href="#pricing" className='text-opacity-60 text-white hover:text-opacity-100 transition scroll-smooth'>Pricing</a>
        <a href="#faqs" className='text-opacity-60 text-white hover:text-opacity-100 transition scroll-smooth'>FAQs</a>
        <a href="/dashboard" className='text-opacity-60 text-white hover:text-opacity-100 transition'>Dashboard</a>
        {user ? (
          <button
            onClick={signOut}
            className='text-opacity-60 text-white hover:text-opacity-100 transition'
          >
            Sign Out
          </button>
        ) : (
          <a href="/sign-in" className='text-opacity-60 text-white hover:text-opacity-100 transition'>Sign In</a>
        )}
        <button 
          onClick={handleGetForFree}
          className='bg-white py-2 px-4 rounded-lg text-black hover:bg-gray-100 transition'
        >
          Get for free
        </button>
      </nav>

      </div>




    </div>
    </div>
    </div>
  )
};