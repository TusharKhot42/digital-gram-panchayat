# UML Diagrams — Digital Gram Panchayat

All diagrams are Mermaid (render on GitHub / any Mermaid viewer).

## 1. Use Case Diagram

```mermaid
flowchart LR
  Citizen([Citizen])
  Officer([Officer])
  System([Notification System])

  subgraph Citizen Services
    UC1((Register / Login))
    UC2((File Complaint))
    UC3((Track Complaint))
    UC4((Apply for Certificate))
    UC5((Download Certificate))
    UC6((View Tax Dues))
    UC7((Read Notices / Schemes))
    UC8((Receive Notifications))
    UC9((Use App Offline))
  end

  subgraph Officer Services
    UC10((Login))
    UC11((Resolve Complaints))
    UC12((Approve / Reject Certificates))
    UC13((Manage Notices / Schemes))
    UC14((Manage Tax Records))
    UC15((Broadcast Notification))
    UC16((Activate / Deactivate Users))
    UC17((View Dashboard))
  end

  Citizen --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9
  Officer --> UC10 & UC11 & UC12 & UC13 & UC14 & UC15 & UC16 & UC17
  UC11 -.notifies.-> System
  UC12 -.notifies.-> System
  UC15 -.dispatches.-> System
  System -.delivers.-> UC8
```

## 2. Class Diagram (domain models)

```mermaid
classDiagram
  class User {
    +ObjectId _id
    +String role  // citizen | officer
    +String fullName
    +String mobile
    +String email
    +String passwordHash
    +String village
    +String address
    +Boolean isActive
  }
  class Complaint {
    +String complaintId
    +ObjectId citizenId
    +String category
    +String title
    +String description
    +String status
    +GeoPoint location
    +String[] images
  }
  class CertificateApplication {
    +String applicationId
    +ObjectId citizenId
    +String certificateType
    +Object applicationData
    +String status
    +String pdfUrl
  }
  class TaxRecord {
    +String taxRecordId
    +ObjectId citizenId
    +String taxType
    +Number amount
    +Number amountPaid
    +Number balance
    +String paymentStatus
    +Payment[] payments
  }
  class Notice {
    +String noticeId
    +String title
    +String content
    +Boolean isPublished
  }
  class Scheme {
    +String schemeId
    +String title
    +String category
    +Boolean isPublished
  }
  class Notification {
    +String notificationId
    +ObjectId recipientId
    +String channel
    +String status
    +Boolean read
  }
  class AuditLog {
    +ObjectId actorId
    +String action
    +String entity
    +Object before
    +Object after
  }
  class IdempotencyKey {
    +String key
    +Number statusCode
    +Object response
  }

  User "1" --> "many" Complaint
  User "1" --> "many" CertificateApplication
  User "1" --> "many" TaxRecord
  User "1" --> "many" Notification
  Officer --|> User
  Citizen --|> User
```

## 3. Component Diagram

```mermaid
flowchart TB
  subgraph Clients
    CP[Citizen PWA<br/>React + Vite + Workbox]
    AP[Admin Portal<br/>React + Vite]
  end
  SH[[@dgp/shared<br/>schemas · enums · utils]]
  subgraph Backend[Express API]
    MW[Middleware<br/>helmet · cors · rate-limit · auth · upload · idempotency]
    RT[Feature Routers]
    CT[Controllers]
    SV[Services]
    MD[Mongoose Models]
    NP[Notification Providers<br/>sms · voice · email]
  end
  DB[(MongoDB)]
  CDN[(Cloudinary)]

  CP & AP --> SH
  CP & AP -->|HTTPS JSON| MW --> RT --> CT --> SV --> MD --> DB
  SV --> NP
  SV --> CDN
  CP -. Service Worker cache .- CP
```

## 4. Deployment Diagram

```mermaid
flowchart LR
  subgraph Device[Citizen device]
    B[Browser / Installed PWA]
    SW[Service Worker + IndexedDB]
  end
  subgraph Desk[Officer workstation]
    AB[Browser]
  end
  subgraph Edge[Static hosting / CDN]
    C1[Citizen PWA build]
    C2[Admin Portal build]
  end
  subgraph Server[Node host]
    API[Express API :5000]
  end
  DB[(MongoDB Atlas)]
  MEDIA[(Cloudinary)]
  SMS[(SMS / Voice provider)]

  B --> C1
  AB --> C2
  B --> SW
  C1 & C2 -->|/api/v1| API
  API --> DB
  API --> MEDIA
  API --> SMS
```

## 5. Sequence Diagram — Offline complaint + idempotent sync

```mermaid
sequenceDiagram
  actor C as Citizen
  participant PWA as Citizen PWA
  participant IDB as IndexedDB queue
  participant API as Express API
  participant DB as MongoDB

  C->>PWA: Submit complaint (offline)
  PWA->>IDB: enqueue {payload, Idempotency-Key}
  PWA-->>C: "Saved, will send when online"
  Note over PWA: connection restored
  PWA->>API: POST /complaints (Idempotency-Key)
  API->>DB: reserve key + create complaint
  DB-->>API: complaint
  API-->>PWA: 201 {complaintId}
  PWA->>IDB: remove queued item
  Note over PWA,API: replay of same key -> stored response (no duplicate)
```

## 6. Sequence Diagram — Certificate approval

```mermaid
sequenceDiagram
  actor O as Officer
  participant AP as Admin Portal
  participant API as Express API
  participant PDF as PDFKit
  participant CDN as Cloudinary
  participant N as Notification Service

  O->>AP: Approve application
  AP->>API: PATCH /admin/dakhala/:id/approve
  API->>PDF: generate certificate PDF
  PDF-->>API: buffer
  API->>CDN: upload PDF
  CDN-->>API: secure URL
  API->>API: status=Approved, write AuditLog
  API->>N: notifyDakhalaStatus(Approved)
  API-->>AP: 200 {status: Approved}
  N-->>O: (citizen receives in-app + SMS)
```

## 7. Entity-Relationship Diagram

```mermaid
erDiagram
  USER ||--o{ COMPLAINT : files
  USER ||--o{ CERTIFICATE_APPLICATION : applies
  USER ||--o{ TAX_RECORD : owes
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ AUDIT_LOG : acts
  NOTICE ||--o{ NOTIFICATION : broadcasts
  TAX_RECORD ||--o{ PAYMENT : has

  USER {
    ObjectId _id
    string role
    string mobile
    string email
    boolean isActive
  }
  COMPLAINT {
    string complaintId
    string status
    string category
  }
  CERTIFICATE_APPLICATION {
    string applicationId
    string certificateType
    string status
    string pdfUrl
  }
  TAX_RECORD {
    string taxRecordId
    number amount
    number balance
    string paymentStatus
  }
  PAYMENT {
    number amount
    date paidAt
  }
  NOTICE {
    string noticeId
    boolean isPublished
  }
  NOTIFICATION {
    string notificationId
    string channel
    string status
  }
  AUDIT_LOG {
    string action
    string entity
  }
```

## 8. Activity Diagram — Complaint lifecycle

```mermaid
flowchart TD
  A[Citizen opens New Complaint] --> B{Online?}
  B -- No --> Q[Queue in IndexedDB] --> R[Wait for reconnect] --> S[Auto-sync with Idempotency-Key]
  B -- Yes --> C[POST /complaints]
  S --> C
  C --> D[Complaint created: Pending]
  D --> E[Officer reviews]
  E --> F{Decision}
  F -- Work in progress --> G[Status: InProgress] --> E
  F -- Done --> H[Status: Resolved]
  G --> I[Notify citizen]
  H --> I
  I --> J[Citizen sees update + audit logged]
```

## 9. Package Diagram

```mermaid
flowchart TB
  subgraph root[Monorepo npm workspaces]
    subgraph fe[frontend]
      citizen[citizen-pwa]
      admin[admin-portal]
      shared[shared @dgp/shared]
    end
    subgraph be[backend]
      config[config]
      middlewares[middlewares]
      features[features/*]
      utils[utils]
    end
  end
  citizen --> shared
  admin --> shared
  be --> shared
  features --> middlewares
  features --> utils
  middlewares --> config
  features --> config
```
