/**
 * API envelope shapes, documented as JSDoc typedefs so editors still get shape hints
 * without TypeScript. Every backend response and every frontend consumer agree on this.
 *
 * @typedef {Object} ApiErrorDetail
 * @property {string} code
 * @property {string} message
 * @property {Object.<string,string>} [fields]
 *
 * @typedef {Object} PaginationMeta
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 *
 * @typedef {Object} HealthStatus
 * @property {'ok'|'degraded'} status
 * @property {number} uptime
 * @property {string} timestamp
 * @property {string} environment
 * @property {string} version
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} fullName
 * @property {string} [mobile]
 * @property {string} [email]
 * @property {'citizen'|'officer'} role
 * @property {string} [village]
 * @property {string} [address]
 * @property {string} [avatar]
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} AuthResponse
 * @property {User} user
 * @property {string} token
 *
 * @typedef {Object} JwtPayload
 * @property {string} sub  - user id
 * @property {'citizen'|'officer'} role
 * @property {number} iat
 * @property {number} exp
 *
 * @typedef {Object} GeoPoint
 * @property {'Point'} type
 * @property {[number, number]} coordinates  - [longitude, latitude]
 *
 * @typedef {Object} ComplaintRemark
 * @property {string} officerId
 * @property {string} note
 * @property {string} at
 *
 * @typedef {Object} ComplaintStatusEntry
 * @property {'Pending'|'InProgress'|'Resolved'} status
 * @property {string} by
 * @property {string} at
 *
 * @typedef {Object} Complaint
 * @property {string} id
 * @property {string} complaintId  - human id, e.g. CMP-2026-000001
 * @property {string} citizenId
 * @property {'Road'|'WaterSupply'|'Sanitation'|'Electricity'|'Other'} category
 * @property {string} title
 * @property {string} description
 * @property {string[]} images
 * @property {GeoPoint} [location]
 * @property {number} [accuracy]
 * @property {string} [address]
 * @property {string} [ward]
 * @property {'Pending'|'InProgress'|'Resolved'} status
 * @property {'Low'|'Medium'|'High'} priority
 * @property {ComplaintRemark[]} remarks
 * @property {ComplaintStatusEntry[]} statusHistory
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} NoticeBroadcast
 * @property {boolean} sms
 * @property {boolean} voice
 * @property {string} [summary]
 * @property {string} [dispatchedAt]
 * @property {number} [recipientCount]
 *
 * @typedef {Object} Notice
 * @property {string} id
 * @property {string} noticeId  - human id, e.g. NTC-2026-000001
 * @property {string} title
 * @property {string} [summary]
 * @property {string} content
 * @property {'General'|'WaterSupply'|'Electricity'|'Health'|'Event'|'Emergency'|'Tax'|'Other'} category
 * @property {string} [attachmentUrl]
 * @property {'pdf'|'image'} [attachmentType]
 * @property {string} [publishDate]
 * @property {string} [expiryDate]
 * @property {boolean} isPublished
 * @property {boolean} isActive
 * @property {NoticeBroadcast} [broadcast]
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} to
 * @property {'sms'|'voice'} channel
 * @property {'otp'|'complaintUpdate'|'noticeBroadcast'|'dakhalaUpdate'} purpose
 * @property {string} body
 * @property {'queued'|'sent'|'failed'} status
 * @property {string} [error]
 * @property {string} at
 *
 * @typedef {Object} Scheme
 * @property {string} id
 * @property {string} schemeId  - human id, e.g. SCH-2026-000001
 * @property {string} title
 * @property {string} [summary]
 * @property {string} description
 * @property {'Agriculture'|'Health'|'Education'|'Housing'|'Employment'|'Women'|'SeniorCitizen'|'Financial'|'Other'} category
 * @property {string} [eligibility]
 * @property {string[]} [requiredDocuments]
 * @property {string} [benefits]
 * @property {string} [applicationProcess]
 * @property {string} [officialWebsite]
 * @property {string} [imageUrl]
 * @property {string} [publishDate]
 * @property {string} [expiryDate]
 * @property {boolean} isPublished
 * @property {boolean} isActive
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} Payment
 * @property {number} amount
 * @property {string} paidAt
 * @property {string} [receiptNo]
 * @property {string} [mode]
 * @property {string} receivedBy
 *
 * @typedef {Object} TaxHistoryEntry
 * @property {string} action
 * @property {string} [field]
 * @property {*} [old]
 * @property {*} [new]
 * @property {string} by
 * @property {string} at
 *
 * @typedef {Object} TaxRecord
 * @property {string} id
 * @property {string} taxRecordId  - human id, e.g. TAX-2026-000001
 * @property {string} citizenId
 * @property {string} propertyNumber
 * @property {'Property'|'Water'} taxType
 * @property {string} financialYear
 * @property {number} amount
 * @property {number} amountPaid
 * @property {number} balance
 * @property {'Unpaid'|'Partial'|'Paid'} paymentStatus
 * @property {string} [dueDate]
 * @property {Payment[]} payments
 * @property {TaxHistoryEntry[]} history
 * @property {boolean} isActive
 * @property {string} createdBy
 * @property {string} [updatedBy]
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} UploadedDocument
 * @property {string} url
 * @property {'pdf'|'image'} type
 * @property {string} [name]
 *
 * @typedef {Object} DakhalaStatusEntry
 * @property {'Submitted'|'UnderReview'|'Approved'|'Rejected'} status
 * @property {string} by
 * @property {string} at
 * @property {string} [note]
 *
 * @typedef {Object} CertificateApplication
 * @property {string} id
 * @property {string} applicationId  - human id, e.g. DKH-2026-000001
 * @property {string} citizenId
 * @property {'Residence'|'Income'|'Birth'|'Death'|'Character'|'Other'} certificateType
 * @property {Object.<string, any>} applicationData
 * @property {UploadedDocument[]} uploadedDocuments
 * @property {'Submitted'|'UnderReview'|'Approved'|'Rejected'} status
 * @property {string} [rejectionReason]
 * @property {string} [pdfUrl]
 * @property {DakhalaStatusEntry[]} history
 * @property {string} [reviewedBy]
 * @property {boolean} isActive
 * @property {string} createdBy
 * @property {string} [updatedBy]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
