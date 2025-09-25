/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ObjectPermissionDepartmentFix1732029352587 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
UPDATE object_permission
SET create_permission = 
    CASE
        WHEN create_permission = 'subdepartment' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE create_permission
    END,
    view_permission = 
    CASE
        WHEN view_permission = 'subdepartment' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE view_permission
    END,
    edit_permission = 
    CASE
        WHEN edit_permission = 'subdepartment' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE edit_permission
    END,
    delete_permission = 
    CASE
        WHEN delete_permission = 'subdepartment' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE delete_permission
    END,
    report_permission = 
    CASE
        WHEN report_permission = 'subdepartment' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE report_permission
    END,
    dashboard_permission = 
    CASE
        WHEN dashboard_permission = 'subdepartment' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE dashboard_permission
    END
WHERE 
    (create_permission = 'subdepartment' OR
     view_permission = 'subdepartment' OR
     edit_permission = 'subdepartment' OR
     delete_permission = 'subdepartment' OR
     report_permission = 'subdepartment' OR
     dashboard_permission = 'subdepartment')
    AND user_id IN (SELECT id FROM users WHERE department_id IS NULL);
    
UPDATE object_permission
SET create_permission = 
    CASE
        WHEN create_permission = 'department' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE create_permission
    END,
    view_permission = 
    CASE
        WHEN view_permission = 'department' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE view_permission
    END,
    edit_permission = 
    CASE
        WHEN edit_permission = 'department' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE edit_permission
    END,
    delete_permission = 
    CASE
        WHEN delete_permission = 'department' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE delete_permission
    END,
    report_permission = 
    CASE
        WHEN report_permission = 'department' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE report_permission
    END,
    dashboard_permission = 
    CASE
        WHEN dashboard_permission = 'department' 
             AND user_id IN (SELECT id FROM users WHERE department_id IS NULL) THEN 'responsible'
        ELSE dashboard_permission
    END
WHERE 
    (create_permission = 'department' OR
     view_permission = 'department' OR
     edit_permission = 'department' OR
     delete_permission = 'department' OR
     report_permission = 'department' OR
     dashboard_permission = 'department')
    AND user_id IN (SELECT id FROM users WHERE department_id IS NULL);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
