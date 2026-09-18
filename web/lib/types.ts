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

export type AttendanceStatus = 'prisutan' | 'odsutan' | 'opravdano_odsutan'

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  prisutan: 'Prisutan',
  odsutan: 'Odsutan',
  opravdano_odsutan: 'Opravdano odsutan',
}

export type Rehearsal = {
  id: string
  ensemble_id: string
  rehearsal_datetime: string
  rehearsal_location: string | null
  created_by: string | null
}

export type Attendance = {
  id: string
  member_id: string
  rehearsal_id: string
  attendance_status: AttendanceStatus
  absence_reason: string | null
  recorded_by: string | null
  recorded_at: string
}

export type CostumeStatus = 'dostupno' | 'zaduzeno' | 'na_popravci' | 'van_upotrebe'
export type GenderType = 'musko' | 'zensko' | 'unisex'
export type AssignmentStatus = 'zaduzeno' | 'vraceno'

export const COSTUME_STATUS_LABELS: Record<CostumeStatus, string> = {
  dostupno: 'Dostupno',
  zaduzeno: 'Zaduženo',
  na_popravci: 'Na popravci',
  van_upotrebe: 'Van upotrebe',
}

export const GENDER_LABELS: Record<GenderType, string> = {
  musko: 'Muško',
  zensko: 'Žensko',
  unisex: 'Unisex',
}

export type CostumeItem = {
  id: string
  costume_item_name: string
  gender: GenderType | null
  region: string | null
  status: CostumeStatus
}

export type ResourceAssignment = {
  id: string
  costume_item_id: string
  member_id: string
  assigned_by: string | null
  borrow_date: string
  return_date: string | null
  status: AssignmentStatus
}