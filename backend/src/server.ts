// Load environment variables from .env file before anything else
import 'dotenv/config'
import { env } from './config/env'
import { createApp } from './app'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`Crewly backend running on http://localhost:${env.PORT}`)
  console.log(`Environment: ${env.NODE_ENV}`)
})
