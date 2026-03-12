import React, { useEffect, useState } from 'react';
import {
  ShieldIcon,
  CheckIcon,
  XIcon,
  UserPlusIcon,
  UsersIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  TrashIcon } from
'lucide-react';
import { AppRole, Permission, AuthUser } from '../types';
import { ROLE_LABELS, PERMISSION_LABELS, getCustomPermissions, saveCustomPermissions } from '../utils/auth';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  toggleUserActive,
  resetUserPassword } from
'../data/authData';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
const allRoles: AppRole[] = [
'administrador',
'advogado_total',
'advogado_senior',
'advogado_junior',
'atendente'];

const roleOptions = allRoles.map((r) => ({
  value: r,
  label: ROLE_LABELS[r]
}));
const permissionGroups: {
  label: string;
  permissions: Permission[];
}[] = [
{
  label: 'Dashboard',
  permissions: ['dashboard.view']
},
{
  label: 'Clientes',
  permissions: [
  'clients.view',
  'clients.create',
  'clients.edit',
  'clients.delete']

},
{
  label: 'Financeiro',
  permissions: [
  'financeiro.view',
  'financeiro.create',
  'financeiro.edit',
  'financeiro.delete']

},
{
  label: 'Calendário',
  permissions: [
  'calendar.view',
  'calendar.create',
  'calendar.edit',
  'calendar.delete']

},
{
  label: 'Relatórios',
  permissions: ['reports.view', 'reports.create']
},
{
  label: 'Administração',
  permissions: ['admin.roles', 'admin.users']
}];

type ActiveView = 'roles' | 'users';
export function AdminRolesPage() {
  const { user: currentUser } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('users');
  const [selectedRole, setSelectedRole] = useState<AppRole>('administrador');
  const [customPermissions, setCustomPermissions] = useState<Record<AppRole, Permission[]>>(getCustomPermissions);
  const [permSaveMsg, setPermSaveMsg] = useState('');
  // User management
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
  useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  // Create user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AppRole>('atendente');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  // Edit user form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<AppRole>('atendente');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  // Reset password form
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const refreshUsers = () => {
    setUsers(getAllUsers());
  };
  useEffect(() => {
    refreshUsers();
  }, []);
  const handleTogglePermission = (permission: Permission) => {
    const current = customPermissions[selectedRole] || [];
    const updated = current.includes(permission)
      ? current.filter((p) => p !== permission)
      : [...current, permission];
    const next = { ...customPermissions, [selectedRole]: updated };
    setCustomPermissions(next);
    saveCustomPermissions(next);
    setPermSaveMsg('Salvo!');
    setTimeout(() => setPermSaveMsg(''), 2000);
  };
  const rolePermissions = customPermissions[selectedRole] || [];
  const handleCreateUser = () => {
    setCreateError('');
    setCreateSuccess('');
    if (!newName.trim()) {
      setCreateError('Nome é obrigatório.');
      return;
    }
    if (!newEmail.trim()) {
      setCreateError('E-mail é obrigatório.');
      return;
    }
    if (!newPassword.trim()) {
      setCreateError('Senha é obrigatória.');
      return;
    }
    if (newPassword.length < 6) {
      setCreateError('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    const result = createUser(newName, newEmail, newPassword, newRole);
    if ('error' in result) {
      setCreateError(result.error);
      return;
    }
    setCreateSuccess(`Usuário "${result.user.name}" criado com sucesso!`);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('atendente');
    refreshUsers();
    setTimeout(() => {
      setIsCreateModalOpen(false);
      setCreateSuccess('');
    }, 1500);
  };
  const handleEditUser = () => {
    if (!editingUser) return;
    setEditError('');
    setEditSuccess('');
    if (!editName.trim()) {
      setEditError('Nome é obrigatório.');
      return;
    }
    if (!editEmail.trim()) {
      setEditError('E-mail é obrigatório.');
      return;
    }
    const result = updateUser(editingUser.id, {
      name: editName,
      email: editEmail,
      role: editRole
    });
    if ('error' in result) {
      setEditError(result.error);
      return;
    }
    setEditSuccess('Usuário atualizado com sucesso!');
    refreshUsers();
    setTimeout(() => {
      setIsEditModalOpen(false);
      setEditSuccess('');
      setEditingUser(null);
    }, 1500);
  };
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }
    if (
    confirm(
      'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.'
    ))
    {
      deleteUser(userId);
      refreshUsers();
    }
  };
  const openEditModal = (user: AuthUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditError('');
    setEditSuccess('');
    setIsEditModalOpen(true);
  };
  const handleToggleActive = (userId: string) => {
    toggleUserActive(userId);
    refreshUsers();
  };
  const handleRoleChange = (userId: string, role: string) => {
    updateUserRole(userId, role as AppRole);
    refreshUsers();
  };
  const handleResetPassword = () => {
    if (!selectedUserId || !resetPassword.trim()) return;
    if (resetPassword.length < 6) return;
    resetUserPassword(selectedUserId, resetPassword);
    setResetSuccess('Senha alterada com sucesso!');
    setResetPassword('');
    setTimeout(() => {
      setIsResetPasswordModalOpen(false);
      setResetSuccess('');
      setSelectedUserId(null);
    }, 1500);
  };
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
          Administração
        </h1>
        <p className="text-text-secondary">
          Gerencie usuários, cargos e permissões do sistema
        </p>
      </div>

      {/* View Toggle */}
      <div
        className="flex gap-2 animate-fade-in"
        style={{
          animationDelay: '50ms'
        }}>
        
        <Button
          variant={activeView === 'users' ? 'primary' : 'secondary'}
          icon={<UsersIcon className="w-5 h-5" />}
          onClick={() => setActiveView('users')}>
          
          Usuários
        </Button>
        <Button
          variant={activeView === 'roles' ? 'primary' : 'secondary'}
          icon={<ShieldIcon className="w-5 h-5" />}
          onClick={() => setActiveView('roles')}>
          
          Cargos e Permissões
        </Button>
      </div>

      {/* ===== USERS VIEW ===== */}
      {activeView === 'users' &&
      <div className="space-y-6 animate-fade-in">
          {/* Add User Button */}
          <div className="flex justify-end">
            <Button
            variant="primary"
            icon={<UserPlusIcon className="w-5 h-5" />}
            onClick={() => {
              setCreateError('');
              setCreateSuccess('');
              setIsCreateModalOpen(true);
            }}>
            
              Novo Usuário
            </Button>
          </div>

          {/* Users Table */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-text-secondary">
                      Nome
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-text-secondary">
                      Login / E-mail
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-text-secondary">
                      Cargo
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-text-secondary">
                      Status
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-text-secondary">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) =>
                <tr
                  key={u.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  
                      <td className="p-4">
                        <p className="font-medium text-text-primary">
                          {u.name}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-text-secondary font-mono">
                          {u.email}
                        </p>
                      </td>
                      <td className="p-4">
                        <select
                      value={u.role}
                      onChange={(e) =>
                      handleRoleChange(u.id, e.target.value)
                      }
                      className="px-3 py-1.5 rounded-lg glass border border-white/10 text-text-primary bg-transparent text-sm focus:outline-none focus:border-accent-blue/50 cursor-pointer">
                      
                          {roleOptions.map((opt) =>
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-dark-surface text-text-primary">
                        
                              {opt.label}
                            </option>
                      )}
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                      className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${u.active ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}
                          `}>
                      
                          {u.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-lg hover:bg-accent-blue/20 text-text-secondary hover:text-accent-blue transition-colors"
                        title="Editar usuário">
                        
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => handleToggleActive(u.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                        title={u.active ? 'Desativar' : 'Ativar'}>
                        
                            {u.active ?
                        <ToggleRightIcon className="w-5 h-5 text-accent-green" /> :

                        <ToggleLeftIcon className="w-5 h-5 text-accent-red" />
                        }
                          </button>
                          <button
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setResetPassword('');
                          setResetSuccess('');
                          setIsResetPasswordModalOpen(true);
                        }}
                        className="p-2 rounded-lg hover:bg-accent-blue/20 text-text-secondary hover:text-accent-blue transition-colors"
                        title="Redefinir senha">
                        
                            <KeyIcon className="w-4 h-4" />
                          </button>
                          {u.id !== currentUser?.id &&
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 rounded-lg hover:bg-accent-red/20 text-text-secondary hover:text-accent-red transition-colors"
                        title="Excluir usuário">
                        
                              <TrashIcon className="w-4 h-4" />
                            </button>
                      }
                        </div>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      {/* ===== ROLES VIEW ===== */}
      {activeView === 'roles' &&
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Role Selector */}
          <div className="glass rounded-2xl border border-white/10 p-4">
            <h3 className="text-sm font-medium text-text-secondary mb-4">
              Selecione um Cargo
            </h3>
            <div className="space-y-2">
              {allRoles.map((role) =>
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${selectedRole === role ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30' : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'}
                  `}>
              
                  <ShieldIcon className="w-5 h-5" />
                  <span className="font-medium text-sm">
                    {ROLE_LABELS[role]}
                  </span>
                </button>
            )}
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-accent-blue/20">
                  <ShieldIcon className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {ROLE_LABELS[selectedRole]}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {rolePermissions.length} permissões ativas
                    {permSaveMsg && (
                      <span className="ml-3 text-accent-green font-medium">
                        ✓ {permSaveMsg}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {permissionGroups.map((group) =>
              <div key={group.label}>
                    <h4 className="text-sm font-medium text-text-secondary mb-3">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.permissions.map((permission) => {
                    const hasPerm = rolePermissions.includes(permission);
                    return (
                      <button
                        key={permission}
                        onClick={() => handleTogglePermission(permission)}
                        className={`
                              flex items-center gap-3 p-3 rounded-xl border text-left w-full
                              transition-all duration-200 cursor-pointer
                              ${hasPerm ? 'bg-accent-green/10 border-accent-green/30 hover:bg-accent-green/20' : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'}
                            `}>
                        
                            <div
                          className={`
                                w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                                ${hasPerm ? 'bg-accent-green/20 text-accent-green' : 'bg-white/10 text-text-secondary'}
                              `}>
                          
                              {hasPerm ?
                          <CheckIcon className="w-4 h-4" /> :

                          <XIcon className="w-4 h-4" />
                          }
                            </div>
                            <span
                          className={`text-sm ${hasPerm ? 'text-text-primary' : 'text-text-secondary'}`}>
                          
                              {PERMISSION_LABELS[permission]}
                            </span>
                          </button>);

                  })}
                    </div>
                  </div>
              )}
              </div>
            </div>

            {/* Role Description */}
            <div className="glass rounded-xl border border-white/10 p-4">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Descrição do Cargo
              </h4>
              <p className="text-sm text-text-primary">
                {selectedRole === 'administrador' &&
              'Acesso total ao sistema, incluindo gestão de usuários, cargos e módulo financeiro.'}
                {selectedRole === 'advogado_total' &&
              'Acesso completo exceto ao módulo financeiro e administração de cargos.'}
                {selectedRole === 'advogado_senior' &&
              'Pode visualizar e editar clientes, calendário e relatórios. Não pode excluir registros.'}
                {selectedRole === 'advogado_junior' &&
              'Acesso básico a clientes e calendário. Pode criar eventos mas não pode gerar relatórios.'}
                {selectedRole === 'atendente' &&
              'Focado em cadastro e edição de clientes. Sem acesso a outras áreas do sistema.'}
              </p>
            </div>
          </div>
        </div>
      }

      {/* ===== CREATE USER MODAL ===== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Usuário"
        size="md">
        
        <div className="space-y-4">
          {createError &&
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-red/10 border border-accent-red/30">
              <XIcon className="w-5 h-5 text-accent-red flex-shrink-0" />
              <p className="text-sm text-accent-red">{createError}</p>
            </div>
          }
          {createSuccess &&
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/10 border border-accent-green/30">
              <CheckIcon className="w-5 h-5 text-accent-green flex-shrink-0" />
              <p className="text-sm text-accent-green">{createSuccess}</p>
            </div>
          }

          <Input
            label="Nome Completo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do usuário" />
          
          <Input
            label="E-mail / Login"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@escritorio.com" />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Senha
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 pr-12 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 transition-all" />
              
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                
                {showNewPassword ?
                <EyeOffIcon className="w-4 h-4" /> :

                <EyeIcon className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
          <Select
            label="Cargo"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AppRole)}
            options={roleOptions} />
          

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateUser}>
              Criar Usuário
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== EDIT USER MODAL ===== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuário"
        size="md">
        
        <div className="space-y-4">
          {editError &&
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-red/10 border border-accent-red/30">
              <XIcon className="w-5 h-5 text-accent-red flex-shrink-0" />
              <p className="text-sm text-accent-red">{editError}</p>
            </div>
          }
          {editSuccess &&
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/10 border border-accent-green/30">
              <CheckIcon className="w-5 h-5 text-accent-green flex-shrink-0" />
              <p className="text-sm text-accent-green">{editSuccess}</p>
            </div>
          }

          <Input
            label="Nome Completo"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Nome do usuário" />
          
          <Input
            label="E-mail / Login"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="email@escritorio.com" />
          
          <Select
            label="Cargo"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as AppRole)}
            options={roleOptions} />
          

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleEditUser}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== RESET PASSWORD MODAL ===== */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Redefinir Senha"
        size="sm">
        
        <div className="space-y-4">
          {resetSuccess &&
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/10 border border-accent-green/30">
              <CheckIcon className="w-5 h-5 text-accent-green flex-shrink-0" />
              <p className="text-sm text-accent-green">{resetSuccess}</p>
            </div>
          }

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showResetPassword ? 'text' : 'password'}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 pr-12 rounded-xl glass border border-white/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue/50 transition-all" />
              
              <button
                type="button"
                onClick={() => setShowResetPassword(!showResetPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                
                {showResetPassword ?
                <EyeOffIcon className="w-4 h-4" /> :

                <EyeIcon className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => setIsResetPasswordModalOpen(false)}>
              
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleResetPassword}
              disabled={resetPassword.length < 6}>
              
              Redefinir
            </Button>
          </div>
        </div>
      </Modal>
    </div>);

}