"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CreditCard,
    GraduationCap,
    BarChart3,
    Menu,
    MoreHorizontal,
    Settings,
    LogOut,
    BookOpen
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface User {
    name: string;
    role: string;
}

interface SidebarContentProps {
    user: User;
    pathname: string;
    handleLogout: () => void;
    className?: string;
}

// Sidebar Content Component defined outside
const SidebarContent = ({ user, pathname, handleLogout, className }: SidebarContentProps) => {

    const navItems = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            roles: ['admin', 'teacher']
        },
        {
            href: '/dashboard/teachers',
            label: 'Teachers',
            icon: GraduationCap,
            roles: ['admin']
        },
        {
            href: '/dashboard/students',
            label: 'Students',
            icon: Users,
            roles: ['admin', 'teacher']
        },
        {
            href: '/dashboard/classes',
            label: 'Classes',
            icon: BookOpen,
            roles: ['admin']
        },
        {
            href: '/dashboard/attendance',
            label: 'Attendance',
            icon: CalendarCheck,
            roles: ['admin', 'teacher']
        },
        {
            href: '/dashboard/fees',
            label: 'Fee Management',
            icon: CreditCard,
            roles: ['admin']
        },
        {
            href: '/dashboard/reports',
            label: 'Report',
            icon: BarChart3,
            roles: ['admin']
        }
    ];

    if (!user) return null;

    return (
        <div className={cn("flex-1 py-6 flex flex-col gap-2 h-full", className)}>
            {/* Logo Section */}
            <div className="px-6 mb-8 mt-2">
                <div className="relative h-12 w-48">
                    <Image
                        src="/Logo.png"
                        alt="School LMS Logo"
                        fill
                        className="object-contain object-left brightness-0 invert"
                        priority
                        sizes="(max-width: 768px) 100vw, 200px"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 pl-4 flex-1">
                {navItems.map((item) => {
                    if (!item.roles.includes(user.role)) return null;

                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <div key={item.href} className="relative">
                            {isActive && (
                                <>
                                    {/* Curve Decoration Top */}
                                    <div className="absolute right-0 -top-8 w-8 h-8 bg-transparent z-10 box-content rounded-br-full shadow-[10px_10px_0_0_hsl(var(--background))]" />
                                    {/* Curve Decoration Bottom */}
                                    <div className="absolute right-0 -bottom-8 w-8 h-8 bg-transparent z-10 box-content rounded-tr-full shadow-[10px_-10px_0_0_hsl(var(--background))]" />
                                </>
                            )}
                            <Link href={item.href} className="block relative z-20">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-12 rounded-l-full rounded-r-none pl-6 text-base font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-background text-primary hover:bg-background shadow-sm"
                                            : "text-white hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn("mr-4 h-5 w-5", isActive ? "text-primary" : "text-white/80")} />
                                    {item.label}
                                </Button>
                            </Link>
                        </div>
                    );
                })}
            </nav>

            {/* Bottom Profile Dropup */}
            <div className="mt-auto px-4 pb-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full h-16 rounded-xl flex items-center justify-between px-3 hover:bg-white/10 text-white group transition-all duration-200">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-10 w-10 border-2 border-white/20">
                                    <AvatarImage src="" alt={user.name} />
                                    <AvatarFallback className="bg-white/20 text-white font-bold">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start truncate">
                                    <span className="text-sm font-semibold leading-none truncate w-full">{user.name}</span>
                                    <span className="text-xs text-white/70 leading-none mt-1 capitalize">{user.role}</span>
                                </div>
                            </div>
                            <MoreHorizontal className="h-5 w-5 text-white/70 group-hover:text-white flex-shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 mb-2 rounded-xl p-2" side="top" align="center" forceMount>
                        <DropdownMenuItem className="rounded-lg cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 rounded-lg cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default function Sidebar({ className }: { className?: string }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <>
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="rounded-full bg-primary text-white shadow-lg h-10 w-10 border border-white/20">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 w-72 bg-primary text-white">
                        <SheetTitle className="hidden">Navigation Menu</SheetTitle>
                        <div className="h-full flex flex-col pt-4">
                            <SidebarContent user={user} pathname={pathname} handleLogout={handleLogout} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className={cn("w-72 bg-primary min-h-full hidden md:flex flex-col rounded-r-[40px] my-4 ml-4 h-[calc(100vh-2rem)] shadow-2xl relative z-20", className)}>
                <SidebarContent user={user} pathname={pathname} handleLogout={handleLogout} />
            </div>
        </>
    );
}
