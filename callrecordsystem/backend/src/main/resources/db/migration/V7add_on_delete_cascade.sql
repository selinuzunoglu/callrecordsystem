   ALTER TABLE user_permission
   DROP CONSTRAINT user_permission_user_id_fkey,
   ADD CONSTRAINT user_permission_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

   ALTER TABLE user_logs
   DROP CONSTRAINT user_logs_user_id_fkey,
   ADD CONSTRAINT user_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;