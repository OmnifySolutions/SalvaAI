ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS widget_config JSONB DEFAULT '{
  "primary_color": "#2563eb",
  "user_bubble_color": "#2563eb",
  "ai_bubble_color": "#f3f4f6",
  "logo_url": null,
  "header_title": "",
  "button_label": "",
  "greeting_enabled": false,
  "greeting_text": "",
  "show_branding": true
}'::jsonb;
