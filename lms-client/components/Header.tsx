"use client";

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const getPageTitle = () => {
        if (pathname === '/dashboard') return 'Dashboard';
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length - 1];
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <header className="h-24 bg-transparent flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Left: Page Title */}
            <div className="flex items-center gap-4">
                {/* Spacer for mobile menu button which is in sidebar */}
                <div className="w-8 md:hidden"></div>
                <h2 className="text-2xl font-bold text-gray-700 hidden md:block">
                    {getPageTitle()}
                </h2>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-6 pr-10 h-12 rounded-full bg-white border-none shadow-sm text-base placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-primary"
                />
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-3">
                {/* Notification Icons */}
                <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-500 h-10 w-10">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-500 h-10 w-10">
                    <MessageSquare className="h-5 w-5" />
                </Button>

                {/* Profile Pill */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 rounded-full bg-white p-1 pr-4 hover:bg-gray-50 flex items-center gap-2 shadow-sm ml-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={user.name} />
                                <AvatarFallback className="bg-orange-400 text-white font-bold">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-gray-700 hidden sm:block">{user.name.split(' ')[0]}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
