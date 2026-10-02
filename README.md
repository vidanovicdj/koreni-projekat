# Informacioni sistem za udruženje građana u oblasti kulture

E-poslovni sistem za digitalizaciju rada udruženja građana u oblasti kulture: evidencija članova, zakazivanje proba i prisustva, zaduživanje nošnji iz fundusa i statistika. Sastoji se od mobilne aplikacije za članove i veb portala za administraciju.

> 🎓 Projekat je izrađen za potrebe završnog rada na Fakultetu organizacionih nauka, Univerzitet u Beogradu.

## Zašto ovaj projekat?

Udruženja ovog tipa evidenciju članova, proba i garderobe najčešće vode ručno, u sveskama i tabelama. To otežava uvid u prisustvo, stanje fundusa i zaduženja. Cilj rada je da se ti procesi prebace u jedinstven digitalni sistem koji je jednostavan za korišćenje i na terenu i u kancelariji.

## Funkcionalnosti

**Mobilna aplikacija (članovi)**
- prijava na nalog, lični dashboard
- pregled statistike prisustva
- uvid u zaduženu nošnju
- push notifikacije (npr. pri zaduživanju nošnje)

**Veb portal (rukovodstvo)**
- upravljanje članovima (dodavanje, izmena, grupisanje po ansamblima)
- mesečni kalendar proba i evidencija prisustva
- fundus nošnji po regionima, zaduživanje i razduživanje
- statistika po ulozi (prisustvo, popunjenost fundusa, prosečno trajanje zaduženja)
- dashboard sa upozorenjima i rođendanima

**Uloge i prava pristupa (RBAC)**

| Uloga | Prava |
|---|---|
| Administrator | upravlja nalozima i članovima, vidi sve statistike |
| Rukovodilac | evidencija prisustva, statistika dolazaka |
| Garderober | zaduživanje nošnji, statistika fundusa |
| Član | pregled sopstvenih podataka (mobilna aplikacija) |

Nema samoregistracije: naloge kreira administrator.

## Tehnologije

| Deo | Stek |
|---|---|
| Mobilna aplikacija | React Native (Expo), Expo Router, NativeWind, Zustand, TanStack Query, React Hook Form, Zod |
| Veb portal | Next.js (App Router), Tailwind CSS, shadcn/ui, TanStack Table/Query |
| Backend | Supabase (PostgreSQL, Auth, Row Level Security) |
| Notifikacije | Expo Push Service, Firebase Cloud Messaging |

## Struktura repozitorijuma

```
.
├── mobile/    # Expo aplikacija za članove
├── web/       # Next.js administrativni portal
└── backend/   # Supabase konfiguracija i migracije
```

## Pokretanje projekta

### Preduslovi
- Node.js [v24.21.0], npm
- Supabase nalog i Supabase CLI
- Android Studio / uređaj za testiranje (za mobilnu aplikaciju)

### 1. Kloniranje
```bash
git clone https://github.com/vidanovicdj/koreni-projekat.git
cd koreni-projekat
```

### 2. Backend (Supabase)
1. Kreiraj novi projekat na [supabase.com](https://supabase.com).
2. Poveži lokalni projekat i primeni šemu baze:
```bash
cd backend
supabase link --project-ref [PROJECT_REF]
supabase db push
```
3. Staff nalozi (administrator, rukovodilac, garderober) kreiraju se ručno kroz Supabase dashboard (*Authentication → Users*).

> Napomena: pošto je isključena opcija automatskog izlaganja tabela, za svaku tabelu je potrebno eksplicitno dodeliti `GRANT` privilegije ulozi `authenticated`. RLS politike same nisu dovoljne.

### 3. Promenljive okruženja

Vrednosti se nalaze u Supabase dashboardu: *Project Settings → API*.

**`web/.env.local`**

| Promenljiva | Opis |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase projekta |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | javni (anon) ključ |
| `SUPABASE_SERVICE_ROLE_KEY` | administratorski ključ, koristi se samo na serveru |

**`mobile/.env`**

| Promenljiva | Opis |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL Supabase projekta |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | javni (anon) ključ |

U oba foldera postoji `.env.example` koji treba kopirati:
```bash
cp .env.example .env.local   # web
cp .env.example .env         # mobile
```

### 4. Veb portal
```bash
cd web
npm install
npm run dev
```
Portal je dostupan na `http://localhost:3000`.

### 5. Mobilna aplikacija
```bash
cd mobile
npm install       
npx expo run:android
```
Aplikacija koristi `expo-dev-client`, pa se **ne može pokrenuti kroz Expo Go**.

### 6. Push notifikacije (opciono)
Za slanje notifikacija potrebno je podesiti Firebase Cloud Messaging (FCM V1) i otpremiti Google Service Account ključ preko `eas credentials`. Bez toga ostatak aplikacije radi normalno.

## Bezbednost
- Row Level Security je uključen na svim tabelama
- Pristup podacima je ograničen po ulogama (RBAC)
- `.env` fajlovi i ključevi su u `.gitignore` i nisu deo repozitorijuma
- `SUPABASE_SERVICE_ROLE_KEY` se koristi isključivo na serveru i nikada u mobilnoj aplikaciji

## Status projekta
Implementirane su sve planirane funkcionalnosti (autentifikacija, članovi, probe i prisustvo, fundus i zaduženja, statistika, push notifikacije). Projekat je akademski prototip i nije predviđen za produkciju bez dodatnog testiranja i bezbednosne revizije.

## Autor
Đurđa Vidanović
