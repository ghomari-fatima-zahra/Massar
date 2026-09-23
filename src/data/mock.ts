export type Status =
  | 'brouillon' | 'en_attente' | 'validee' | 'rejetee'
  | 'affectee' | 'confirmee' | 'en_cours' | 'terminee' | 'annulee';

export type Role = 'employee' | 'fleet_manager' | 'admin';

export interface Mission {
  id: string;
  employee: string;
  matricule: string;
  structure: string;
  type: 'interne' | 'externe';
  object: string;
  departure: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  departureTime: string;
  returnTime: string;
  passengers: number;
  vehicleNeeded: boolean;
  vehicleType?: string;
  status: Status;
  vehicleId?: string;
  driverId?: string;
  createdAt: string;
  validatedBy?: string;
  rejectionReason?: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  brand: string;
  model: string;
  type: string;
  capacity: number;
  status: 'disponible' | 'affecte' | 'maintenance' | 'indisponible';
  lastInspection: string;
  nextInspection: string;
}

export interface Driver {
  id: string;
  name: string;
  matricule: string;
  licenceCategories: string[];
  licenceExpiry: string;
  phone: string;
  status: 'disponible' | 'en_mission' | 'conge' | 'indisponible';
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  matricule: string;
  role: Role;
  structure: string;
  status: 'actif' | 'inactif';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  read: boolean;
  createdAt: string;
}

export const STATUS_LABELS: Record<Status, string> = {
  brouillon: 'Brouillon',
  en_attente: 'En attente',
  validee: 'Validée',
  rejetee: 'Rejetée',
  affectee: 'Affectée',
  confirmee: 'Confirmée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

export const vehicles: Vehicle[] = [
  { id: 'V001', registration: '16-12345-DZ', brand: 'Toyota', model: 'Land Cruiser', type: 'SUV', capacity: 7, status: 'disponible', lastInspection: '2026-01-10', nextInspection: '2027-01-10' },
  { id: 'V002', registration: '16-98765-DZ', brand: 'Renault', model: 'Symbol', type: 'Berline', capacity: 5, status: 'disponible', lastInspection: '2026-02-15', nextInspection: '2027-02-15' },
  { id: 'V003', registration: '23-45678-DZ', brand: 'Hyundai', model: 'H1', type: 'Minibus', capacity: 12, status: 'maintenance', lastInspection: '2025-12-01', nextInspection: '2026-06-01' },
  { id: 'V004', registration: '16-11111-DZ', brand: 'Peugeot', model: '301', type: 'Berline', capacity: 5, status: 'affecte', lastInspection: '2026-03-01', nextInspection: '2027-03-01' },
  { id: 'V005', registration: '31-22222-DZ', brand: 'Mercedes', model: 'Vito', type: 'Minivan', capacity: 8, status: 'disponible', lastInspection: '2026-02-20', nextInspection: '2027-02-20' },
];

export const drivers: Driver[] = [
  { id: 'D001', name: 'Ahmed Bouchenak', matricule: 'DRV-0041', licenceCategories: ['B', 'D'], licenceExpiry: '2027-08-15', phone: '+213 555 01 23 45', status: 'disponible' },
  { id: 'D002', name: 'Yacine Hamidi', matricule: 'DRV-0017', licenceCategories: ['B'], licenceExpiry: '2027-03-20', phone: '+213 555 06 78 90', status: 'en_mission' },
  { id: 'D003', name: 'Mourad Chikhi', matricule: 'DRV-0029', licenceCategories: ['B', 'D'], licenceExpiry: '2028-01-10', phone: '+213 555 11 22 33', status: 'disponible' },
  { id: 'D004', name: 'Ibrahim Salhi', matricule: 'DRV-0058', licenceCategories: ['B'], licenceExpiry: '2026-11-20', phone: '+213 555 44 55 66', status: 'conge' },
];

export const missions: Mission[] = [
  {
    id: 'M2026-001',
    employee: 'Mohamed Salah Benali',
    matricule: 'ALT-2341',
    structure: 'Direction Régionale Oran',
    type: 'externe',
    object: 'Réunion technique – Installation fibre optique',
    departure: 'Alger',
    destination: 'Centre Télécom Tlemcen',
    departureDate: '2026-03-18',
    returnDate: '2026-03-19',
    departureTime: '07:00',
    returnTime: '18:00',
    passengers: 3,
    vehicleNeeded: true,
    vehicleType: 'SUV',
    status: 'en_attente',
    createdAt: '2026-03-12',
  },
  {
    id: 'M2026-002',
    employee: 'Fatima Zohra Khelif',
    matricule: 'ALT-1876',
    structure: 'Division Infrastructure',
    type: 'externe',
    object: 'Audit réseau cuivre – Zone Mitidja',
    departure: 'Alger',
    destination: 'Blida',
    departureDate: '2026-03-20',
    returnDate: '2026-03-20',
    departureTime: '08:30',
    returnTime: '17:00',
    passengers: 2,
    vehicleNeeded: true,
    vehicleType: 'Berline',
    status: 'en_attente',
    validatedBy: 'Rachid Aouad',
    createdAt: '2026-03-13',
  },
  {
    id: 'M2026-003',
    employee: 'Karim Meziani',
    matricule: 'ALT-3012',
    structure: 'Centre Télécom Tlemcen',
    type: 'externe',
    object: 'Formation technique FTTH – Centre Constantine',
    departure: 'Tlemcen',
    destination: 'Constantine',
    departureDate: '2026-03-22',
    returnDate: '2026-03-24',
    departureTime: '06:00',
    returnTime: '20:00',
    passengers: 1,
    vehicleNeeded: true,
    vehicleType: 'Berline',
    status: 'en_cours',
    validatedBy: 'Rachid Aouad',
    vehicleId: 'V002',
    driverId: 'D001',
    createdAt: '2026-03-14',
  },
  {
    id: 'M2026-004',
    employee: 'Amina Bouhired',
    matricule: 'ALT-0987',
    structure: 'Direction Générale',
    type: 'interne',
    object: 'Réunion de coordination – Direction Régionale Annaba',
    departure: 'Alger',
    destination: 'Annaba',
    departureDate: '2026-03-15',
    returnDate: '2026-03-15',
    departureTime: '09:00',
    returnTime: '16:00',
    passengers: 4,
    vehicleNeeded: true,
    vehicleType: 'SUV',
    status: 'en_cours',
    validatedBy: 'Rachid Aouad',
    vehicleId: 'V001',
    driverId: 'D002',
    createdAt: '2026-03-08',
  },
  {
    id: 'M2026-005',
    employee: 'Mohamed Salah Benali',
    matricule: 'ALT-2341',
    structure: 'Direction Régionale Oran',
    type: 'externe',
    object: 'Inspection antennes – Zone Sétif',
    departure: 'Oran',
    destination: 'Sétif',
    departureDate: '2026-03-05',
    returnDate: '2026-03-06',
    departureTime: '07:00',
    returnTime: '19:00',
    passengers: 2,
    vehicleNeeded: true,
    vehicleType: 'SUV',
    status: 'terminee',
    validatedBy: 'Rachid Aouad',
    vehicleId: 'V001',
    driverId: 'D003',
    createdAt: '2026-02-28',
  },
  {
    id: 'M2026-006',
    employee: 'Karim Meziani',
    matricule: 'ALT-3012',
    structure: 'Centre Télécom Tlemcen',
    type: 'interne',
    object: 'Visite client – Béjaïa',
    departure: 'Tlemcen',
    destination: 'Béjaïa',
    departureDate: '2026-03-28',
    returnDate: '2026-03-29',
    departureTime: '08:00',
    returnTime: '18:00',
    passengers: 2,
    vehicleNeeded: false,
    status: 'brouillon',
    createdAt: '2026-03-16',
  },
  {
    id: 'M2026-007',
    employee: 'Fatima Zohra Khelif',
    matricule: 'ALT-1876',
    structure: 'Division Infrastructure',
    type: 'externe',
    object: 'Déploiement fibre – Zone Boumerdès',
    departure: 'Alger',
    destination: 'Boumerdès',
    departureDate: '2026-03-12',
    returnDate: '2026-03-12',
    departureTime: '08:00',
    returnTime: '17:30',
    passengers: 3,
    vehicleNeeded: true,
    vehicleType: 'Minibus',
    status: 'rejetee',
    rejectionReason: 'Véhicule non disponible pour cette date. Veuillez reprogrammer la mission.',
    createdAt: '2026-03-09',
  },
];

export const users: AppUser[] = [
  { id: 'U001', name: 'Mohamed Salah Benali', email: 'ms.benali@dot.dz', matricule: 'ALT-2341', role: 'employee', structure: 'Direction Régionale Oran', status: 'actif', createdAt: '2022-06-15' },
  { id: 'U002', name: 'Fatima Zohra Khelif', email: 'fz.khelif@dot.dz', matricule: 'ALT-1876', role: 'employee', structure: 'Division Infrastructure', status: 'actif', createdAt: '2021-09-01' },
  { id: 'U003', name: 'Karim Meziani', email: 'k.meziani@dot.dz', matricule: 'ALT-3012', role: 'employee', structure: 'Centre Télécom Tlemcen', status: 'actif', createdAt: '2023-01-20' },
  { id: 'U004', name: 'Amina Bouhired', email: 'a.bouhired@dot.dz', matricule: 'ALT-0987', role: 'employee', structure: 'Direction Générale', status: 'actif', createdAt: '2020-03-10' },
  { id: 'U005', name: 'Rachid Aouad', email: 'r.aouad@dot.dz', matricule: 'ALT-0542', role: 'fleet_manager', structure: 'Direction Générale', status: 'actif', createdAt: '2019-11-05' },
  { id: 'U006', name: 'Nadia Ferdi', email: 'n.ferdi@dot.dz', matricule: 'ALT-0120', role: 'admin', structure: 'Direction Générale', status: 'actif', createdAt: '2018-07-22' },
  { id: 'U007', name: 'Omar Haddad', email: 'o.haddad@dot.dz', matricule: 'ALT-4100', role: 'employee', structure: 'Direction Régionale Constantine', status: 'inactif', createdAt: '2021-04-18' },
];

export const notifications: Notification[] = [
  { id: 'N001', title: 'Mission validée', body: 'Votre mission M2026-002 vers Blida a été validée.', type: 'success', read: false, createdAt: '2026-03-14T10:30:00' },
  { id: 'N002', title: 'Véhicule affecté', body: 'Un véhicule (Renault Symbol – 16-98765-DZ) a été affecté à votre mission M2026-003.', type: 'info', read: false, createdAt: '2026-03-14T14:15:00' },
  { id: 'N003', title: 'Mission rejetée', body: 'Votre mission M2026-007 a été rejetée. Motif : véhicule non disponible.', type: 'danger', read: false, createdAt: '2026-03-13T09:00:00' },
  { id: 'N004', title: 'Permis expirant bientôt', body: 'Le permis du conducteur Ibrahim Salhi expire le 20/11/2026.', type: 'warning', read: true, createdAt: '2026-03-12T08:00:00' },
  { id: 'N005', title: 'Inspection technique requise', body: 'Le véhicule Hyundai H1 (23-45678-DZ) doit être présenté à l\'inspection.', type: 'warning', read: true, createdAt: '2026-03-11T16:00:00' },
  { id: 'N006', title: 'Mission en cours', body: 'La mission M2026-004 vers Annaba est maintenant en cours.', type: 'info', read: true, createdAt: '2026-03-15T09:05:00' },
];

export const currentUsers: Record<Role, AppUser> = {
  employee: users[0],
  fleet_manager: users[4],
  admin: users[5],
};
