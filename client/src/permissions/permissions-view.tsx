// ============================================================================
// PREMIUM PERMISSIONS & ACCESS CONTROL
// Unified management for users, roles and security policies
// ============================================================================

import React, { useState } from 'react';
import {
    Users,
    Shield,
    Lock,
    Search,
    Plus,
    UserPlus,
    ShieldAlert,
    Activity,
    Mail,
    Key,
    ChevronRight,
    MoreHorizontal,
    Trash2,
    Edit3
} from 'lucide-react';
import { UserManagement } from './user-management';
import { RoleManagement } from './role-management';

export const PermissionsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'security'>('users');

    // Sample data for rendering components
    const [users] = useState<any[]>([
        { id: '1', email: 'admin@nxvms.io', firstName: 'System', lastName: 'Administrator', role: 'Super Admin', status: 'active', createdAt: new Date() },
        { id: '2', email: 'j.doe@example.com', firstName: 'John', lastName: 'Doe', role: 'Operator', status: 'active', createdAt: new Date() },
        { id: '3', email: 's.smith@example.com', firstName: 'Sarah', lastName: 'Smith', role: 'Viewer', status: 'inactive', createdAt: new Date() },
    ]);

    const roles = ['Super Admin', 'Operator', 'Viewer', 'Installer'];

    return (
        <div className="h-full flex flex-col bg-dark-950 overflow-hidden">
            {/* Dynamic Header */}
            <div className="p-8 bg-dark-900/50 backdrop-blur-2xl border-b border-white/5 flex flex-col gap-8 z-10 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-600 rounded-2xl shadow-xl shadow-purple-500/20">
                                <Lock size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none">Security Console</h1>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.3em] mt-2">Identity & Access Governance</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                        {[
                            { id: 'users', icon: Users, label: 'User Directory' },
                            { id: 'roles', icon: Shield, label: 'Access Policies' },
                            { id: 'security', icon: ShieldAlert, label: 'System Audit' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                        ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/20'
                                        : 'text-dark-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-white/5">
                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'users' && (
                        <div className="space-y-10">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-black text-white uppercase tracking-widest">Operator Management</h2>
                                    <span className="text-xs text-dark-500 font-bold">Authorized personnel with system access</span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Find user..."
                                            className="bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-purple-500/50 outline-none transition-all w-64 shadow-inner"
                                        />
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">
                                        <UserPlus size={14} />
                                        Create Profile
                                    </button>
                                </div>
                            </div>

                            <div className="bg-dark-900/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden p-8">
                                <UserManagement
                                    users={users}
                                    roles={roles}
                                    onAddUser={async () => { }}
                                    onDeleteUser={async () => { }}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="space-y-10">
                            <div className="flex flex-col px-2">
                                <h2 className="text-lg font-black text-white uppercase tracking-widest">Privilege Architect</h2>
                                <span className="text-xs text-dark-500 font-bold">Define granular capabilities for camera and playback access</span>
                            </div>

                            <div className="bg-dark-900/40 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden p-8">
                                <RoleManagement />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="flex flex-col items-center justify-center py-20 gap-8 opacity-20">
                            <ShieldAlert size={64} className="text-purple-500" />
                            <div className="text-center">
                                <h3 className="text-xl font-black text-white uppercase tracking-[0.4em]">Audit Vault</h3>
                                <p className="text-sm font-bold text-dark-400 uppercase tracking-widest mt-2 px-10">Tamper-proof logs of all system interactions and configuration changes</p>
                            </div>
                            <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-not-allowed">
                                Accessing Restricted Zone...
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
