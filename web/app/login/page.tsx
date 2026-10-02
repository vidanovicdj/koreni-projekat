import Image from 'next/image'
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex">
      {/* Leva strana — slika, sad 60% širine */}
      <div className="hidden lg:block lg:w-[60%] relative bg-linen">
        <Image
          src="/login-pozadina.png"
          alt="Centar za nematerijalno kulturno nasleđe Koreni"
          fill
          sizes="60vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Desna strana — forma, sad 40% širine, pomerena udesno */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-linen px-6 lg:pr-8 lg:pl-6">
        <div className="bg-ink rounded-xl px-10 py-12 flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="h-1 w-28 rounded-full bg-[repeating-linear-gradient(45deg,#B08D3F_0_6px,#7A1F2B_6px_12px)]" />
          <h1 className="font-serif text-2xl text-linen">CNKN "Koreni"</h1>
          <form action={login} className="w-full flex flex-col gap-3 mt-2">
            <input
              name="email"
              type="email"
              placeholder="ime@udruzenje.rs"
              required
              className="h-10 rounded-md border border-gold bg-linen px-3 text-sm text-ink"
            />
            <input
              name="password"
              type="password"
              placeholder="lozinka"
              required
              className="h-10 rounded-md border border-gold bg-linen px-3 text-sm text-ink"
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              className="h-10 rounded-md bg-wine text-linen text-sm font-medium mt-1 hover:opacity-90 transition"
            >
              Prijavi se
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}