import React from 'react'
import Sidebar from '../../components/admin/Sidebar'

const Layout = ({children}) => {
  return (
  <>
  <div className='min-h-screen flex overflow-y-scroll'>
    <Sidebar/>
    <div className='flex-1'>
        {children}
    </div>
  </div>
  </>
  )
}

export default Layout