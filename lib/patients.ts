import { patientRecords, type Patient } from './data'
import { enrichPatient } from './rules'

export const patients: Patient[] = patientRecords.map(enrichPatient)
