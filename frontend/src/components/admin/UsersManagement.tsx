import { useState, useEffect } from 'react'
import { Button, Input, Modal, Pagination } from '@/components/ui'
import { api } from '@/services/api'
import toast, { Toaster } from 'react-hot-toast'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  name?: string
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
  updated_at?: string
  is_active?: boolean
  orders_count?: number
  profiles_count?: number
}

interface Profile {
  id: string
  slug: string
  profile_name: string
  is_published: boolean
  created_at: string
}

interface UserFormData {
  email: string
  first_name: string
  last_name: string
  role: 'user' | 'admin' | 'super_admin'
  password?: string
  confirmPassword?: string
}

function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  })
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showProfilesModal, setShowProfilesModal] = useState(false)
  const [userProfiles, setUserProfiles] = useState<Profile[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [search, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users', {
        params: {
          search,
          page: currentPage,
          limit: itemsPerPage
        }
      })
      
      setUsers(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
      setTotalUsers(response.data.pagination.total)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({ email: '', first_name: '', last_name: '', role: 'user', password: '', confirmPassword: '' })
    setShowPasswordFields(true)
    setShowModal(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      password: '',
      confirmPassword: ''
    })
    setShowPasswordFields(false)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar contraseñas si se están cambiando
    if ((showPasswordFields || formData.password) && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    
    if ((showPasswordFields || formData.password) && formData.password && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    try {
      const submitData = { ...formData }
      delete submitData.confirmPassword
      
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, submitData)
        toast.success('Usuario actualizado exitosamente')
      } else {
        await api.post('/admin/users', submitData)
        toast.success('Usuario creado exitosamente')
      }
      setShowModal(false)
      setShowPasswordFields(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar usuario')
    }
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    try {
      await api.delete(`/admin/users/${userToDelete.id}`)
      toast.success('Usuario eliminado exitosamente')
      setShowDeleteModal(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar usuario')
    }
  }

  const handleViewMemorial = async (user: User) => {
    try {
      setLoadingProfiles(true)
      setSelectedUser(user)
      
      const response = await api.get(`/admin/users/${user.id}/profiles`)
      const profiles = response.data.data
      
      if (profiles && profiles.length > 0) {
        if (profiles.length === 1) {
          // Si solo hay un perfil, abrirlo directamente
          const profile = profiles[0]
          if (profile.is_published && profile.slug) {
            window.open(`/memorial/${profile.slug}`, '_blank')
          } else {
            toast.error('El perfil no está publicado')
          }
        } else {
          // Si hay múltiples perfiles, mostrar el modal
          setUserProfiles(profiles)
          setShowProfilesModal(true)
        }
      } else {
        toast.error('No se encontraron perfiles para este usuario')
      }
    } catch (error: any) {
      toast.error('Error al obtener información de los perfiles')
    } finally {
      setLoadingProfiles(false)
    }
  }

  const handleOpenProfile = (profile: Profile) => {
    if (profile.is_published && profile.slug) {
      window.open(`/memorial/${profile.slug}`, '_blank')
    } else {
      toast.error('Este perfil no está publicado')
    }
  }



  const getRoleBadge = (role: string) => {
    const styles = {
      user: 'bg-gray-100 text-gray-800',
      admin: 'bg-blue-100 text-blue-800',
      super_admin: 'bg-purple-100 text-purple-800'
    }
    
    const labels = {
      user: 'Usuario',
      admin: 'Admin',
      super_admin: 'Super Admin'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600 mt-1">{totalUsers} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate}>
            Crear Usuario
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
            <p className="text-gray-500">No se encontraron usuarios con el filtro aplicado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.orders_count || 0} órdenes
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.profiles_count || 0} perfiles
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          Editar
                        </Button>
                        
                        {(user.profiles_count || 0) > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewMemorial(user)}
                            disabled={loadingProfiles}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {loadingProfiles ? 'Cargando...' : 'Ver Memorial'}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          {/* Botón para mostrar campos de contraseña en edición */}
          {editingUser && !showPasswordFields && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordFields(true)}
                className="w-full"
              >
                Cambiar Contraseña
              </Button>
            </div>
          )}
          
          {/* Campos de contraseña */}
          {(showPasswordFields || !editingUser) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Nueva Contraseña' : 'Contraseña'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={!editingUser}
                  placeholder="Repetir contraseña"
                />
              </div>
              
              {editingUser && (
                <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                  ⚠️ Dejar en blanco para mantener la contraseña actual
                </div>
              )}
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          

          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.name}</strong>?
            Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Perfiles de Usuario */}
      <Modal
        isOpen={showProfilesModal}
        onClose={() => setShowProfilesModal(false)}
        title={`Perfiles de ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Selecciona el perfil que deseas ver:
          </p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{profile.profile_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      profile.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.is_published ? 'Publicado' : 'Borrador'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenProfile(profile)}
                  disabled={!profile.is_published}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Ver Perfil
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowProfilesModal(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Toaster para notificaciones */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default UsersManagement