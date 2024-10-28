"use client"
import React, { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Users,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
} from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const Sidebar = () => {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/attendance", icon: ClipboardList, label: "Attendance" },
    { href: "/admin/employee", icon: Users, label: "Employees" },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar>
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                width={150}
                alt="profile pic"
                height={150}
                className="rounded-full"
              />
            ) : (
              <AvatarImage src={session?.user.image} alt="Profile" />
            )}
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">{session?.user?.name}</h2>
            <p className="text-xs text-gray-400">{session?.user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <div className="flex flex-col gap-y-4 overflow-x-hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                pathname === item.href ? "bg-gray-700" : "bg-gray-800"
              } flex items-center p-3 hover:bg-gray-700 transition-colors duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex gap-x-3 items-center justify-start text-red-400 hover:bg-gray-700 p-3 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden bg-black text-white fixed top-0 left-0 z-50">
            <Menu className="h-6 w-6" />
            <span className="sr-only ">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-gray-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 bg-gray-800 h-auto">
        <SidebarContent />
      </aside>
    </>
  )
}

export default Sidebar