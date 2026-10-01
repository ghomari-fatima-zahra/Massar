import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('admin')`);
    await queryRunner.query(`CREATE TYPE "user_status_enum" AS ENUM ('actif','inactif')`);
    await queryRunner.query(`CREATE TYPE "driver_status_enum" AS ENUM ('disponible','conge','indisponible')`);
    await queryRunner.query(`CREATE TYPE "vehicle_category_enum" AS ENUM ('car','bus')`);
    await queryRunner.query(`CREATE TYPE "vehicle_status_enum" AS ENUM ('disponible','affecte','maintenance','indisponible')`);
    await queryRunner.query(`CREATE TYPE "mission_type_enum" AS ENUM ('interne','externe')`);
    await queryRunner.query(`CREATE TYPE "mission_status_enum" AS ENUM ('brouillon','en_attente','validee','rejetee','affectee','confirmee','en_cours','terminee','annulee')`);
    await queryRunner.query(`CREATE TYPE "notification_type_enum" AS ENUM ('success','info','warning','danger')`);
    await queryRunner.query(`CREATE TABLE "users" ("id" varchar(32) NOT NULL, "name" varchar(160) NOT NULL, "email" varchar(255) NOT NULL, "matricule" varchar(64) NOT NULL, "role" "user_role_enum" NOT NULL DEFAULT 'admin', "structure" varchar(160) NOT NULL, "status" "user_status_enum" NOT NULL DEFAULT 'actif', "password_hash" varchar(255) NOT NULL, "refresh_token_hash" varchar(255), "last_login_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "PK_users" PRIMARY KEY ("id"), CONSTRAINT "UQ_users_email" UNIQUE ("email"), CONSTRAINT "UQ_users_matricule" UNIQUE ("matricule"))`);
    await queryRunner.query(`CREATE TABLE "drivers" ("id" varchar(32) NOT NULL, "name" varchar(160) NOT NULL, "matricule" varchar(64) NOT NULL, "licence_categories" text[] NOT NULL, "licence_expiry" date NOT NULL, "phone" varchar(40) NOT NULL, "status" "driver_status_enum" NOT NULL DEFAULT 'disponible', "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "PK_drivers" PRIMARY KEY ("id"), CONSTRAINT "UQ_drivers_matricule" UNIQUE ("matricule"))`);
    await queryRunner.query(`CREATE TABLE "vehicles" ("id" varchar(32) NOT NULL, "category" "vehicle_category_enum" NOT NULL, "registration" varchar(32) NOT NULL, "gps" varchar(64) NOT NULL, "brand" varchar(80) NOT NULL, "model" varchar(80) NOT NULL, "type" varchar(80) NOT NULL, "capacity" integer NOT NULL, "status" "vehicle_status_enum" NOT NULL DEFAULT 'disponible', "last_inspection" date NOT NULL, "next_inspection" date NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "PK_vehicles" PRIMARY KEY ("id"), CONSTRAINT "UQ_vehicles_registration" UNIQUE ("registration"), CONSTRAINT "UQ_vehicles_gps" UNIQUE ("gps"))`);
    await queryRunner.query(`CREATE TABLE "missions" ("id" varchar(32) NOT NULL, "demandeur_id" varchar(32) NOT NULL, "type" "mission_type_enum" NOT NULL, "object" varchar(500) NOT NULL, "departure" varchar(160) NOT NULL, "destination" varchar(160) NOT NULL, "round_trip" boolean NOT NULL DEFAULT false, "departure_date" date NOT NULL, "return_date" date, "departure_time" time NOT NULL, "return_time" time, "passengers" integer NOT NULL, "vehicle_needed" boolean NOT NULL DEFAULT false, "vehicle_type" varchar(80), "status" "mission_status_enum" NOT NULL DEFAULT 'brouillon', "vehicle_id" varchar(32), "driver_id" varchar(32), "validated_by" varchar(32), "rejection_reason" text, "cancellation_reason" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz, CONSTRAINT "PK_missions" PRIMARY KEY ("id"), CONSTRAINT "FK_mission_demandeur" FOREIGN KEY ("demandeur_id") REFERENCES "users"("id") ON DELETE RESTRICT, CONSTRAINT "FK_mission_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL, CONSTRAINT "FK_mission_driver" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL, CONSTRAINT "FK_mission_validator" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE SET NULL)`);
    await queryRunner.query(`CREATE TABLE "mission_stops" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "mission_id" varchar(32) NOT NULL, "name" varchar(160) NOT NULL, "sequence" integer NOT NULL, CONSTRAINT "PK_mission_stops" PRIMARY KEY ("id"), CONSTRAINT "FK_stop_mission" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "notifications" ("id" varchar(32) NOT NULL, "title" varchar(180) NOT NULL, "body" text NOT NULL, "type" "notification_type_enum" NOT NULL, "read" boolean NOT NULL DEFAULT false, "user_id" varchar(32), "created_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "PK_notifications" PRIMARY KEY ("id"), CONSTRAINT "FK_notification_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "vehicle_telemetry" ("vehicle_id" varchar(32) NOT NULL, "odometer_km" integer NOT NULL, "fuel_level_pct" integer NOT NULL, "avg_consumption" numeric(7,2) NOT NULL, "health_score" integer NOT NULL, "brake_wear_pct" integer NOT NULL, "tire_wear_pct" integer NOT NULL, "oil_life_pct" integer NOT NULL, "next_service_km" integer NOT NULL, "next_service_days" integer NOT NULL, "updated_at" timestamptz NOT NULL DEFAULT now(), CONSTRAINT "PK_vehicle_telemetry" PRIMARY KEY ("vehicle_id"), CONSTRAINT "FK_telemetry_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "service_entries" ("id" varchar(64) NOT NULL, "vehicle_id" varchar(32) NOT NULL, "date" date NOT NULL, "km" integer NOT NULL, "type" varchar(160) NOT NULL, "center" varchar(160) NOT NULL, "cost_da" integer NOT NULL, CONSTRAINT "PK_service_entries" PRIMARY KEY ("id"), CONSTRAINT "FK_service_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "fuel_logs" ("id" varchar(64) NOT NULL, "vehicle_id" varchar(32) NOT NULL, "date" date NOT NULL, "liters" numeric(8,2) NOT NULL, "cost_da" integer NOT NULL, "km" integer NOT NULL, CONSTRAINT "PK_fuel_logs" PRIMARY KEY ("id"), CONSTRAINT "FK_fuel_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "monthly_usage" ("vehicle_id" varchar(32) NOT NULL, "month" date NOT NULL, "km" integer NOT NULL, CONSTRAINT "PK_monthly_usage" PRIMARY KEY ("vehicle_id","month"), CONSTRAINT "FK_monthly_vehicle" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE INDEX "IDX_mission_departure_date" ON "missions" ("departure_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_mission_status" ON "missions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_mission_stops_name" ON "mission_stops" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_read" ON "notifications" ("user_id", "read")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "monthly_usage"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fuel_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_telemetry"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mission_stops"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "missions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drivers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "mission_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "mission_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vehicle_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vehicle_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "driver_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
