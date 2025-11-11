import { Instagram, X, Linkedin, Youtube } from 'lucide-react';

export const Footer = () => {
  return(
    <footer className='py-5 bg-black text-white/60 border-t border-white/20'>
    <div className="container">
      <div className='flex flex-col gap-5 sm:flex-row sm:justify-between'>
        <div className="text-center"> 2024 Eldora UI All rights are reserved</div>
        <ul className='flex justify-center gap-2.5'>
          <li><Instagram className="w-6 h-6" /></li>
          <li><X className="w-6 h-6" /></li>
          <li><Linkedin className="w-6 h-6" /></li>
          <li><Youtube className="w-6 h-6" /></li>
        </ul>
      </div>

    </div>
    </footer>
  )
};