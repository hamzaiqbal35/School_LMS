"use client"
import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Loader2, Camera, Save, User, Mail, Shield, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface UpdatePayload {
    fullName?: string;
    avatar?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
}

interface AxiosErrorLike {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function ProfileView() {
    const { user, setUser } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
        currentPassword: ''
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type/size if needed
        if (file.size > 5 * 1024 * 1024) {
            setMsg({ type: 'error', text: 'Image size should be less than 5MB' });
            return;
        }

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await api.post('/upload/avatar', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Immediately update profile with new avatar URL
            await updateProfile({ avatar: res.data.url });
            setMsg({ type: 'success', text: 'Avatar updated successfully' });
        } catch (error) {
            console.error(error);
            setMsg({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setIsUploading(false);
        }
    };

    const updateProfile = async (data: UpdatePayload) => {
        try {
            const res = await api.put('/auth/update-profile', data);
            setUser(res.data); // Update global store
            return true;
        } catch (error: unknown) {
            const err = error as AxiosErrorLike;
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setIsLoading(true);
        const payload: UpdatePayload = {};

        if (formData.fullName !== user?.fullName) payload.fullName = formData.fullName;

        // Email Change Logic
        if (formData.email !== user?.email) {
            if (!formData.currentPassword) {
                setMsg({ type: 'error', text: 'Current password is required to change email' });
                setIsLoading(false);
                return;
            }
            payload.email = formData.email;
            payload.currentPassword = formData.currentPassword;
        }

        if (formData.password) payload.password = formData.password;

        if (Object.keys(payload).length === 0) {
            setMsg({ type: 'error', text: 'No changes made' });
            setIsLoading(false);
            return;
        }

        const success = await updateProfile(payload);
        if (success) {
            setMsg({ type: 'success', text: 'Profile updated successfully' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '', currentPassword: '' }));
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner relative bg-slate-100 mb-4">
                                {user?.avatar ? (
                                    <Image
                                        src={user.avatar}
                                        alt={user.fullName}
                                        fill
                                        className="object-cover"
                                        sizes="128px"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold">
                                        {user?.fullName?.charAt(0)}
                                    </div>
                                )}

                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute bottom-4 right-0 p-2.5 bg-white text-slate-600 rounded-full shadow-lg border border-slate-200 hover:text-blue-600 hover:border-blue-200 transition-all"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
                            <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Details
                        </h3>

                        {msg.text && (
                            <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                {msg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                                <span className="text-sm font-medium">{msg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            disabled={user?.role !== 'ADMIN'}
                                            className={`w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl font-medium transition-all ${user?.role === 'ADMIN' ? 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none' : 'bg-slate-50 text-slate-500 cursor-not-allowed'}`}
                                        />
                                    </div>
                                    {user?.role !== 'ADMIN' && <p className="text-[10px] text-slate-400 ml-1">Email cannot be changed</p>}
                                </div>
                            </div>

                            {(user?.role === 'ADMIN' && formData.email !== user?.email) && (
                                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl space-y-2">
                                    <label className="text-xs font-bold text-yellow-700 uppercase tracking-wider ml-1">Current Password (Required for Email Change)</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={formData.currentPassword}
                                            onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                            placeholder="Enter current password"
                                            className="w-full pl-10 pr-10 py-2.5 border border-yellow-200 rounded-xl font-medium focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-700 focus:outline-none"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <hr className="border-slate-100" />

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    Security
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="Leave blank to keep current"
                                                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
