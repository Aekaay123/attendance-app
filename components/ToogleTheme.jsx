import React from 'react'
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { toogleTheme } from '@/store/themeSlice';

 const ToogleTheme = () => {
    const dispath=useDispatch();
    const selectedTheme=useSelector((state)=>state.theme.mode);
  return (
    <div className='fixed top-2 right-4'>
        {selectedTheme==="light"?<Sun className='w-5 h-5' onClick={()=>dispath(toogleTheme())}/>:<Moon className='w-5 h-5' onClick={()=>dispath(toogleTheme())}/>}
    </div>
  )
}
export default ToogleTheme