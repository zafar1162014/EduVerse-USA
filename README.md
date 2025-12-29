# EduVerse USA - NLP Chatbot for International Students

> This is an NLP course project that demonstrates core Natural Language Processing concepts through a practical, AI-powered study assistant.

## Project Overview

This project was built as part of an NLP (Natural Language Processing) course to demonstrate how conversational AI systems work. The chatbot helps international students with guidance on U.S. university admissions, including:

- University application requirements and deadlines
- Statement of Purpose (SOP) writing tips
- Scholarship and funding opportunities
- Test preparation (GRE, TOEFL, IELTS)
- Visa guidance (F-1, J-1)

---

## How the Project Was Built

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  - Chat Interface with real-time streaming                  │
│  - User authentication (Google + Email)                     │
│  - Conversation history management                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Edge Function (Backend)                    │
│  - Receives user messages                                   │
│  - Applies system prompt (NLP behavior rules)               │
│  - Streams AI responses back to client                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Gateway (LLM)                          │
│  - Google Gemini 2.5 Flash model                            │
│  - Processes natural language queries                       │
│  - Generates contextual responses                           │
└─────────────────────────────────────────────────────────────┘
```

### Development Tools

- **React + Vite** - Modern web development framework
- **Supabase** - Backend-as-a-Service for database and auth
- **Cloud Hosting** - Hosting and edge functions

---

## NLP Approach & Fine-Tuning

Since we're using a pre-trained Large Language Model (LLM), we don't train it from scratch. Instead, we use **prompt engineering** and **system prompts** to customize its behavior.

### Key NLP Concepts Implemented

| Concept | Implementation |
|---------|----------------|
| **Intent Classification** | System prompt instructs the model to identify query types (admissions, scholarships, SOP, tests, visa) |
| **Named Entity Recognition** | Model extracts entities like university names, test scores, deadlines |
| **Context Management** | Full conversation history is sent with each request for multi-turn dialogue |
| **Domain Restriction** | System prompt strictly limits responses to U.S. education topics only |
| **Response Grounding** | Model is instructed to avoid speculation and stick to verified information |

### System Prompt (Fine-Tuning via Instructions)

The core NLP behavior is defined in `supabase/functions/chat/index.ts`:

```javascript
const SYSTEM_PROMPT = `You are EduVerse USA, an expert NLP-based AI study assistant 
**strictly focused** on U.S. higher education guidance for international students.

**CRITICAL SCOPE RESTRICTION:**
You MUST ONLY answer questions related to:
- U.S. university admissions and applications
- Statement of Purpose (SOP) and essay writing
- Scholarships, financial aid, and assistantships
...

**OFF-TOPIC HANDLING:**
If a user asks about ANYTHING outside U.S. education, you MUST politely decline...
```

This approach is called **instruction tuning** - we guide the model's behavior through detailed prompts rather than modifying model weights.

### Standalone NLP Pipeline (Python)

For academic documentation, we also include Python notebooks that demonstrate classical NLP techniques:

| Notebook | Description |
|----------|-------------|
| `01_preprocessing.ipynb` | Text cleaning, tokenization, lemmatization |
| `02_intent_classification.ipynb` | TF-IDF + Logistic Regression for intent detection |
| `03_named_entity_recognition.ipynb` | Rule-based NER with regex and gazetteers |
| `04_context_management.ipynb` | Dialogue state tracking concepts |
| `05_rag_retrieval.ipynb` | Retrieval-Augmented Generation basics |
| `06_response_generation.ipynb` | Response composition techniques |

---

## Technologies & Libraries Used

### Frontend
| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Styling |
| Shadcn/UI | Component library |
| React Router | Page navigation |
| React Markdown | Rendering formatted AI responses |
| React Hook Form + Zod | Form validation |

### Backend
| Service | Purpose |
|---------|---------|
| Supabase | Database (PostgreSQL) + Authentication |
| Edge Functions | Serverless backend logic |
| AI Gateway | Access to Google Gemini LLM |

### NLP Pipeline (Python - Standalone)
| Library | Purpose |
|---------|---------|
| NLTK | Text preprocessing |
| Scikit-learn | Intent classification (TF-IDF + ML) |
| SpaCy | NER (optional advanced usage) |

---

## How to Clone and Run Locally

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/EduVerse-USA.git
cd EduVerse-USA
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Step 4: Build for Production (Optional)

```bash
npm run build
```

---

## Configuration

### Environment Variables

The following variables are configured automatically:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase public API key |

### Backend (Edge Functions)

The AI chat functionality requires an API key that is auto-provisioned.

### Google Authentication (Optional)

To enable Google Sign-In:
1. Create OAuth credentials in Google Cloud Console
2. Configure in the backend settings

---

## Project Structure

```
EduVerse-USA/
├── src/
│   ├── components/          # UI components
│   │   ├── ChatInterface.tsx    # Main chat UI
│   │   ├── ChatMessage.tsx      # Message bubble component
│   │   ├── ChatSidebar.tsx      # Conversation history
│   │   └── Header.tsx           # App header
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication logic
│   ├── hooks/
│   │   ├── useChat.ts           # Chat + streaming logic
│   │   └── useConversations.ts  # History management
│   ├── pages/
│   │   ├── Index.tsx            # Home page
│   │   ├── Auth.tsx             # Login/Signup page
│   │   └── Settings.tsx         # User settings
│   └── index.css                # Global styles
├── supabase/
│   └── functions/
│       └── chat/
│           └── index.ts         # AI chat backend
├── python/                      # Standalone NLP modules
│   ├── preprocessing.py
│   ├── intent_classification.py
│   ├── ner.py
│   └── ...
├── notebooks/                   # Jupyter notebooks for documentation
│   ├── 01_preprocessing.ipynb
│   └── ...
└── README.md
```

---

## Security Features

- Row-Level Security (RLS) on all database tables
- Users can only access their own conversations
- Passwords validated with strict requirements
- Session-based authentication

---

## Features Summary

- Real-time AI chat with streaming responses
- Email/Password authentication
- Google OAuth login
- Persistent chat history
- Dark/Light mode toggle
- Mobile responsive design
- Password reset functionality
- Markdown rendering in responses
- Domain-restricted responses (U.S. education only)

---

## Author

This project was developed as a Final Year Project for an NLP course, demonstrating practical applications of conversational AI in education technology.

---

## References

- [React Documentation](https://react.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [NLTK Book](https://www.nltk.org/book/)
- [Scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)
