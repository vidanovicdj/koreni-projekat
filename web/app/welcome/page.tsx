// Privremena stranica dok se ne napravi mobilna app

export default function DobrodoslicaPage() {
  return (
    <div className="min-h-screen bg-linen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-xl text-ink mb-3">Dobrodošli!</h1>
        <p className="text-sm text-ink/70">
          Vaš nalog je kreiran. Uskoro ćete moći da postavite lozinku direktno u mobilnoj aplikaciji
          — za sada, kontaktirajte administratora udruženja za pristup.
        </p>
      </div>
    </div>
  )
}