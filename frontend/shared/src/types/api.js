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
 */

export {};
