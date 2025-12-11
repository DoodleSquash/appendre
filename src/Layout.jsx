import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, Plus, Search, Play, LogOut,
  User, Menu, X, ChevronDown, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser, logoutUser, redirectToLogin } from '@/lib/api/userApi';
import Logo from '@/components/ui/Logo';
import { createPageUrl } from '@/utils';
import { Toaster } from 'sonner';

// Paths without the navbar layout (hero pages, gameplay)
const noLayoutPaths = ['/', '/play', '/host-game', '/join-game'];

export default function Layout() {
  const location = useLocation();
  const path = location.pathname;
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href) => path === createPageUrl(href);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
    }
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = createPageUrl('Home');
  };

  // Skip navbar layout for specific paths
  if (noLayoutPaths.includes(path)) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <Outlet />
      </>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: 'Dashboard' },
    { name: 'Create Quiz', icon: Plus, href: 'CreateQuiz' },
    { name: 'Explore', icon: Search, href: 'Explore' },
    { name: 'Join Game', icon: Play, href: 'JoinGame' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />

      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl('Home')}>
              <Logo />
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.name} to={createPageUrl(item.href)}>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className="gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                      <span className="hidden sm:inline">{user.full_name || user.email?.split('@')[0]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Dashboard')} className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => redirectToLogin()}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-2 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={createPageUrl(item.href)}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive(item.href) ? 'secondary' : 'ghost'}
                          className="w-full justify-start gap-3"
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Button>
                      </Link>
                    ))}

                    {user && (
                      <>
                        <div className="border-t border-slate-200 my-4" />
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding for fixed nav */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}