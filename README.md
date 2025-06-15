# Year Progress

A simple Discord app that shows how much of the current year has passed (in UTC).

-   **Invite link:** [Click here](https://discord.com/oauth2/authorize?client_id=1058434901080277134)
-   **Support server:** [Join here](https://discord.gg/jvWWH8nZxp)

## Running Locally

1. Clone this repo
2. Copy `.env.example` to `.env` and fill in the values
3. Create a `db/` folder with two files: `main.json` and `test.json`
4. Set both file contents to: `[]`
5. In `.env`, set `TESTING` to `"yes"` (uses `test.json`) or `"no"` (uses `main.json`)
6. Start the app:
    ```bash
    bun run .
    ```

## Docker

1. Pull the image: `sudo docker pull rkax/year-progress-app:latest`
2. Create a `.env` file (based on `.env.example`)
3. Run the container: `sudo docker run --env-file ./path/to/.env rkax/year-progress-app:latest`
