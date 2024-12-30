import React, { useState } from 'react';
import { Role, Permission, User, PermissionLevel, ResourceType } from '../../types/auth';
import '../../styles/admin/PermissionManager.css';

interface PermissionManagerProps {
  roles: Role[];
  users: User[];
  onRoleCreate: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onRoleUpdate: (roleId: string, permissions: Permission[]) => void;
  onUserRoleUpdate: (userId: string, roleIds: string[]) => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  roles,
  users,
  onRoleCreate,
  onRoleUpdate,
  onUserRoleUpdate,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  const resourceTypes: ResourceType[] = ['table', 'dashboard', 'user', 'system'];
  const permissionLevels: PermissionLevel[] = ['read', 'write', 'admin'];

  const handleCreateRole = () => {
    if (newRoleName.trim()) {
      onRoleCreate({
        name: newRoleName,
        permissions: [],
      });
      setNewRoleName('');
    }
  };

  const handlePermissionChange = (
    resource: ResourceType,
    level: PermissionLevel,
    checked: boolean
  ) => {
    if (!selectedRole) return;

    const newPermissions = checked
      ? [...selectedRole.permissions, { resource, level }]
      : selectedRole.permissions.filter(
          p => !(p.resource === resource && p.level === level)
        );

    onRoleUpdate(selectedRole.id, newPermissions);
  };

  return (
    <div className="permission-manager">
      <div className="roles-section">
        <h2>角色管理</h2>
        <div className="role-create">
          <input
            type="text"
            value={newRoleName}
            onChange={e => setNewRoleName(e.target.value)}
            placeholder="輸入新角色名稱"
          />
          <button onClick={handleCreateRole}>創建角色</button>
        </div>
        <div className="role-list">
          {roles.map(role => (
            <div
              key={role.id}
              className={`role-item ${selectedRole?.id === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              {role.name}
            </div>
          ))}
        </div>
      </div>

      {selectedRole && (
        <div className="permissions-section">
          <h3>{selectedRole.name} 權限設置</h3>
          <table className="permissions-table">
            <thead>
              <tr>
                <th>資源</th>
                {permissionLevels.map(level => (
                  <th key={level}>{level}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resourceTypes.map(resource => (
                <tr key={resource}>
                  <td>{resource}</td>
                  {permissionLevels.map(level => (
                    <td key={`${resource}-${level}`}>
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions.some(
                          p => p.resource === resource && p.level === level
                        )}
                        onChange={e => handlePermissionChange(resource, level, e.target.checked)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 