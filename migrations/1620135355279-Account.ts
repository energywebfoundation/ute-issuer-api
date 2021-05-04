import { MigrationInterface, QueryRunner } from 'typeorm';

export class Account1620135355279 implements MigrationInterface {
    name = 'Account1620135355279';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "account" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "address" character varying NOT NULL, "privateKey" character varying NOT NULL, CONSTRAINT "UQ_83603c168bc00b20544539fbea6" UNIQUE ("address"), CONSTRAINT "UQ_16f60796fbd35c7f048f3421a0b" UNIQUE ("privateKey"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "account"`);
    }
}
