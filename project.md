# Health Insurance Agent Platform - Complete Documentation

**Version:** 1.0  
**Date:** November 2025  
**Purpose:** Hackathon Demo - Multi-Agent Health Insurance System

---

# Table of Contents

1. [System Architecture Document](#system-architecture-document)
2. [Use Case Document](#use-case-document)
3. [Technical Specification](#technical-specification)
4. [API Reference Guide](#api-reference-guide)
5. [Deployment & Setup Guide](#deployment-setup-guide)

---

# System Architecture Document

## 1. SYSTEM OVERVIEW

### 1.1 Purpose
Multi-channel AI agent system enabling health insurance members to manage appointments, benefits, and administrative tasks through chat, SMS, and voice interfaces.

### 1.2 Architecture Style
Event-driven microservices with multi-agent orchestration pattern

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Web Chatbot │  SMS Gateway │ Voice Agent  │ Reminder UI    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (FastAPI/Flask)│
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐    ┌─────────▼────────┐   ┌───────▼──────┐
│   Auth      │    │  Agent           │   │  Integration │
│   Service   │    │  Orchestration   │   │  Layer       │
└─────────────┘    │  Engine          │   └───────┬──────┘
                   └─────────┬────────┘           │
                             │              ┌─────▼──────┐
              ┌──────────────┼──────────────┤   MCP      │
              │              │              │   Servers  │
    ┌─────────▼─────┐ ┌──────▼──────┐      └────────────┘
    │ Specialized   │ │   LLM       │
    │ Agents        │ │   Router    │
    │ (7 agents)    │ │ (OpenRouter)│
    └───────┬───────┘ └─────────────┘
            │
    ┌───────▼────────┐
    │   Data Layer   │
    │   (MongoDB)    │
    └────────────────┘
```

---

## 3. COMPONENT ARCHITECTURE

### 3.1 Gateway Layer

**Web Chatbot**
- Technology: React/Vue frontend
- Communication: WebSocket for real-time chat
- Session management: JWT tokens
- File upload: Multipart form data for documents

**SMS Gateway**
- Technology: Twilio/AWS SNS
- Flow: SMS → generates unique link → redirects to chatbot
- Link format: https://insurance.com/chat?session={token}

**Voice Agent**
- STT: Deepgram Python SDK (real-time streaming)
- TTS: ElevenLabs Python SDK
- Protocol: WebRTC or telephony integration
- Handoff: Generates chatbot link during complex tasks

**Reminder Dashboard**
- Technology: React with real-time updates
- Data refresh: Polling every 30s or WebSocket
- Analytics: Chart.js/Recharts for visualization

### 3.2 API Gateway Layer

**Technology Stack**
- Framework: FastAPI (recommended) or Flask
- Port: 8000 (development), 80/443 (production)
- Authentication: Basic Auth middleware

**Key Endpoints**
```
POST   /api/v1/auth/login
POST   /api/v1/chat/message
POST   /api/v1/voice/stream
GET    /api/v1/reminders
POST   /api/v1/documents/upload
GET    /api/v1/appointments
POST   /api/v1/appointments/create
DELETE /api/v1/appointments/{id}
PATCH  /api/v1/user/pcp
```

### 3.3 Agent Orchestration Engine

**Core Components**
1. **Message Router**: Analyzes intent, routes to appropriate agent
2. **Context Manager**: Maintains conversation state
3. **Agent Registry**: Manages agent lifecycle
4. **Response Aggregator**: Combines multi-agent responses

**Agent Communication Pattern**
```python
{
  "message_id": "uuid",
  "user_id": "member_id",
  "session_id": "session_uuid",
  "intent": "book_appointment",
  "context": {
    "conversation_history": [],
    "user_profile": {},
    "current_state": "awaiting_confirmation"
  },
  "metadata": {
    "channel": "chat|sms|voice",
    "language": "en|es"
  }
}
```

### 3.4 Specialized Agents

**1. Orchestrator Agent**
- Role: Intent classification and routing
- LLM calls: 1-2 per message
- Outputs: Target agent + extracted parameters

**2. Appointment Agent**
- Capabilities: Book, cancel, reschedule
- MCP calls: get_provider_availability, create_appointment, list_appointments
- Integration: Google Calendar MCP

**3. RAG Agent**
- Vector DB: Embedded in MongoDB (Atlas Vector Search) or separate Pinecone
- Document source: Insurance policy documents
- Retrieval: Top 3 chunks with similarity > 0.75
- Generation: Context + query → LLM

**4. Conversational Agent**
- Multilingual support: English, Spanish
- Personalization: Uses user profile from DB
- Tone: Warm, professional, empathetic

**5. Document Processing Agent**
- Input: PDF/Image of doctor referral
- Processing: OCR (Tesseract/cloud) + structured extraction
- Output: JSON with patient name, procedure, ICD codes, doctor signature

**6. Assistant Agent**
- Handles: PCP change, general queries, fallback
- MCP calls: check_available_providers, update_user_pcp

**7. Notification Agent**
- Types: Refill reminders, follow-up appointments
- Storage: reminder collection in MongoDB
- Delivery: Email, SMS, in-app notification

---

## 4. DATA ARCHITECTURE

### 4.1 MongoDB Collections

**users**
```json
{
  "_id": "ObjectId",
  "member_id": "string (indexed)",
  "dob": "date",
  "name": "string",
  "phone": "string",
  "email": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "coordinates": [lon, lat]
  },
  "pcp_id": "provider_id",
  "language_preference": "en|es",
  "created_at": "timestamp"
}
```

**providers**
```json
{
  "_id": "ObjectId",
  "provider_id": "string",
  "name": "string",
  "specialty": "string",
  "location": {
    "address": {},
    "coordinates": [lon, lat]
  },
  "accepting_patients": "boolean"
}
```

**appointments**
```json
{
  "_id": "ObjectId",
  "appointment_id": "string",
  "member_id": "string",
  "provider_id": "string",
  "datetime": "timestamp",
  "type": "string",
  "status": "scheduled|cancelled|completed",
  "google_calendar_event_id": "string",
  "created_at": "timestamp"
}
```

**reminders**
```json
{
  "_id": "ObjectId",
  "member_id": "string",
  "type": "refill|followup|appointment",
  "message": "string",
  "due_date": "timestamp",
  "status": "pending|sent|acknowledged",
  "related_appointment_id": "string (optional)"
}
```

**pre_auth_requests**
```json
{
  "_id": "ObjectId",
  "member_id": "string",
  "procedure_type": "MRI|CT|etc",
  "document_url": "string",
  "extracted_data": {},
  "status": "pending|approved|denied",
  "decision_date": "timestamp"
}
```

**conversations**
```json
{
  "_id": "ObjectId",
  "session_id": "string",
  "member_id": "string",
  "channel": "chat|sms|voice",
  "messages": [
    {
      "role": "user|assistant",
      "content": "string",
      "timestamp": "timestamp",
      "agent": "string (if assistant)"
    }
  ],
  "started_at": "timestamp",
  "ended_at": "timestamp"
}
```

### 4.2 Indexes
- users: {member_id: 1, dob: 1} (compound, unique)
- appointments: {member_id: 1, datetime: -1}
- reminders: {member_id: 1, due_date: 1, status: 1}
- providers: {location.coordinates: "2dsphere"}

---

## 5. INTEGRATION ARCHITECTURE

### 5.1 MCP Server Integration

**Provider Scheduling MCP**
- Tools: get_provider_availability, create_appointment, cancel_appointment, list_appointments
- Mock implementation: In-memory schedule or MongoDB-backed

**Google Calendar MCP**
- Library: google-calendar-mcp
- Tools: save_appointment (creates event)
- Authentication: OAuth 2.0 service account

**Location Services MCP**
- Tools: check_available_providers (geospatial query)
- Query: Find providers within 25 miles of coordinates

**Insurance RAG MCP**
- Tools: query_benefits
- Backend: Vector search on embedded policy documents

**Document Processing MCP**
- Tools: upload_document, extract_info
- Processing: PDF parsing → entity extraction → validation

**Pre-Authorization MCP**
- Tools: pre_auth_check
- Logic: Validate extracted data against policy rules

### 5.2 External Service Integration

**Deepgram (STT)**
```python
from deepgram import Deepgram
# Streaming audio → text transcription
# Real-time mode for voice agent
```

**ElevenLabs (TTS)**
```python
from elevenlabs import generate, stream
# Text → audio stream
# Voice selection based on user preference
```

**OpenRouter (LLM)**
```python
import openai
# API compatible with OpenAI SDK
# Model selection: gpt-4, claude-3, etc.
```

---

## 6. DEPLOYMENT ARCHITECTURE

### 6.1 Development Environment
```
- Local MongoDB instance (port 27017)
- Python virtual environment
- API server: localhost:8000
- Frontend dev server: localhost:3000
- Ngrok for SMS/Voice webhooks
```

### 6.2 Production Considerations (Future)
- MongoDB Atlas for managed database
- Docker containers for services
- Load balancer for API gateway
- Redis for session management
- S3 for document storage
- CloudWatch/Datadog for monitoring

---

## 7. SECURITY ARCHITECTURE

### 7.1 Authentication Flow
```
1. User provides member_id + DOB
2. Backend validates against users collection
3. Generate JWT token (expires in 24h)
4. Return token to frontend
5. Frontend includes token in Authorization header
6. Backend middleware validates token on each request
```

### 7.2 Data Protection
- PHI data encrypted at rest (MongoDB encryption)
- TLS for all API communications
- Document uploads: virus scanning
- Access logs for audit trail

### 7.3 Rate Limiting
- 100 requests per minute per user
- 1000 requests per minute per IP
- Implement using middleware or Redis

---

# Use Case Document

## UC-001: Book New Appointment

**Primary Actor**: Health Insurance Member

**Preconditions**:
- User is authenticated (member_id + DOB)
- User has active insurance coverage
- System has provider availability data

**Trigger**: User requests to book an appointment via chat/SMS/voice

**Main Success Scenario**:
1. User initiates conversation: "I need to book an appointment"
2. Orchestrator Agent routes to Appointment Agent
3. Appointment Agent retrieves user's current PCP from database
4. Agent calls get_provider_availability MCP tool with provider_id
5. Agent presents 2-3 available time slots to user
6. User selects preferred time slot
7. Agent calls create_appointment MCP tool
8. Agent calls save_appointment (Google Calendar MCP) to add to user's calendar
9. System stores appointment in MongoDB appointments collection
10. Agent confirms booking with appointment details
11. Notification Agent schedules appointment reminder

**Alternative Flows**:
- 3a. User wants different provider
  - System calls check_available_providers based on location
  - Present provider options
  - Continue from step 4

- 6a. User doesn't like any presented slots
  - Ask for preferred date/time
  - Check availability for requested time
  - Present closest available slots

**Postconditions**:
- Appointment record created in database
- Google Calendar event created
- Reminder scheduled for 24 hours before appointment
- User receives confirmation message

**Example Conversation**:
```
User: I need to schedule a checkup
Agent: I'd be happy to help you schedule an appointment with your primary care 
       provider, Dr. Sarah Johnson. I have the following times available:
       
       1. Tuesday, Nov 19 at 10:00 AM
       2. Wednesday, Nov 20 at 2:30 PM
       3. Thursday, Nov 21 at 9:15 AM
       
       Which time works best for you?

User: I'll take Wednesday at 2:30
Agent: Perfect! I've booked your appointment for Wednesday, November 20 at 
       2:30 PM with Dr. Sarah Johnson at Main Street Clinic (123 Main St).
       
       I've also added this to your Google Calendar and set a reminder for 
       24 hours before your appointment. Is there anything else I can help 
       you with?
```

---

## UC-002: Cancel Appointment

**Primary Actor**: Health Insurance Member

**Preconditions**:
- User is authenticated
- User has at least one scheduled appointment

**Trigger**: User requests to cancel an appointment

**Main Success Scenario**:
1. User: "I need to cancel my appointment"
2. Agent calls list_appointments for user
3. Agent presents upcoming appointments
4. User selects appointment to cancel
5. Agent confirms cancellation intent
6. Agent calls cancel_appointment MCP tool
7. Agent removes from Google Calendar
8. System updates appointment status to "cancelled"
9. Agent confirms cancellation

---

## UC-004: Update Primary Care Provider

**Primary Actor**: Health Insurance Member

**Preconditions**:
- User is authenticated
- User wants to change PCP due to relocation or preference

**Trigger**: User requests to change their primary care provider

**Main Success Scenario**:
1. User: "I need to change my primary care doctor"
2. Orchestrator routes to Assistant Agent
3. Agent retrieves user's current address from database
4. Agent asks: "I see your address is [current address]. Has this changed?"
5. User provides new address or confirms current
6. Agent calls check_available_providers MCP tool with location
7. System performs geospatial query (MongoDB 2dsphere index)
8. Agent presents 3-5 providers within 25 miles
9. User selects preferred provider
10. Agent calls update_user_pcp with new provider_id
11. System updates users collection in database
12. Agent confirms PCP change

**Example Conversation**:
```
User: I'm moving to Brooklyn and need a new doctor
Agent: I'd be happy to help you find a new primary care provider. What's 
       your new address?

User: 456 Park Avenue, Brooklyn, NY 11201
Agent: Great! I found several primary care providers near your new address:

       1. Dr. Michael Chen - Family Medicine
          Brooklyn Health Center, 0.8 miles away
          Accepting new patients
       
       2. Dr. Lisa Rodriguez - Internal Medicine
          Park Slope Medical, 1.2 miles away
          Accepting new patients
       
       Which provider would you prefer?

User: I'll go with Dr. Rodriguez
Agent: Perfect! I've updated your primary care provider to Dr. Lisa Rodriguez 
       at Park Slope Medical. Your new address has also been saved.
```

---

## UC-005: Query Insurance Benefits (RAG)

**Primary Actor**: Health Insurance Member

**Preconditions**:
- User is authenticated
- Insurance policy documents loaded in vector database

**Trigger**: User asks question about coverage or benefits

**Main Success Scenario**:
1. User asks: "Does my insurance cover physical therapy?"
2. Orchestrator routes to RAG Agent
3. RAG Agent generates embedding for query
4. Agent performs vector search in insurance documents
5. System retrieves top 3 relevant chunks (similarity > 0.75)
6. Agent sends chunks + query to LLM
7. LLM generates answer with citations
8. Agent presents answer to user in conversational format

**Example Conversation**:
```
User: What's my deductible for the year?
Agent: Based on your policy, your annual deductible is $1,500 for in-network 
       services and $3,000 for out-of-network services. So far this year, 
       you've met $450 of your in-network deductible.

User: What happens after I meet it?
Agent: Once you meet your deductible, you'll pay coinsurance for covered 
       services. Your plan has 80/20 coinsurance, meaning your insurance 
       pays 80% and you pay 20% of the cost until you reach your out-of-pocket 
       maximum of $6,000.
```

---

## UC-008: Complete MRI Pre-Auth and Booking (Omnichannel)

**Primary Actor**: Health Insurance Member

**Preconditions**:
- User is authenticated
- User has doctor's referral for MRI
- User initiates via voice call

**Trigger**: User calls voice agent number requesting MRI appointment

**Main Success Scenario**:

**Phase 1: Voice Interaction & Handoff**
1. User calls agent phone number
2. Voice agent: "Hello! Can I have your member ID?"
3. User provides member_id verbally
4. Agent: "And your date of birth?"
5. User provides DOB
6. System authenticates user
7. User: "I need to schedule an MRI"
8. Agent: "I can help with that. For MRI pre-authorization, I'll need you to upload your doctor's referral. I'm sending you a link to continue via chat."
9. System generates session link
10. Agent sends SMS with link to user's phone
11. Agent: "I've sent the link to your phone. Please upload your referral there, and I'll stay on the line while we process it."

**Phase 2: Chat Interface - Document Upload**
12. User clicks link, opens chatbot (maintains voice call)
13. Chatbot displays: "Please upload your doctor's referral for MRI"
14. User uploads PDF/image document
15. Frontend calls POST /api/v1/documents/upload
16. Document Processing Agent receives document
17. Agent performs OCR and extraction
18. System stores in pre_auth_requests collection

**Phase 3: Parallel Processing - Chat Conversation**
19. Chatbot shows: "Processing your referral... This may take a moment. Feel free to ask me any questions while you wait."
20. User (via chat): "What will this cost me?"
21. RAG Agent responds with insurance benefit information
22. User (via chat): "Do I need to fast before the MRI?"
23. RAG Agent provides relevant information

**Phase 4: Pre-Auth Completion & Booking**
24. Document processing completes (~30-60 seconds)
25. Pre-Auth Agent validates extracted data
26. System updates pre_auth_request status to "approved"
27. Chatbot displays: "✓ Your pre-authorization is approved!"
28. Chatbot: "Let me find available MRI appointments for you."
29. Appointment Agent calls get_provider_availability
30. Chatbot displays 3 available slots
31. User selects preferred slot via chat
32. Agent calls create_appointment
33. Agent calls save_appointment (Google Calendar)

**Phase 5: Voice Handoff Completion**
35. Chatbot: "Your MRI is confirmed. Returning to voice agent..."
36. Voice agent: "Great news! Your MRI pre-authorization has been approved and your appointment is booked for [date] at [time]. You'll receive a confirmation via email and SMS."
37. Call ends

---

# Technical Specification

## 1. TECHNOLOGY STACK

### 1.1 Backend Framework
**FastAPI** (Recommended)
- Async support for better performance
- Automatic OpenAPI documentation
- Built-in validation with Pydantic
- WebSocket support for real-time chat

### 1.2 Database
**MongoDB 6.0+**
- Document-based storage for flexible schemas
- Native geospatial queries for provider search
- Atlas Vector Search for RAG
- Change streams for real-time updates

### 1.3 AI/ML Services
**OpenRouter**
- Model: gpt-4-turbo or claude-3-opus
- API: OpenAI-compatible Python SDK

**Deepgram**
- Real-time streaming STT
- Python SDK for voice transcription

**ElevenLabs**
- High-quality TTS
- Python SDK for audio generation

### 1.4 Supporting Libraries
```python
# Core
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.4.2

# Database
pymongo==4.5.0
motor==3.3.1  # Async MongoDB driver

# AI Services
openai==1.3.0
deepgram-sdk==3.0.0
elevenlabs==0.2.24

# Document Processing
PyPDF2==3.0.1
python-multipart==0.0.6
Pillow==10.1.0
pytesseract==0.3.10

# Utilities
httpx==0.25.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dateutil==2.8.2
google-auth==2.23.4
google-api-python-client==2.108.0
loguru==0.7.2
```

---

## 2. PROJECT STRUCTURE

```
health-insurance-agent/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── voice.py
│   │   │   ├── appointments.py
│   │   │   ├── reminders.py
│   │   │   └── documents.py
│   │   └── dependencies.py
│   ├── agents/
│   │   ├── base.py
│   │   ├── orchestrator.py
│   │   ├── appointment.py
│   │   ├── rag.py
│   │   ├── conversational.py
│   │   ├── document.py
│   │   ├── assistant.py
│   │   └── notification.py
│   ├── mcp/
│   │   ├── provider_server.py
│   │   ├── location_server.py
│   │   ├── calendar_server.py
│   │   ├── rag_server.py
│   │   └── preauth_server.py
│   ├── models/
│   ├── services/
│   │   ├── llm_service.py
│   │   ├── stt_service.py
│   │   ├── tts_service.py
│   │   └── document_service.py
│   ├── database/
│   │   ├── mongodb.py
│   │   └── repositories/
│   └── utils/
├── scripts/
│   ├── seed_database.py
│   └── create_indexes.py
├── tests/
├── data/
│   ├── insurance_docs/
│   └── mock_data/
├── .env
├── requirements.txt
└── README.md
```

---

## 3. CORE IMPLEMENTATIONS

### 3.1 Base Agent Class

```python
# app/agents/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    def __init__(self, llm_service):
        self.llm_service = llm_service
        self.name = self.__class__.__name__
    
    @abstractmethod
    async def process(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a message and return response"""
        pass
    
    async def call_llm(self, prompt: str, system_message: str = None) -> str:
        """Call LLM with prompt"""
        return await self.llm_service.generate(
            prompt=prompt,
            system_message=system_message or self.get_system_message()
        )
    
    @abstractmethod
    def get_system_message(self) -> str:
        """Return system message for this agent"""
        pass
```

### 3.2 Orchestrator Agent

```python
# app/agents/orchestrator.py
from app.agents.base import BaseAgent
from typing import Dict, Any
import json

class OrchestratorAgent(BaseAgent):
    def __init__(self, llm_service, agent_registry):
        super().__init__(llm_service)
        self.agent_registry = agent_registry
    
    def get_system_message(self) -> str:
        return """You are an intelligent routing agent for a health insurance platform.
        
Analyze user messages and determine:
1. The primary intent
2. Which specialized agent should handle the request
3. Any entities or parameters to extract

Available agents:
- appointment_agent: Booking, canceling, rescheduling
- rag_agent: Insurance benefits questions
- assistant_agent: PCP change, general help
- conversational_agent: Greetings, casual chat

Respond in JSON format:
{
  "intent": "book_appointment|cancel|query_benefits|change_pcp|greeting",
  "target_agent": "agent_name",
  "entities": {},
  "confidence": 0.95
}"""
    
    async def process(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Classify intent
        prompt = f"""Analyze and route this message:

User: "{message}"
Context: {context.get('recent_messages', [])}

Provide routing decision."""

        routing_decision = await self.call_llm(prompt)
        decision = json.loads(routing_decision)
        
        # Route to appropriate agent
        target_agent = self.agent_registry.get(decision['target_agent'])
        
        if target_agent:
            return await target_agent.process(message, {
                **context,
                'intent': decision['intent'],
                'entities': decision['entities']
            })
        
        return await self.agent_registry['conversational_agent'].process(message, context)
```

### 3.3 MCP Server Example

```python
# app/mcp/provider_server.py
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random

class ProviderMCPServer:
    def __init__(self, db):
        self.db = db
        self.mock_schedules = self._generate_mock_schedules()
    
    def _generate_mock_schedules(self) -> Dict:
        """Generate mock provider schedules"""
        schedules = {}
        base_date = datetime.now() + timedelta(days=1)
        
        for day in range(14):
            date = base_date + timedelta(days=day)
            date_str = date.strftime('%Y-%m-%d')
            schedules[date_str] = []
            
            for hour in [9, 10, 11, 14, 15, 16]:
                if random.random() > 0.3:
                    schedules[date_str].append({
                        'time': f"{hour:02d}:00",
                        'available': True,
                        'duration_minutes': 30
                    })
        
        return schedules
    
    async def get_provider_availability(self, provider_id: str, 
                                       days_ahead: int = 14) -> Dict[str, Any]:
        """Get available appointment slots"""
        available_slots = []
        base_date = datetime.now() + timedelta(days=1)
        
        for day in range(days_ahead):
            date = base_date + timedelta(days=day)
            date_str = date.strftime('%Y-%m-%d')
            day_name = date.strftime('%A')
            
            if date_str in self.mock_schedules:
                for slot in self.mock_schedules[date_str]:
                    if slot['available']:
                        available_slots.append({
                            'date': date_str,
                            'day': day_name,
                            'time': slot['time'],
                            'datetime': f"{date_str}T{slot['time']}:00",
                            'provider_id': provider_id
                        })
        
        return {
            'provider_id': provider_id,
            'slots': available_slots,
            'total_available': len(available_slots)
        }
    
    async def create_appointment(self, member_id: str, provider_id: str,
                                datetime_str: str, appointment_type: str) -> Dict[str, Any]:
        """Create a new appointment"""
        appointment_id = f"appt_{random.randint(10000, 99999)}"
        
        appointment = {
            'appointment_id': appointment_id,
            'member_id': member_id,
            'provider_id': provider_id,
            'datetime': datetime_str,
            'type': appointment_type,
            'status': 'scheduled',
            'created_at': datetime.now().isoformat()
        }
        
        await self.db.appointments.insert_one(appointment)
        
        return appointment
```

### 3.4 FastAPI Application

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, chat, voice, appointments, reminders, documents
from app.database.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="Health Insurance Agent API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["Voice"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(reminders.router, prefix="/api/v1/reminders", tags=["Reminders"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

# API Reference Guide

## BASE INFORMATION

**Base URL**: `http://localhost:8000`  
**API Version**: v1  
**Authentication**: Bearer Token (JWT)

---

## AUTHENTICATION ENDPOINTS

### Login
```
POST /api/v1/auth/login
```

**Request Body**:
```json
{
  "member_id": "H123456789",
  "dob": "1985-03-15"
}
```

**Success Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "member_id": "H123456789",
    "name": "John Doe",
    "language_preference": "en"
  }
}
```

**Error Response (401)**:
```json
{
  "detail": "Invalid credentials"
}
```

---

## CHAT ENDPOINTS

### Send Message
```
POST /api/v1/chat/message
```

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "message": "I need to book an appointment",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "channel": "chat"
}
```

**Response (200)**:
```json
{
  "message_id": "msg_1699564800",
  "response": "I'd be happy to help you schedule an appointment...",
  "agent": "AppointmentAgent",
  "metadata": {
    "intent": "book_appointment",
    "confidence": 0.95
  },
  "actions": [
    {
      "type": "display_options",
      "data": {
        "options": [
          {
            "id": "slot_1",
            "label": "Tuesday, Nov 19 at 10:00 AM",
            "value": "2025-11-19T10:00:00"
          }
        ]
      }
    }
  ]
}
```

---

## APPOINTMENT ENDPOINTS

### List Appointments
```
GET /api/v1/appointments
```

**Query Parameters**:
- `status` (optional): `scheduled` | `cancelled` | `completed`
- `from_date` (optional): ISO 8601 date
- `to_date` (optional): ISO 8601 date

**Response (200)**:
```json
{
  "appointments": [
    {
      "appointment_id": "appt_12345",
      "provider": {
        "name": "Dr. Sarah Johnson",
        "specialty": "Family Medicine"
      },
      "datetime": "2025-11-19T10:00:00Z",
      "location": "Main Street Clinic",
      "status": "scheduled",
      "type": "checkup"
    }
  ],
  "total": 1
}
```

### Create Appointment
```
POST /api/v1/appointments/create
```

**Request Body**:
```json
{
  "provider_id": "prov_001",
  "datetime": "2025-11-19T10:00:00Z",
  "type": "checkup",
  "notes": "Annual physical"
}
```

**Response (201)**:
```json
{
  "appointment_id": "appt_12345",
  "status": "scheduled",
  "google_calendar_event_id": "gcal_abc123",
  "confirmation": "Your appointment is confirmed for Nov 19 at 10:00 AM"
}
```

### Cancel Appointment
```
DELETE /api/v1/appointments/{appointment_id}
```

**Response (200)**:
```json
{
  "status": "cancelled",
  "message": "Appointment cancelled successfully"
}
```

---

## REMINDER ENDPOINTS

### Get Reminders & Analytics
```
GET /api/v1/reminders
```

**Response (200)**:
```json
{
  "reminders": [
    {
      "reminder_id": "rem_123",
      "type": "refill",
      "message": "Time to refill your Lisinopril prescription",
      "due_date": "2025-11-18T00:00:00Z",
      "status": "pending"
    }
  ],
  "analytics": {
    "total_appointments_this_year": 12,
    "upcoming_appointments": 2,
    "pending_reminders": 3,
    "appointments_by_month": {
      "2025-01": 2,
      "2025-02": 1
    }
  }
}
```

---

## DOCUMENT ENDPOINTS

### Upload Document
```
POST /api/v1/documents/upload
```

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Data**:
- `file`: Binary file (PDF or image)
- `document_type`: `referral` | `prescription` | `claim`
- `session_id`: Session UUID

**Response (202)**:
```json
{
  "document_id": "doc_1699564800",
  "status": "processing",
  "estimated_time": 30
}
```

### Get Document Status
```
GET /api/v1/documents/{document_id}/status
```

**Response (200)**:
```json
{
  "document_id": "doc_1699564800",
  "status": "completed",
  "extracted_data": {
    "patient_name": "John Doe",
    "procedure": "MRI - Left Knee",
    "icd_codes": ["M25.561"],
    "provider_npi": "1234567890"
  },
  "pre_auth_status": "approved"
}
```

---

## USER ENDPOINTS

### Update Primary Care Provider
```
PATCH /api/v1/user/pcp
```

**Request Body**:
```json
{
  "provider_id": "prov_002",
  "reason": "relocation"
}
```

**Response (200)**:
```json
{
  "message": "Primary care provider updated successfully",
  "new_pcp": {
    "provider_id": "prov_002",
    "name": "Dr. Lisa Rodriguez",
    "specialty": "Internal Medicine"
  }
}
```

---

## VOICE ENDPOINTS

### Stream Voice Input
```
POST /api/v1/voice/stream
```

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: audio/wav
```

**Request Body**: Binary audio data (16kHz, mono, 16-bit PCM)

**Response (200)**:
```json
{
  "transcription": "I need to schedule an MRI scan",
  "response_text": "I can help with that. I'm sending you a link...",
  "audio_url": "https://cdn.example.com/audio/response.mp3",
  "session_id": "voice_550e8400",
  "next_action": "redirect_to_chat"
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "detail": "Invalid request format"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "An internal error occurred"
}
```

---

# Deployment & Setup Guide

## QUICK START (5 Minutes)

```bash
# 1. Clone and setup
git clone <your-repo>
cd health-insurance-agent
python -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment
cp .env.example .env
# Edit .env with your API keys

# 4. Start MongoDB
docker run -d -p 27017:27017 mongo:latest

# 5. Seed database
python scripts/seed_database.py

# 6. Run application
python -m app.main

# ✓ API running at http://localhost:8000
# ✓ Docs at http://localhost:8000/docs
```

---

## DETAILED SETUP

### Prerequisites

- Python 3.10+
- MongoDB 6.0+
- API Keys:
  - OpenRouter (for LLM)
  - Deepgram (for STT)
  - ElevenLabs (for TTS)

### Step 1: Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**requirements.txt**:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.4.2
pydantic-settings==2.0.3
pymongo==4.5.0
motor==3.3.1
openai==1.3.0
deepgram-sdk==3.0.0
elevenlabs==0.2.24
PyPDF2==3.0.1
python-multipart==0.0.6
Pillow==10.1.0
pytesseract==0.3.10
httpx==0.25.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dateutil==2.8.2
google-auth==2.23.4
google-api-python-client==2.108.0
loguru==0.7.2
sentence-transformers==2.2.2
```

### Step 2: MongoDB Setup

**Option A: Docker (Recommended)**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

**Option B: Local Installation**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Windows - Download from mongodb.com
```

### Step 3: Environment Configuration

Create `.env` file:
```bash
# Application
APP_NAME=Health Insurance Agent
DEBUG=True

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=health_insurance

# AI Services
OPENROUTER_API_KEY=sk-or-v1-xxxxx
LLM_MODEL=anthropic/claude-3-sonnet
DEEPGRAM_API_KEY=xxxxx
ELEVENLABS_API_KEY=xxxxx

# Authentication
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Step 4: Database Initialization

```bash
# Seed with demo data
python scripts/seed_database.py
```

**scripts/seed_database.py**:
```python
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def seed_database():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["health_insurance"]
    
    print("Seeding database...")
    
    # Clear existing
    await db.users.delete_many({})
    await db.providers.delete_many({})
    
    # Seed users
    users = [
        {
            "member_id": "H123456789",
            "dob": "1985-03-15",
            "name": "John Doe",
            "phone": "+1-555-0123",
            "email": "john.doe@email.com",
            "address": {
                "street": "123 Main Street",
                "city": "Brooklyn",
                "state": "NY",
                "zip": "11201",
                "coordinates": [-73.9442, 40.6782]
            },
            "pcp_id": "prov_001",
            "language_preference": "en",
            "created_at": datetime.now().isoformat()
        }
    ]
    
    await db.users.insert_many(users)
    
    # Seed providers
    providers = [
        {
            "provider_id": "prov_001",
            "name": "Dr. Sarah Johnson",
            "specialty": "Family Medicine",
            "location": {
                "coordinates": [-73.9442, 40.6782]
            },
            "accepting_patients": True
        }
    ]
    
    await db.providers.insert_many(providers)
    
    print("✓ Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
```

### Step 5: Run Application

```bash
# Development mode
python -m app.main

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## TESTING THE SETUP

### 1. Health Check
```bash
curl http://localhost:8000/health
```

Expected:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### 2. Test Authentication
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"member_id": "H123456789", "dob": "1985-03-15"}'
```

### 3. Test Chat
```bash
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "message": "Hello",
    "session_id": "test-123",
    "channel": "chat"
  }'
```

---

## DEMO WORKFLOW

### Scenario 1: Appointment Booking (Chat)

1. Login with: member_id=H123456789, dob=1985-03-15
2. Send message: "I need to book an appointment"
3. Agent presents available slots
4. Select a slot
5. Confirm booking
6. Check Google Calendar

### Scenario 2: MRI Pre-Auth (Omnichannel)

1. Call voice number
2. Authenticate via voice
3. Request MRI
4. Receive SMS link
5. Upload referral document
6. Chat while processing
7. Select imaging center
8. Voice confirmation

### Scenario 3: Reminder Dashboard

1. Login to web interface
2. View analytics
3. Check pending reminders
4. Take action

---

## DOCKER DEPLOYMENT

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  api:
    build: .
    restart: always
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    env_file:
      - .env
    environment:
      MONGODB_URI: mongodb://mongodb:27017

volumes:
  mongodb_data:
```

**Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y tesseract-ocr

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Deploy**:
```bash
docker-compose up -d
docker-compose logs -f
```

---

## TROUBLESHOOTING

### MongoDB Connection Failed
```bash
# Check MongoDB
docker ps | grep mongodb

# Restart
docker restart mongodb
```

### API Won't Start
```bash
# Check port
lsof -i :8000

# Kill process
kill -9 $(lsof -t -i:8000)

# Reinstall
pip install --upgrade -r requirements.txt
```

### LLM API Errors
```bash
# Test connection
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# Verify .env
cat .env | grep OPENROUTER
```

### Document Upload Fails
```bash
# Create directory
mkdir -p uploads
chmod 755 uploads

# Install Tesseract
# macOS:
brew install tesseract

# Ubuntu:
sudo apt-get install tesseract-ocr
```

---

## PERFORMANCE OPTIMIZATION

### Database Indexes

Create indexes for performance:
```python
# In MongoDB shell or script
db.users.createIndex({"member_id": 1, "dob": 1}, {"unique": true})
db.appointments.createIndex({"member_id": 1, "datetime": -1})
db.providers.createIndex({"location.coordinates": "2dsphere"})
db.reminders.createIndex({"member_id": 1, "due_date": 1, "status": 1})
```

### Caching

Add Redis for caching (optional):
```bash
# Start Redis
docker run -d -p 6379:6379 redis:latest

# Install client
pip install redis

# Add to .env
REDIS_URL=redis://localhost:6379
```

---

## SECURITY CHECKLIST

### Pre-Production

- [ ] Change JWT_SECRET_KEY to secure random value
- [ ] Enable HTTPS/TLS
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable CORS only for trusted domains
- [ ] Encrypt sensitive data
- [ ] Set up firewall rules
- [ ] Enable MongoDB authentication
- [ ] Implement audit logging
- [ ] Add API key rotation

---

## BACKUP & RECOVERY

### MongoDB Backup

```bash
# Create backup
docker exec mongodb mongodump --out=/data/backup

# Copy to host
docker cp mongodb:/data/backup ./backups/$(date +%Y%m%d)

# Restore
docker cp ./backups/20251115 mongodb:/data/restore
docker exec mongodb mongorestore /data/restore
```

---

## HACKATHON PRESENTATION SETUP

### Demo Environment

```bash
# 1. Fresh database
python scripts/seed_database.py

# 2. Test all flows
# - Login works
# - Chat works
# - Voice works
# - Documents upload
# - Reminders display

# 3. Prepare demo docs
# - Sample referral PDF ready

# 4. Backup plan
# - Pre-recorded video
# - Architecture slides
# - Code walkthrough
```

### Demo Script

**Flow 1: Chat - Appointment (2 min)**
1. Login: H123456789 / 1985-03-15
2. "I need to book an appointment"
3. Select Tuesday 10 AM
4. Show Google Calendar

**Flow 2: Voice - MRI (4 min)**
1. Call voice number
2. Authenticate
3. Request MRI
4. Upload referral
5. Chat during processing
6. Select imaging center
7. Voice confirmation

**Flow 3: Dashboard (1 min)**
1. Login to web
2. View analytics
3. Show reminders

---

## FINAL CHECKLIST

Before demo:
- [ ] MongoDB running
- [ ] API keys in .env
- [ ] Backend running (8000)
- [ ] Frontend running (3000)
- [ ] Test login works
- [ ] Test chat works
- [ ] Test voice works
- [ ] Google Calendar working
- [ ] Documents uploading
- [ ] Reminders displaying
- [ ] Demo credentials ready
- [ ] Sample docs ready
- [ ] Backup video ready
- [ ] Slides ready

---

## APPENDIX: COMPLETE FILE STRUCTURE

```
health-insurance-agent/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── dependencies.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── chat.py
│   │       ├── voice.py
│   │       ├── appointments.py
│   │       ├── reminders.py
│   │       └── documents.py
│   ├── agents/
│   │   ├── base.py
│   │   ├── orchestrator.py
│   │   ├── appointment.py
│   │   ├── rag.py
│   │   ├── conversational.py
│   │   ├── document.py
│   │   ├── assistant.py
│   │   └── notification.py
│   ├── mcp/
│   │   ├── provider_server.py
│   │   ├── location_server.py
│   │   ├── calendar_server.py
│   │   ├── rag_server.py
│   │   └── preauth_server.py
│   ├── models/
│   ├── services/
│   │   ├── llm_service.py
│   │   ├── stt_service.py
│   │   ├── tts_service.py
│   │   └── document_service.py
│   ├── database/
│   │   ├── mongodb.py
│   │   └── repositories/
│   └── utils/
├── scripts/
│   ├── seed_database.py
│   └── create_indexes.py
├── tests/
├── data/
├── uploads/
├── .env
├── .env.example
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

**Documentation Complete - Good luck with your hackathon! 🚀**