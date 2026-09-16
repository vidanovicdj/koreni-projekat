export type MemberStatus = 'aktivan' | 'neaktivan' | 'suspendovan'
export type MemberDiscount = 0 | 50 | 100

export const STATUS_LABELS: Record<MemberStatus, string> = {
  aktivan: 'Aktivan',
  neaktivan: 'Neaktivan',
  suspendovan: 'Suspendovan',
}

export const DISCOUNT_LABELS: Record<MemberDiscount, string> = {
  0: 'Bez popusta',
  50: '50% popusta',
  100: '100% popusta',
}

export type Ensemble = {
  id: string
  ensemble_name: string
}

export type Member = {
  id: string
  member_name: string
  member_surname: string
  date_of_birth: string | null
  place_of_birth: string | null
  citizen_id: string | null
  residence: string | null
  passport_no: string | null
  profession: string | null
  phone_number: string | null
  admission_date: string
  termination_date: string | null
  status: MemberStatus
  status_date: string
  category: MemberDiscount
  ensemble_id: string | null
}