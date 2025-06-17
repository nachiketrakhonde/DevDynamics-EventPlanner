const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const PLATFORMS = {
  railway: {
    name: "Railway",
    command: "railway deploy",
    setup: "railway login && railway link",
    docs: "https://docs.railway.app/deploy/deployments",
  },
  render: {
    name: "Render",
    command: "git push origin main",
    setup: "Connect your GitHub repo to Render dashboard",
    docs: "https://render.com/docs/deploy-node-express-app",
  },
  heroku: {
    name: "Heroku",
    command: "git push heroku main",
    setup: "heroku create your-app-name && heroku git:remote -a your-app-name",
    docs: "https://devcenter.heroku.com/articles/deploying-nodejs",
  },
  docker: {
    name: "Docker",
    command: "docker-compose up -d",
    setup: "docker build -t smart-event-planner .",
    docs: "https://docs.docker.com/get-started/",
  },
}

function checkPrerequisites() {
  console.log("🔍 Checking prerequisites...\n")

  // Check if .env file exists
  if (!fs.existsSync(".env")) {
    console.log("❌ .env file not found!")
    console.log("📝 Please create a .env file with your OpenWeatherMap API key")
    console.log("   OPENWEATHER_API_KEY=your_api_key_here\n")
    return false
  }

  // Check if API key is set
  const envContent = fs.readFileSync(".env", "utf8")
  if (!envContent.includes("OPENWEATHER_API_KEY") || envContent.includes("your_openweather_api_key_here")) {
    console.log("❌ OpenWeatherMap API key not configured!")
    console.log("🔑 Please set your API key in the .env file")
    console.log("   Get your free API key from: https://openweathermap.org/api\n")
    return false
  }

  console.log("✅ Prerequisites check passed!\n")
  return true
}

function showDeploymentOptions() {
  console.log("🚀 Smart Event Planner - Deployment Options\n")
  console.log("Choose your deployment platform:\n")

  Object.entries(PLATFORMS).forEach(([key, platform], index) => {
    console.log(`${index + 1}. ${platform.name}`)
    console.log(`   Setup: ${platform.setup}`)
    console.log(`   Deploy: ${platform.command}`)
    console.log(`   Docs: ${platform.docs}\n`)
  })
}

function deployToRailway() {
  console.log("🚂 Deploying to Railway...\n")

  try {
    console.log("Installing Railway CLI...")
    execSync("npm install -g @railway/cli", { stdio: "inherit" })

    console.log("Logging in to Railway...")
    execSync("railway login", { stdio: "inherit" })

    console.log("Deploying application...")
    execSync("railway up", { stdio: "inherit" })

    console.log("✅ Deployment to Railway completed!")
    console.log("🌐 Your app should be available at the Railway-provided URL")
  } catch (error) {
    console.error("❌ Railway deployment failed:", error.message)
    console.log("📖 Check Railway docs: https://docs.railway.app/deploy/deployments")
  }
}

function deployToRender() {
  console.log("🎨 Setting up Render deployment...\n")

  console.log("To deploy to Render:")
  console.log("1. Push your code to GitHub")
  console.log("2. Go to https://dashboard.render.com/")
  console.log('3. Click "New +" and select "Web Service"')
  console.log("4. Connect your GitHub repository")
  console.log("5. Use these settings:")
  console.log("   - Build Command: npm install")
  console.log("   - Start Command: npm start")
  console.log("   - Environment: Node")
  console.log("6. Add environment variables:")
  console.log("   - OPENWEATHER_API_KEY: your_api_key")
  console.log("   - NODE_ENV: production")
  console.log("\n✅ Render deployment setup complete!")
}

function deployToHeroku() {
  console.log("🟣 Deploying to Heroku...\n")

  try {
    console.log("Creating Heroku app...")
    const appName = `smart-event-planner-${Date.now()}`
    execSync(`heroku create ${appName}`, { stdio: "inherit" })

    console.log("Setting environment variables...")
    const envContent = fs.readFileSync(".env", "utf8")
    const apiKey = envContent.match(/OPENWEATHER_API_KEY=(.+)/)?.[1]

    if (apiKey) {
      execSync(`heroku config:set OPENWEATHER_API_KEY=${apiKey}`, { stdio: "inherit" })
      execSync("heroku config:set NODE_ENV=production", { stdio: "inherit" })
    }

    console.log("Deploying to Heroku...")
    execSync("git push heroku main", { stdio: "inherit" })

    console.log("✅ Deployment to Heroku completed!")
    console.log(`🌐 Your app is available at: https://${appName}.herokuapp.com`)
  } catch (error) {
    console.error("❌ Heroku deployment failed:", error.message)
    console.log("📖 Check Heroku docs: https://devcenter.heroku.com/articles/deploying-nodejs")
  }
}

function deployWithDocker() {
  console.log("🐳 Deploying with Docker...\n")

  try {
    console.log("Building Docker image...")
    execSync("docker build -t smart-event-planner .", { stdio: "inherit" })

    console.log("Starting application with Docker Compose...")
    execSync("docker-compose up -d", { stdio: "inherit" })

    console.log("✅ Docker deployment completed!")
    console.log("🌐 Your app is running at: http://localhost:3000")
    console.log("📊 Health check: http://localhost:3000/health")
  } catch (error) {
    console.error("❌ Docker deployment failed:", error.message)
    console.log("📖 Make sure Docker is installed and running")
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2)
  const platform = args[0]

  if (!checkPrerequisites()) {
    process.exit(1)
  }

  if (!platform) {
    showDeploymentOptions()
    return
  }

  switch (platform.toLowerCase()) {
    case "railway":
      deployToRailway()
      break
    case "render":
      deployToRender()
      break
    case "heroku":
      deployToHeroku()
      break
    case "docker":
      deployWithDocker()
      break
    default:
      console.log(`❌ Unknown platform: ${platform}`)
      showDeploymentOptions()
  }
}

if (require.main === module) {
  main()
}

module.exports = { checkPrerequisites, PLATFORMS }
