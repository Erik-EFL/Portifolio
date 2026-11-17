import { useAdminAuthStore } from '@/store/admin-auth.store'
import { SignInForm } from './Admin.sign-in'
import { AdminAccessGate } from './Admin.access'

const AdminPage = () => {
  const user = useAdminAuthStore(state => state.user)

  return user ? <AdminAccessGate user={user} /> : <SignInForm />
}

export default AdminPage
