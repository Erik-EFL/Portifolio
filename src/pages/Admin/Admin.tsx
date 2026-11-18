import { useAdminAuthStore } from '@/store/admin-auth.store'
import { usePageMeta, type LocalizedPageMeta } from '@/seo'
import { SignInForm } from './Admin.sign-in'
import { AdminAccessGate } from './Admin.access'

// Painel não é conteúdo público: noindex em toda rota /admin.
const META: LocalizedPageMeta = {
  ptBR: {
    title: 'Painel | Erik Ferreira Lima',
    description: 'Área administrativa do portfólio.',
    noIndex: true
  },
  enUS: {
    title: 'Dashboard | Erik Ferreira Lima',
    description: 'Portfolio admin area.',
    noIndex: true
  }
}

const AdminPage = () => {
  const user = useAdminAuthStore(state => state.user)

  usePageMeta(META, '/admin')

  return user ? <AdminAccessGate user={user} /> : <SignInForm />
}

export default AdminPage
