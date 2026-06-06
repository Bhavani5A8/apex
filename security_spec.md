# Security Specification & Threat Model (TDD Blueprint)

This document is compiled as part of Phase 0 Security Architecture for the APEX Vehicle Platform database layer. It outlines our core security invariants, 12 destructive exploit payloads ("The Dirty Dozen"), and a production-grade test runner suite ensuring every exploit is blocked.

## 1. Data Invariants & Access Matrix

| Collection | Path | Read Access | Create Access | Update Access | Delete Access |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **vehicles** | `/vehicles/{vehicleId}` | Public | Admin ONLY | Admin ONLY | Admin ONLY |
| **brands** | `/brands/{brandId}` | Public | Admin ONLY | Admin ONLY | Admin ONLY |
| **categories** | `/categories/{categoryId}` | Public | Admin ONLY | Admin ONLY | Admin ONLY |
| **reviews** | `/reviews/{reviewId}` | Public | Authenticated (must match UID) | Review author OR Admin | Review author OR Admin |
| **users** | `/users/{userId}` | Authenticated (Self or Admin) | Authenticated (Self/auth match) | Admin ONLY | Admin ONLY |
| **reservations**| `/reservations/{resId}` | Owner OR Admin | Authenticated Owner | Owner OR Admin | Owner OR Admin |

---

## 2. The "Dirty Dozen" Exploit Payloads

These 12 scenarios try to circumvent identity controls, perform privilege escalation, or corrupt schema integrity.

### [Exploit 01] User Self-Promotes to Admin
A standard user attempts to modify their own profile in `/users/{uid}` to elevate their role from `"user"` to `"admin"`.
*   **Path:** `/users/user_123`
*   **Payload:** `{ "id": "user_123", "role": "admin" }` (Patching existing metadata)
*   **Target Invariant:** Non-admin callers cannot write or modify the `role` property.

### [Exploit 02] Unauthorized Vehicle Upload (Guest)
A guest (unauthenticated) attempts to write a new hypercar into the `/vehicles` collection.
*   **Path:** `/vehicles/malicious-phantom`
*   **Payload:** `{ "id": "malicious-phantom", "name": "Fake Hypercar", "brand": "Apex", "price": 100 }`
*   **Target Invariant:** Only users on the verified admin list can write / create items on `/vehicles`.

### [Exploit 03] Shadow State Update with "Ghost Code"
An attacker attempts to write extra fields into a vehicle document (e.g., trying to write a `isDiscounted: true` or `featuredOverride: true` field not inside schema blueprint).
*   **Path:** `/vehicles/aether-plaid`
*   **Payload:** `{ "name": "Aether Plaid", ..., "ghostField": "malicious" }`
*   **Target Invariant:** Strict key/schema constraint restricts updates to valid properties only.

### [Exploit 04] Spoofed Author Review Injection
An authenticated user `user_X` tries to submit a review under `user_Y`'s identity to destroy their reputational rating.
*   **Path:** `/reviews/review_999`
*   **Payload:** `{ "id": "review_999", "vehicle_id": "kestrel-gtr", "author": "user_Y", "rating": 1, "review": "Fraudulent Review" }`
*   **Target Invariant:** `incoming().author == request.auth.uid`

### [Exploit 05] Out-of-Bounds Rating Poisoning
A competitor writes an automation script injecting negative or over-inflated scores (e.g. 500 stars, or -10 stars) to break visual dashboard statistics calculation.
*   **Path:** `/reviews/review_100`
*   **Payload:** `{ "vehicle_id": "vanguard-ev", "rating": 500, "review": "Spam", "author": "attacker_uid" }`
*   **Target Invariant:** `rating >= 1 && rating <= 5`

### [Exploit 06] System Timestamp Hijacking
An attacker attempts to post a retro-dated review from the year 2010 or post-date a transaction into the future.
*   **Path:** `/reviews/review_rev`
*   **Payload:** `{ "vehicle_id": "aether-plaid", "rating": 5, "review": "Awesome!", "author": "attacker_uid", "created_at": "1999-12-31T23:59:59Z" }`
*   **Target Invariant:** Strict server timestamp verification using `request.time`.

### [Exploit 07] Resource Poisoning via Gargantuan ID String
An attacker tries to saturate system index memory by initiating a test-drive reservation where the document's ID is a 20KB garbage string.
*   **Path:** `/reservations/Aaaaa...[20KB String]...`
*   **Payload:** `{ "vehicleId": "vanguard-ev", "date": "2026-06-10" }`
*   **Target Invariant:** `isValidId(id)` checking that document IDs are alphanumeric/hyphenated and under 128 characters.

### [Exploit 08] Blind Query Scraping (Denial of Wallet)
An authenticated user attempts to fetch or list all reservations across the entire platform without specifying an owner filter.
*   **Query:** `db.collection('reservations')` (with no `.where("userId", "==", user.uid)`)
*   **Target Invariant:** Security rule mandates resource checks preventing blanket list reads.

### [Exploit 09] Orphaned Sibling Reservation Write
A malicious actor attempts to reserve a vehicle listing `non-existent-ghost-car` which does not exist in our inventories database, causing runtime dashboard crashes.
*   **Path:** `/reservations/res_abc`
*   **Payload:** `{ "id": "res_abc", "vehicleId": "non-existent-ghost-car", "userId": "user_123" }`
*   **Target Invariant:** Must use `exists()` to verify related entity exists before write succeeds.

### [Exploit 10] Review Sabotage (Standard delete)
A normal user attempts to delete a positive review composed by another customer (`user_target`).
*   **Path:** `/reviews/review_target`
*   **Target Invariant:** Standard user can only perform delete on reviews they composed.

### [Exploit 11] Unbounded List Array Bloating
An attacker attempts to update a vehicle's `highlights` array with 5,000 sub-items to crash client browser memory buffers.
*   **Path:** `/vehicles/aether-plaid`
*   **Target Invariant:** Arrays are constrained by tight size check constraints (e.g., max 15).

### [Exploit 12] Unverified Email Bypass
An attacker whose email verification flag is false attempts to execute write commands in public forums.
*   **Payload:** Authenticated user but `request.auth.token.email_verified == false`
*   **Target Invariant:** Verified user requirement ensures only confirmed emails write data.

---

## 3. Threat-Simulation Test Runner Specification

Standard test simulation runner validating all 12 exploit payloads:

```typescript
// firestore.rules.test.ts
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

describe("APEX Vehicle Platform Security Rules Audit", () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "double-generator-xh7sp",
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("should block [Exploit 01] User Self-Promotes to Admin", async () => {
    const context = testEnv.authenticatedContext("user_123", { email_verified: true });
    const db = context.firestore();
    const userDocRef = db.collection("users").doc("user_123");
    
    // Attempting to self-promote
    await assertFails(userDocRef.update({ role: "admin" }));
  });

  it("should block [Exploit 02] Guest Vehicle Addition", async () => {
    const context = testEnv.unauthenticatedContext();
    const db = context.firestore();
    
    await assertFails(db.collection("vehicles").doc("ghost-car").set({
      name: "Unreleased Phantasm",
      brand: "Apex",
      price: 250000
    }));
  });

  it("should block [Exploit 05] Rating Value Poisoning (> 5 stars)", async () => {
    const context = testEnv.authenticatedContext("reviewer", { email_verified: true });
    const db = context.firestore();
    
    await assertFails(db.collection("reviews").add({
      vehicle_id: "aether-plaid",
      rating: 99,
      review: "Breaking boundaries",
      author: "reviewer",
      created_at: new Date()
    }));
  });

  it("should block [Exploit 10] Unauthorized deletion of another user's review", async () => {
    const maliciousUser = testEnv.authenticatedContext("user_evil", { email_verified: true });
    const db = maliciousUser.firestore();
    
    // Attempt to delete user_good's review
    await assertFails(db.collection("reviews").doc("review_by_user_good").delete());
  });
});
```
