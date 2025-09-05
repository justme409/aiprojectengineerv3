# ProjectPro - Construction Project Management System

A production-grade web application and AI orchestration service for construction project management, built with Next.js 15, PostgreSQL, and LangGraph.

## 🚀 Features

### Core Functionality
- **Asset-Centric Architecture**: Unified data model with assets and relationships
- **AI-Powered Processing**: LangGraph orchestration for document analysis and project structuring
- **Quality Management**: HP/WP tracking, inspection lifecycle, compliance packs
- **Multi-Jurisdictional**: NSW, QLD, SA, TAS, VIC compliance configurations
- **Client Portal**: Restricted access for external stakeholders
- **Real-time Updates**: SSE streaming for AI processing status

### Technical Stack
- **Frontend**: Next.js 15 (App Router, TypeScript, TailwindCSS, shadcn/ui)
- **Backend**: PostgreSQL, Next.js Server Actions
- **AI Service**: Python FastAPI + LangGraph v10
- **Storage**: Azure Blob Storage with SAS URL generation
- **Authentication**: NextAuth.js with PostgreSQL adapter
- **Real-time**: Server-Sent Events (SSE)

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.11+
- PostgreSQL 14+
- Docker (optional)

### 1. Environment Setup
```bash
# Copy environment file and configure
cp .env.example .env.local

# Required environment variables:
DATABASE_URL="postgresql://username:password@localhost:5432/projectpro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
AZURE_STORAGE_ACCOUNT_NAME="your-account"
AZURE_STORAGE_ACCOUNT_KEY="your-key"
OPENAI_API_KEY="sk-..."
```

### 2. Database Setup
```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_DB=projectpro \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Or using docker-compose
docker-compose up -d db

# Run migrations
cd apps/web
pnpm db:migrate
```

### 3. Install Dependencies
```bash
# Install all dependencies
pnpm install

# Install Python dependencies
cd services/langgraph_server_v10
pip install -r requirements.txt
```

### 4. Start Services
```bash
# Terminal 1: Next.js App
cd apps/web
pnpm dev

# Terminal 2: LangGraph Service
cd services/langgraph_server_v10
uvicorn server.app:app --reload --port 8777

# Terminal 3: Database (if not using Docker)
# Make sure PostgreSQL is running
```

### 5. Access Application
- **Web App**: http://localhost:3000
- **Login**: Create account automatically with any email/password
- **LangGraph API**: http://localhost:8777/docs

## 📁 Project Structure

```
projectpro/
├── apps/web/                          # Next.js Application
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── (app)/                 # Protected routes
│   │   │   ├── (marketing)/           # Public routes
│   │   │   ├── auth/                  # Authentication
│   │   │   └── api/                   # API routes
│   │   ├── components/                # React components
│   │   │   ├── features/              # Feature-specific components
│   │   │   └── ui/                    # Reusable UI components
│   │   ├── lib/                       # Utilities and configurations
│   │   │   ├── actions/               # Server actions
│   │   │   ├── auth.ts                # NextAuth configuration
│   │   │   └── db/                    # Database utilities
│   │   └── types/                     # TypeScript definitions
│   ├── prisma/                        # NextAuth schema
│   └── package.json
├── services/langgraph_server_v10/     # AI Orchestration Service
│   ├── graphs/                        # LangGraph workflows
│   ├── prompts/                       # AI prompts
│   └── server/
│       ├── app.py                     # FastAPI application
│       └── requirements.txt
├── db/migrations/                     # Database migrations
└── docker-compose.yml                 # Docker setup
```

## 🎯 Key Features

### 1. Asset-Centric Data Model
All domain entities are modeled as assets with typed relationships:
```sql
-- Assets table with versioning and classification
CREATE TABLE assets (
  id uuid PRIMARY KEY,
  asset_uid uuid NOT NULL,
  type text NOT NULL, -- project, document, inspection_point, etc.
  content jsonb,      -- Type-specific data
  metadata jsonb,     -- AI-generated metadata
  -- ... other fields
);

-- Typed relationships between assets
CREATE TABLE asset_edges (
  from_asset_id uuid,
  to_asset_id uuid,
  edge_type text, -- PARENT_OF, IMPLEMENTS, EVIDENCES, etc.
  properties jsonb
);
```

### 2. AI-Powered Processing
LangGraph orchestrates document analysis and project structuring:
- **Document Extraction**: PDF/text processing with metadata extraction
- **Standards Analysis**: Automatic identification of applicable standards
- **WBS Generation**: Hierarchical work breakdown structure creation
- **ITP Templates**: Inspection and test plan generation
- **Real-time Streaming**: SSE updates during processing

### 3. Quality Management
Comprehensive quality assurance workflow:
- **Work Lot Register**: Track construction lots with HP/WP status
- **Hold/Witness Points**: SLA-tracked inspection points
- **ITP Management**: Templates and documents with endorsements
- **Compliance Packs**: Jurisdiction-specific configurations
- **Records Management**: RMP and delivery tracking

### 4. Multi-Jurisdictional Support
Pre-configured compliance packs for major Australian jurisdictions:
- **NSW**: TfNSW Q6 with primary testing requirements
- **QLD**: TMR MRTS50 with indicative conformance
- **SA**: DIT PC-QA2 with dual NCR modes
- **TAS**: DSG Section 160
- **VIC**: VicRoads Section 160 MW

## 🔧 API Endpoints

### Core APIs
- `GET/POST /api/v1/projects` - Project management
- `GET/POST /api/v1/assets` - Generic asset CRUD
- `GET/POST /api/v1/documents` - Document management

### Quality APIs
- `GET/POST /api/v1/projects/[id]/quality/lots` - Work lot management
- `GET/POST /api/v1/projects/[id]/quality/hold-witness` - HP/WP tracking
- `GET/POST /api/v1/projects/[id]/quality/itp` - ITP register
- `GET/POST /api/v1/projects/[id]/quality/records` - Records handover

### AI Processing
- `GET /api/v1/projects/[id]/ai/streams` - Processing status (SSE)
- `POST /api/v1/projects/[id]/ai/status` - Check processing status
- `POST /api/v1/projects/[id]/uploads/complete` - Trigger AI processing

### External Services
- `POST /api/v1/gis` - GIS/geo features management
- `GET /api/v1/reports` - Analytics and reporting
- `POST /api/v1/email/ingest` - Email processing and threading

## 🎨 UI Components

### Pages
- **Dashboard**: Project overview with metrics
- **Documents**: Upload and management interface
- **Quality Lots**: Work lot register with status tracking
- **Hold/Witness**: Inspection point management with SLA tracking
- **ITP Register**: Template and document management
- **Reports**: Analytics dashboard with export capabilities
- **WBS**: Hierarchical work breakdown structure
- **Client Portal**: Restricted stakeholder access

### Key Components
- **DocumentUpload**: Azure SAS URL generation and upload
- **WorkLotRegister**: Quality lot management with HP/WP integration
- **HoldWitnessRegister**: Inspection point tracking with notifications
- **WbsView**: Tree-based WBS visualization and editing
- **InspectionRegister**: IR management with scheduling

## 🚀 Deployment

### Production Setup
1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. **Storage**: Azure Blob Storage or AWS S3
3. **AI Service**: Deploy LangGraph service to cloud (Railway, Render, etc.)
4. **Web App**: Deploy Next.js to Vercel, Netlify, or cloud provider
5. **Environment**: Configure production environment variables

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual services
docker build -t projectpro-web ./apps/web
docker build -t projectpro-ai ./services/langgraph_server_v10
```

## 🔐 Security

### Authentication & Authorization
- **NextAuth.js**: Flexible authentication with multiple providers
- **RBAC**: Role-based access control with granular permissions
- **Session Management**: Secure session handling with database persistence

### Data Protection
- **PII Redaction**: Automatic redaction based on classification
- **Audit Logging**: Comprehensive audit trail for all operations
- **Azure Security**: Server-side SAS URL generation (no keys in client)

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Project Metrics**: Assets, inspections, tests, HSE incidents
- **Quality Reports**: Pass rates, NCR tracking, compliance status
- **Performance**: AI processing times, API response times
- **Usage Tracking**: User activity and feature utilization

### Export Capabilities
- **PDF Reports**: Generated quality and compliance reports
- **CSV Export**: Data export for external analysis
- **API Access**: Programmatic access to all data

## 🧪 Development

### Testing
```bash
# Run tests
pnpm test

# Database testing
pnpm db:test

# E2E testing
pnpm test:e2e
```

### Code Quality
- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Documentation**: See individual service READMEs
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for general questions

---

**Ready to revolutionize construction project management? 🚀**