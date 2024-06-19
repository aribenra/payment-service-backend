import { SqlReader } from 'node-sql-reader';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceMigration1687103657626 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const sqlFile = SqlReader.readSqlFile(
      './src/infrastructure/db/migrations/sql/ServiceInitialMigration.sql',
    );

    for (const query of sqlFile) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "Services";`);
  }
}
