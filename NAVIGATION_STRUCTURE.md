# SKC BI Dashboard - Navigatie Structuur

## Herstructurering Taak 99.3 - Locale-Based Navigation

Deze documentatie beschrijft de nieuwe navigatie structuur voor het SKC BI Dashboard, waarbij alles in locale directories is georganiseerd.

## 🎯 Navigatie Overzicht

### 🏠 HOMEPAGE (/)

- **URL**: `localhost:3000/` (root)
- **Functie**: Marketing Landing Page voor prospects en nieuwe klanten
- **Inhoud**:
  - Professionele landing page
  - Features, pricing, testimonials van Fortune 500 bedrijven
  - Login/Get Started buttons voor conversie
  - Modern gradient design met premium effecten
- **Automatische redirect**: Naar `/nl/` of `/en/` gebaseerd op browser taal

### ⚡ COMMAND CENTER

- **URL**: `localhost:3000/nl/command-center` (of `/en/command-center`)
- **Functie**: Voor bestaande klanten na login
- **Inhoud**:
  - Marketing machine CONTROL operaties
  - Header toggle naar Dashboard mode
  - Realtime monitoring en controle

### 📊 DASHBOARD SYSTEEM (/nl/...)

#### Executive Dashboard

- **URL**: `/nl/executive-dashboard`
- **Functie**: Strategic overview en executive KPI's
- **Inhoud**: High-level overzicht voor management

#### Finance BI

- **URL**: `/nl/finance`
- **Functie**: Financial Business Intelligence
- **Inhoud**: Financiële analytics en rapportage

#### Marketing Analytics

- **URL**: `/nl/marketing`
- **Functie**: Marketing DATA analytics
- **Inhoud**: Marketing performance en insights

#### Research Intelligence

- **URL**: `/nl/research`
- **Functie**: Market intelligence insights
- **Inhoud**: Marktonderzoek en concurrentieanalyse

#### Admin Dashboard

- **URL**: `/nl/admin-dashboard`
- **Functie**: System administration
- **Inhoud**: Systeembeheer en configuratie

## 🌐 Taalondersteuning

### Nederlandse versie (standaard)

- Alle URLs beginnen met `/nl/`
- Voorbeeld: `localhost:3000/nl/command-center`

### Engelse versie

- Alle URLs beginnen met `/en/`
- Voorbeeld: `localhost:3000/en/command-center`

## 🔄 Navigatie Components Aangepast

### 1. Root Homepage (`src/app/page.tsx`)

- Detecteert browser taal
- Redirect naar juiste locale

### 2. Marketing Header (`src/components/layout/improved-marketing-header.tsx`)

- Platform dropdown wijst naar locale paths
- Dashboard dropdown wijst naar locale paths
- Alle links gebruiken `/nl/` of `/en/` prefix

### 3. Enhanced Header (`src/components/layout/enhanced-header.tsx`)

- Dashboard mode switcher navigeert naar locale paths
- Command Center button wijst naar `/nl/command-center`
- Admin Dashboard button wijst naar `/nl/admin-dashboard`

### 4. Dashboard Mode Context (`src/lib/contexts/dashboard-mode-context.tsx`)

- Route mappings bijgewerkt voor locale paths
- Automatische mode detectie op basis van URL
- Smooth transitions tussen dashboard modes

## 📁 Bestandsstructuur

```
src/app/
├── page.tsx                    # Root redirect naar locale
├── layout.tsx                  # Root layout
└── [locale]/
    ├── page.tsx               # Marketing landing page
    ├── layout.tsx             # Locale layout with providers
    ├── command-center/
    │   └── page.tsx           # Command center
    ├── executive-dashboard/
    │   └── page.tsx           # Executive dashboard
    ├── finance/
    │   └── page.tsx           # Finance BI
    ├── marketing/
    │   └── page.tsx           # Marketing analytics
    ├── research/
    │   └── page.tsx           # Research intelligence
    └── admin-dashboard/
        └── page.tsx           # Admin dashboard
```

## 🎨 Design Principes

1. **Dark Theme Standaard**: Alle componenten gebruiken dark theme styling
2. **Locale-First**: Alle functionaliteit binnen locale directories
3. **Smooth Transitions**: Geen abrupte page loads tussen dashboard modes
4. **Context Preservation**: Dashboard state behouden tijdens navigatie
5. **Premium UI**: Enterprise-grade visual hierarchy en effecten

## 🚀 Implementatie Status

✅ Root homepage met automatische locale detectie
✅ Marketing header met locale-aware navigation
✅ Enhanced header met bijgewerkte paths
✅ Dashboard mode context met locale support
✅ Command center integratie in locale structure
✅ Alle dashboard pagina's in locale directories

## 🔧 Technische Details

- **Internationalization**: Next.js 14 App Router met locale support
- **State Management**: Dashboard mode context met React Context API
- **Routing**: Automatic locale detection en smooth transitions
- **Components**: Herbruikbare componenten voor alle dashboard modes
- **TypeScript**: Volledig getypeerde navigatie structuur

## 📈 Voordelen Nieuwe Structuur

1. **Betere SEO**: Locale-specific URLs
2. **Gebruikerservaring**: Consistente taal door hele applicatie
3. **Schaalbaarheid**: Eenvoudig nieuwe talen toevoegen
4. **Organisatie**: Duidelijke scheiding tussen marketing en dashboard
5. **Performance**: Optimale loading en caching per locale
