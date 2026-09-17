'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Role = 'admin' | 'rukovodilac' | 'garderober'

const NAV_ITEMS: { href: string; label: string; roles: Role[] }[] = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin', 'rukovodilac', 'garderober'] },
  { href: '/members', label: 'Članovi', roles: ['admin', 'rukovodilac', 'garderober'] },
  { href: '/rehearsals', label: 'Probe', roles: ['admin','rukovodilac'] },
  { href: '/closet', label: 'Fundus', roles: ['garderober'] },
  { href: '/assignments', label: 'Zaduženja', roles: ['garderober'] },
  { href: '/statistics', label: 'Statistika', roles: ['admin', 'rukovodilac'] },
  { href: '/accounts', label: 'Nalozi', roles: ['admin'] },
]

export default function Sidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-52 bg-ink flex flex-col py-5">
      <div className="px-4 mb-4">
        <p className="font-serif text-linen text-base">Igračko udruženje</p>
      </div>
      <div className="h-[3px] w-14 mx-4 mb-4 rounded-full bg-[repeating-linear-gradient(45deg,#B08D3F_0_5px,#7A1F2B_5px_10px)]" />
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm ${
                active
                  ? 'text-linen bg-gold/20 border-l-2 border-gold'
                  : 'text-linen/70 hover:text-linen'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 pt-4 border-t border-linen/10 mt-4">
        <p className="text-xs text-linen/60 mb-2">{name}</p>
        <button
          onClick={handleLogout}
          className="text-xs text-linen/70 hover:text-linen underline"
        >
          Odjavi se
        </button>
      </div>
    </aside>
  )
}