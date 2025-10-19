# LifeLens - AI-Assisted Financial Planning Platform

LifeLens is a modern Next.js 15 application that delivers an AI-assisted financial planning experience. The platform features an interactive enrollment journey, personalized insights, a learning hub, timeline tracking, and an always-on support system to help users navigate their financial future.

## 🌟 Features

- **Dynamic Quiz Flow**: Interactive single-question cards with progress tracking and hydration-safe persistence
- **Multi-Screen Experience**: Comprehensive app router experience including landing page, insights dashboard, timeline, learning hub, FAQ, and profile management
- **Persistent Local Caching**: Stores enrollment responses, insights, saved moments, chat history, and profile metadata
- **AI-Powered Chat**: Integration with Claude-style AI for context-aware financial guidance with "thinking" states
- **Smooth Animations**: Framer Motion transitions across screens with Tailwind 4 styling
- **Modern UI**: Pastel theming with glassmorphism accents and responsive design
- **Support Dock**: Quick access navigation and bottom navigation for primary workflows
- **Type-Safe Architecture**: Comprehensive TypeScript types for forms, insights, plans, chat, and profile data

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom design tokens
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Form Management**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Testing**: Vitest for unit tests
- **Code Quality**: ESLint & Prettier with import sorting

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SujayCh07/codelinc10.git
   cd codelinc10
   ```

2. Navigate to the application directory:
   ```bash
   cd codelinc10
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment configuration:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your API keys for optional integrations (Supabase, AWS Bedrock/Claude, OpenAI).

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the development server                   |
| `npm run build`     | Build the production bundle                    |
| `npm run start`     | Run the production build                       |
| `npm run lint`      | Run ESLint                                     |
| `npm run lint:fix`  | Lint with automatic fixes                      |
| `npm run typecheck` | Type-check the project with TypeScript         |
| `npm run format`    | Check Prettier formatting                      |
| `npm run format:write` | Format source files                         |
| `npm run test`      | Execute Vitest unit tests                      |

## 🧪 Testing

Unit tests cover the insight builder, chat reply logic, and local storage helpers. Run tests with:

```bash
npm run test
```

Vitest is configured with stubbed browser APIs for Node environment execution.

## 📁 Project Structure

```
codelinc10/
├── src/
│   ├── app/              # Next.js app router pages and API routes
│   ├── components/       # React components (screens, UI elements)
│   ├── lib/              # Utilities, types, hooks, and business logic
│   └── styles/           # Global CSS styles
├── public/               # Static assets
├── .github/              # GitHub workflows and CI configuration
└── [config files]        # TypeScript, Tailwind, ESLint, etc.
```

## 🔧 Environment Variables

The application supports the following optional environment variables:

- **Supabase** (for production database persistence):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

- **AWS Bedrock/Claude** (for AI plan and chat generation):
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `BEDROCK_MODEL_ID`

- **OpenAI** (optional for experimentation):
  - `OPENAI_API_KEY`

See `.env.local.example` for more details.

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

The CI workflow (`.github/workflows/ci.yml`) runs on all pushes and pull requests, executing:
- Dependency installation
- ESLint checks
- TypeScript type checking
- Unit tests

## 📚 Documentation

For more detailed information about the application architecture, components, and features, see the [application README](./codelinc10/README.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- SujayCh07

## 🙏 Acknowledgments

- Built with Next.js 15 and React 19
- UI components from Radix UI
- Styled with Tailwind CSS
- AI capabilities powered by Claude (AWS Bedrock)
