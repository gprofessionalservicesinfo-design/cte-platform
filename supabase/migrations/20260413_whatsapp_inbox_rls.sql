-- Allow authenticated admin users to read WhatsApp conversations via anon key
-- (needed for client-side realtime in the admin inbox)

CREATE POLICY "admins_can_read_wa_conversations"
  ON whatsapp_conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Enable Realtime for the WhatsApp conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_conversations;
