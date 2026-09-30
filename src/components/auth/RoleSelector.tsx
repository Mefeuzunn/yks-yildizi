'use client';
import React from 'react';

export type Role = 'student' | 'teacher' | 'parent';

interface RoleSelectorProps {
  selectedRole: Role;
  onChange: (role: Role) => void;
  showParent?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onChange, showParent = false }) => {
  return (
    <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-5">
      <button
        type="button"
        onClick={() => onChange('student')}
        className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer border-0 ${
          selectedRole === 'student'
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 bg-transparent'
        }`}
      >
        Öğrenci Girişi
      </button>
      <button
        type="button"
        onClick={() => onChange('teacher')}
        className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer border-0 ${
          selectedRole === 'teacher'
            ? 'bg-slate-800 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 bg-transparent'
        }`}
      >
        Öğretmen Girişi
      </button>
    </div>
  );
};
