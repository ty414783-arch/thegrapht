# Security & Coding Rules

- **RULE 1 (CRITICAL):** Do **NEVER** read, inspect, print, or access `.env` files (including `/root/thegrapht/.env` or any other `.env` files containing secrets or database passwords). All required environment variables should be obtained from other context, system variables, or default placeholders, never by inspecting the secret environment files.
