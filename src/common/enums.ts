export enum UserRole {
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIF = 'actif',
  INACTIF = 'inactif',
}

export enum DriverStatus {
  DISPONIBLE = 'disponible',
  CONGE = 'conge',
  INDISPONIBLE = 'indisponible',
}

export enum DriverEffectiveStatus {
  DISPONIBLE = 'disponible',
  EN_MISSION = 'en_mission',
  CONGE = 'conge',
  INDISPONIBLE = 'indisponible',
}

export enum VehicleCategory {
  CAR = 'car',
  BUS = 'bus',
}

export enum VehicleStatus {
  DISPONIBLE = 'disponible',
  AFFECTE = 'affecte',
  MAINTENANCE = 'maintenance',
  INDISPONIBLE = 'indisponible',
}

export enum MissionType {
  INTERNE = 'interne',
  EXTERNE = 'externe',
}

export enum MissionStatus {
  BROUILLON = 'brouillon',
  EN_ATTENTE = 'en_attente',
  VALIDEE = 'validee',
  REJETEE = 'rejetee',
  AFFECTEE = 'affectee',
  CONFIRMEE = 'confirmee',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee',
}

export enum LicenceCategory {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
}
